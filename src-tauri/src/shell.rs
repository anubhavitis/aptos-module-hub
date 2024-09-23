use crate::devnet;
use std::{collections::HashMap, io::Write, path::PathBuf, process::Command};

pub const APTOS_MAINNET_PATH: &str = "mainnet";
pub const APTOS_DEVNET_PATH: &str = "devnet";

pub fn cmd_handler_with_prompt(command: String, path: PathBuf) -> Vec<u8> {
    let mut child = Command::new("sh")
        .current_dir(path)
        .arg("-c")
        .arg(command)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .expect("Failed to spawn command");

    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(b"\n")
        .expect("Failed to write to stdin");

    let output = child
        .wait_with_output()
        .expect("Failed to wait for command");
    let output = output.stdout;
    output
}

pub fn cmd_handler(command: String, path: PathBuf) -> Vec<u8> {
    dbg!(
        "Executing command: {}",
        command.clone(),
        " in path: {:?}",
        path.clone()
    );
    let output = Command::new("sh")
        .current_dir(path)
        .arg("-c")
        .arg(command)
        .output()
        .map_err(|e| format!("Error executing command: {}", e))
        .expect("Failed to run the command");

    println!("Command output: {:?}", output);

    if output.status.success() {
        output.stdout
    } else {
        format!(
            "Error executing command: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .as_bytes()
        .to_vec()
    }
}

pub fn download_package(path: &PathBuf, account: String, pkg_name: String) -> bool {
    let cmd: String = format!(
        "aptos move download --account {} --package {} --output-dir ../{}/",
        account, pkg_name, APTOS_DEVNET_PATH
    );

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, path.join(APTOS_MAINNET_PATH));
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    println!("Command response: {}", cmd_resp_str);

    cmd_resp_str.contains("Download succeeded")
}

pub fn publish_package(path: &PathBuf, pkg_name: String) -> String {
    let cmd = format!("aptos move publish --package-dir {} --assume-yes", pkg_name);

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, path.join(APTOS_DEVNET_PATH));
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    cmd_resp_str.to_string()
}

#[tauri::command]
pub fn get_account_details(app_handle: tauri::AppHandle) -> HashMap<String, String> {
    let app_dir = app_handle.path_resolver().app_local_data_dir().unwrap();
    let app_dir = app_dir
        .join("accounts")
        .join(APTOS_DEVNET_PATH)
        .join(".aptos");

    let parsed_toml = devnet::get_toml(&app_dir, "Move.toml").expect("failed to get toml");

    // convert parsed toml to hashmap
    let mut account_details = HashMap::new();
    let details = parsed_toml.as_table().unwrap();
    let profiles = details["profiles"].as_table().unwrap();
    let default = profiles["default"].as_table().unwrap();

    account_details.insert(
        "account".to_string(),
        default["account"].as_str().unwrap().to_string(),
    );
    account_details.insert(
        "public_key".to_string(),
        default["public_key"].as_str().unwrap().to_string(),
    );
    account_details.insert(
        "private_key".to_string(),
        default["private_key"].as_str().unwrap().to_string(),
    );

    account_details
}

#[tauri::command]
pub fn publish_to_devnet(
    app_handle: tauri::AppHandle,
    account: String,
    pkg_name: String,
) -> String {
    let app_dir = app_handle.path_resolver().app_local_data_dir().unwrap();
    let app_dir = app_dir.join("accounts");
    // Download the package
    let downloaded = download_package(&app_dir, account.clone(), pkg_name.clone());
    if !downloaded {
        return "failed to download the package".to_string();
    }

    let resp = devnet::edit_move_toml(&app_dir.join(APTOS_DEVNET_PATH), pkg_name.clone())
        .expect("failed to edit the toml");
    if resp {
        println!("toml edited successfully")
    }

    publish_package(&app_dir, pkg_name)
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn account_modules(app_handle: tauri::AppHandle, account: String) -> Vec<String> {
    let app_dir = app_handle.path_resolver().app_local_data_dir().unwrap();
    let app_dir = app_dir.join("accounts");

    let cmd = format!("aptos move list --account {}", account);
    println!("The command is {:}", cmd.clone());

    // let resp = cmd::cmd_handler(cmd, cmd::APTOS_MAINNET_PATH.to_string());
    let resp = cmd_handler(cmd, app_dir.join(APTOS_MAINNET_PATH));

    let resp_str = String::from_utf8_lossy(&resp);
    let cmd_response: Vec<String> = resp_str.split('\n').map(|line| line.to_string()).collect();

    let mut package = "".to_string();
    let mut modules = "".to_string();

    for items in cmd_response {
        let mut words = items.split_whitespace();
        if let Some(key) = words.next() {
            let values: Vec<String> = words.map(|word| word.to_string()).collect();
            match key {
                "package" => {
                    package = values.join(" ");
                }
                "modules:" => {
                    modules = values.join(" ");
                }
                _ => {}
            }
        }
    }

    return vec![package, modules];
}
