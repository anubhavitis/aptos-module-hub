// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

mod devnet;
mod setup;
mod shell;
/*
Use aptos cli binary from here:
https://github.com/aptos-labs/aptos-core/releases/tag/aptos-cli-v4.2.0

for macos, you'll have to build your own
*/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            shell::account_modules,
            shell::publish_to_devnet,
            shell::get_account_details,
        ])
        .setup(|app| {
            // let window = app.get_window("main").unwrap();
            // let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
            //     .title("Transparent Titlebar Window")
            //     .inner_size(800.0, 600.0);

            // // set transparent title bar only when building for macOS
            // #[cfg(target_os = "macos")]
            // let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);
            // let window = win_builder.build().unwrap();

            let somepath = app.app_handle().path().app_local_data_dir();
            if let Ok(path) = somepath {
                println!("The path is: {:?}", path);
                setup::machine_setup(&path);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
