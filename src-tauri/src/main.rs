// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod devnet;
mod shell;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            shell::account_modules,
            shell::publish_to_devnet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
