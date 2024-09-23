// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod devnet;
mod setup;
mod shell;
/*
Use aptos cli binary from here:
https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.2.0

for macos, you'll have to build your own
*/

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            shell::account_modules,
            shell::publish_to_devnet,
            shell::get_account_details,
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window
                .set_title("Aptos ModHub")
                .expect("failed to set title");

            let somepath = app.path_resolver().app_local_data_dir();
            if let Some(path) = somepath {
                println!("The path is: {:?}", path);
                setup::machine_setup(&path);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
