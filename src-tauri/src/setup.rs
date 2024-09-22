use std::{fs::create_dir_all, path::PathBuf};

use crate::shell;

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
    let output =
        shell::cmd_handler_with_prompt("aptos init --network ".to_string() + &account, account_dir);
    println!("Command output: {:?}", String::from_utf8_lossy(&output));
}

fn install_brew() {
    let output = shell::cmd_handler("brew --version".to_string(), PathBuf::new());
    let output_str = String::from_utf8_lossy(&output);

    dbg!(output_str.clone());
    if output_str.contains("command not found") {
        println!("since brew not found, installing brew");
        let command = r#"/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)""#;
        let output = shell::cmd_handler(command.to_string(), PathBuf::new());
        println!("Command output: {:?}", String::from_utf8_lossy(&output));
    } else {
        println!("brew already installed");
    }
}

fn install_aptos() {
    let output = shell::cmd_handler("aptos --version".to_string(), PathBuf::from("/"));
    let output_str = String::from_utf8_lossy(&output);

    dbg!(output_str.clone());
    if output_str.contains("command not found") {
        println!("Since aptos not found, installing aptos");
        install_brew();
        let output = shell::cmd_handler("brew install aptos".to_string(), PathBuf::from("/"));
        println!("Command output: {:?}", String::from_utf8_lossy(&output));
    } else {
        println!("aptos already installed");
    }
}

pub fn machine_setup(path: &PathBuf) {
    install_aptos();
    create_account(path, "devnet".to_string());
    println!("#########\n\n########");
    create_account(path, "mainnet".to_string());
}
