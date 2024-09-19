use crate::devnet;
use std::{io::Write, process::Command};

pub const APTOS_MAINNET_PATH: &str = "../../aptos/module-hub/backend/aptos-prod";
pub const APTOS_DEVNET_PATH: &str = "../../aptos/module-hub/backend/aptos-devnet";

pub fn cmd_handler_with_prompt(command: String, path: String) -> Vec<u8> {
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

pub fn cmd_handler(command: String, path: String) -> Vec<u8> {
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

pub fn download_package(account: String, pkg_name: String) -> bool {
    let cmd = format!(
        "aptos move download --account {} --package {} --output-dir ../aptos-devnet/",
        account, pkg_name
    );

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, APTOS_MAINNET_PATH.to_string());
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    println!("Command response: {}", cmd_resp_str);

    cmd_resp_str.contains("Download succeeded")
}

pub fn publish_package(pkg_name: String) -> String {
    let cmd = format!("aptos move publish --package-dir {} --assume-yes", pkg_name);

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, APTOS_DEVNET_PATH.to_string());
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    cmd_resp_str.to_string()
}

#[tauri::command]
pub fn publish_to_devnet(account: String, pkg_name: String) -> String {
    /*
    1. download the package
    2. edit the toml file for account and dependecies
    3. publish the package
     */

    println!("{}, {}", account.clone(), pkg_name.clone());

    // Download the package
    let downloaded = download_package(account.clone(), pkg_name.clone());
    if !downloaded {
        return "failed to download the package".to_string();
    }

    let resp = devnet::edit_move_toml(pkg_name.clone()).expect("failed to edit the toml");
    if resp {
        println!("toml edited successfully")
    }

    //aptos move publish --package-dir AptCasino --assume-yes

    publish_package(pkg_name)
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn account_modules(account: String) -> Vec<String> {
    let cmd = format!("aptos move list --account {}", account);
    println!("The command is {:}", cmd.clone());

    // let resp = cmd::cmd_handler(cmd, cmd::APTOS_MAINNET_PATH.to_string());
    let resp = cmd_handler(cmd, APTOS_MAINNET_PATH.to_string());

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
