use tauri::Manager;

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
    
    // String::from_utf8_lossy(&output.stdout).to_string()

    

    // if output.status.success() {
    //     output.stdout
    // } else {
    //     format!(
    //         "Error executing command: {}",
    //         String::from_utf8_lossy(&output.stderr)
    //     )
    //     .as_bytes()
    //     .to_vec()
    // }
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

pub fn publish_package_skip(path: &PathBuf, pkg_name: String) -> String {
    let cmd = format!(
        "aptos move publish --package-dir {} --assume-yes --skip-fetch-latest-git-dep",
        pkg_name
    );

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, path.join(APTOS_DEVNET_PATH));
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    cmd_resp_str.to_string()
}

pub fn publish_package(path: &PathBuf, pkg_name: String) -> String {
    let cmd = format!("aptos move publish --package-dir {} --assume-yes", pkg_name);

    println!("{}", cmd);

    let cmd_resp = cmd_handler(cmd, path.join(APTOS_DEVNET_PATH));
    let cmd_resp_str = String::from_utf8_lossy(&cmd_resp);
    cmd_resp_str.to_string()
}

#[tauri::command]
pub async fn get_account_details(app_handle: tauri::AppHandle) -> HashMap<String, String> {
    let app_dir = app_handle.path().app_local_data_dir().unwrap();
    let app_dir = app_dir.join("accounts").join(APTOS_DEVNET_PATH);

    let account_details = devnet::get_devnet_account(&app_dir).expect("failed to get toml");

    account_details
}

#[tauri::command]
pub async fn publish_to_devnet(
    app_handle: tauri::AppHandle,
    account: String,
    pkg_name: String,
) -> String {
    let app_dir = app_handle.path().app_local_data_dir().unwrap();
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

    let mut publish_resp = publish_package(&app_dir, pkg_name.clone());
    println!("publish_resp: {}", publish_resp.clone());
    // check if "Unable to resolve packages" exists in publish_resp
    if publish_resp.contains("Unable to resolve packages") {
        publish_resp = publish_package_skip(&app_dir, pkg_name.clone());
    }

    /*Previously installed CLI version 4.2.3, checking for updates CLI is up to date package size 13500 bytes
    { "Result": { "transaction_hash": "0x42cd9470c4286951119c095fe8ce7854c366306b4bd152b5fef2aeca66b51b41", "gas_used": 88, "gas_unit_price": 100, "sender": "516e4c995b2980e4686e7863863df53fadb8e0e1422f63e2a0c5799870adab99", "sequence_number": 1, "success": true, "timestamp_us": 1728665926233725, "version": 9560896, "vm_status": "Executed successfully" } } */

    // remove content of publish_resp till first {
    let resp = publish_resp.split('{').collect::<Vec<&str>>().join("{");
    resp
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub async fn account_modules(app_handle: tauri::AppHandle, account: String) -> Vec<String> {
    let app_dir = app_handle.path().app_local_data_dir().unwrap();
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
