// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::create_dir_all, path::PathBuf};

use tauri::Manager;

mod devnet;
mod shell;

/*
Use aptos cli binary from here:
https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.2.0

for macos, you'll have to build your own

For local path:
let somepath = app.path_resolver().app_local_data_dir()
*/

fn create_account(path: &PathBuf, account: String) {
    let account_dir = path.join(format!("accounts/{}", account));
    if !account_dir.exists() {
        println!("Creating {} directory", account);
        create_dir_all(&account_dir).expect(&format!("Failed to create {} directory", account))
    }

    let aptos_dir: PathBuf = account_dir.join(".aptos");
    if aptos_dir.exists() {
        println!(".aptos directory exists in {} path", account);
        return;
    }

    println!("Creating .aptos directory in {} path", account);
    let output = shell::cmd_handler_with_prompt(
        "aptos init --network ".to_string() + &account,
        account_dir.as_path().to_str().unwrap().to_string(),
    );
    println!("Command output: {:?}", String::from_utf8_lossy(&output));
}

fn setup(path: &PathBuf) {
    create_account(path, "devnet".to_string());
    println!("#########\n\n########");
    create_account(path, "mainnet".to_string());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            shell::account_modules,
            shell::publish_to_devnet
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window
                .set_title("Aptos ModHub")
                .expect("failed to set title");

            let somepath = app.path_resolver().app_local_data_dir();
            if let Some(path) = somepath {
                println!("The path is: {:?}", path);
                setup(&path);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
