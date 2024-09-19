use serde::{Deserialize, Serialize};
use serde_yaml;
use std::fs;
use std::fs::File;
use std::io::{Error, ErrorKind, Read};
use std::path::PathBuf;
use toml::{Table, Value};

#[derive(Debug, Serialize, Deserialize)]
struct Profiles {
    profiles: ProfileMap,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProfileMap {
    default: Profile,
}

#[derive(Debug, Serialize, Deserialize)]
struct Profile {
    network: String,
    private_key: String,
    public_key: String,
    account: String,
    rest_url: String,
    faucet_url: String,
}

fn read_yaml(file_path: &PathBuf) -> Result<Profiles, serde_yaml::Error> {
    let mut file = File::open(file_path).expect("Unable to open file");
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .expect("Unable to read file");
    let profiles: Profiles = serde_yaml::from_str(&contents)?;
    Ok(profiles)
}

pub fn get_devnet_account(path: &PathBuf) -> Result<String, Error> {
    let yaml_loc = path.join(".aptos").join("config.yaml");
    let yaml_resp = read_yaml(&yaml_loc);
    match yaml_resp {
        Ok(profiles) => {
            println!("Read YAML: {:?}", profiles);
            Ok(profiles.profiles.default.account)
        }
        Err(e) => Err(Error::new(ErrorKind::Other, e)),
    }
}

pub fn update_account_in_toml(account: String, toml: &mut Value) -> Result<(), Error> {
    let addresses = toml.get_mut("addresses").expect("Address not found");

    let address_map = addresses
        .as_table_mut()
        .expect("key-value not found for addresses");

    let first_key = address_map
        .keys()
        .next()
        .expect("error in finding key in addresses")
        .clone();

    address_map
        .insert(first_key.clone(), Value::String(account))
        .expect("failed to update the value");

    Ok(())
}

pub fn remove_existing_aptos_dependency(toml: &mut Value) -> Result<(), Error> {
    let dependency = toml
        .get_mut("dependencies")
        .expect("dependencies not found");

    // removing AptosFramework from dependencies
    let aptos_framework_key = "AptosFramework";
    let removed_key = dependency
        .as_table_mut()
        .expect("failed to get map of dependencies")
        .remove(aptos_framework_key)
        .expect("failed to get new Value");

    println!("aptosFramework removed from dependency: {}", removed_key);
    // removing dependencies.AptosFramework if exists

    if let Some(_) = toml.get_mut("dependencies.AptosFramework") {
        let new_toml = toml
            .as_table_mut()
            .expect("failed to get dependencies.AptosFramework from toml")
            .remove("dependencies.AptosFramework")
            .expect("failed to remove existing dependencies.AptosFramework config");

        println!(
            "removed dependencies.AptosFramework from toml as well: {}",
            new_toml
        )
    }

    Ok(())
}

pub fn add_aptos_framework_dependecies(toml: &mut Value) -> Result<(), Error> {
    // if AptosFramework in dependencies, remove it.
    remove_existing_aptos_dependency(toml);

    let mut injection_value = Value::Table(Table::new());
    injection_value.as_table_mut().unwrap().insert(
        "git".to_string(),
        Value::String("https://github.com/aptos-labs/aptos-core.git".to_string()),
    );
    injection_value
        .as_table_mut()
        .unwrap()
        .insert("rev".to_string(), Value::String("mainnet".to_string()));
    injection_value.as_table_mut().unwrap().insert(
        "subdir".to_string(),
        Value::String("aptos-move/framework/aptos-framework".to_string()),
    );

    println!("injection value {}", injection_value);

    toml.as_table_mut()
        .unwrap()
        .insert("dependencies.AptosFramework".to_string(), injection_value);

    Ok(())
}

pub fn edit_move_toml(path: &PathBuf, pkg_name: String) -> Result<bool, Error> {
    let account_address = get_devnet_account(path).expect("failed to get account address");

    let toml_path = path.join(pkg_name).join("Move.toml");
    println!("toml Path is {:?}", toml_path);

    let file = fs::read_to_string(toml_path.clone()).expect("Failed to open the file");
    let mut toml_parsed: Value = file.parse().expect("Failed to parse toml file");

    // Add account to the toml file
    update_account_in_toml(account_address.clone(), &mut toml_parsed)
        .expect("Failed to add account address to the toml");

    // Add the dependencies
    match add_aptos_framework_dependecies(&mut toml_parsed) {
        Ok(()) => {
            println!("\nnew updated toml is : {}", toml_parsed);
        }
        Err(e) => {
            println!("Errow while updating toml {:?}", e);
        }
    }

    // update the actual toml with new toml
    let mut toml_string =
        toml::to_string(&toml_parsed).expect("failed to get toml string for new toml");

    toml_string = toml_string.replace("[\"", "[").replace("\"]", "]");
    println!("toml string is: {}", toml_string);
    fs::write(toml_path.clone(), toml_string).expect("Failed to write to the file");

    return Ok(true);
}
