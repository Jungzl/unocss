use std::{env, fs};
use zed_extension_api::{self as zed, Result};

struct UnocssExtension {
    did_find_server: bool,
}

impl UnocssExtension {
    fn server_exists(&self) -> bool {
        fs::metadata("node_modules/.bin/unocss-language-server")
            .or_else(|_| {
                fs::metadata("node_modules/@unocss/language-server/bin/unocss-language-server.js")
            })
            .map(|stat| stat.is_file())
            .unwrap_or(false)
    }

    fn server_script_path(&self) -> String {
        String::from("node_modules/@unocss/language-server/bin/unocss-language-server.js")
    }
}

impl zed::Extension for UnocssExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        if !self.server_exists() {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );

            // Install latest version from npm
            let result = zed::npm_install_package("@unocss/language-server", "latest");

            match result {
                Ok(_) => {
                    self.did_find_server = true;
                }
                Err(error) => {
                    zed::set_language_server_installation_status(
                        language_server_id,
                        &zed::LanguageServerInstallationStatus::Failed(error.clone()),
                    );
                    return Err(error);
                }
            }
        }

        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::None,
        );

        let node_path = zed::node_binary_path()?;
        let server_path = self.server_script_path();

        Ok(zed::Command {
            command: node_path,
            args: vec![
                env::current_dir()
                    .unwrap()
                    .join(&server_path)
                    .to_string_lossy()
                    .to_string(),
                "--stdio".to_string(),
            ],
            env: Default::default(),
        })
    }

    fn language_server_initialization_options(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        Ok(Some(zed::serde_json::json!({})))
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        let settings = zed::settings::LspSettings::for_worktree("unocss", worktree)?;

        Ok(Some(zed::serde_json::json!({
            "unocss": settings
        })))
    }
}

zed::register_extension!(UnocssExtension);
