// this hides the console for Windows release builds
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]
  
  use serde::Serialize;
  use tauri::{
    // state is used in Linux
    self, Manager
  };
  use tauri_plugin_store::StoreBuilder;
  use tauri_plugin_window_state;
  use window_shadows::set_shadow;
  
  mod utils;
  
  use utils::{long_running_thread};
  
  #[derive(Clone, Serialize)]
  struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
  }
  
  #[derive(Debug, Default, Serialize)]
  struct Example<'a> {
    #[serde(rename = "Attribute 1")]
    attribute_1: &'a str,
  }
  
  #[tauri::command]
  fn show_main_window(window: tauri::Window) {
    window.get_window("main").unwrap().show().unwrap();
  }
  
  #[cfg(target_os = "linux")]
  pub struct DbusState(Mutex<Option<dbus::blocking::SyncConnection>>);
  
  #[tauri::command]
  fn process_file(filepath: String) -> String {
    println!("Processing file: {}", filepath);
    "Hello from Rust!".into()
  }
  
  #[cfg(target_os = "linux")]
  fn webkit_hidpi_workaround() {
    // See: https://github.com/spacedriveapp/spacedrive/issues/1512#issuecomment-1758550164
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  }
  
  fn main_prelude() {
    #[cfg(target_os = "linux")]
    webkit_hidpi_workaround();
  }
  
  fn main() {
    main_prelude();
    // main window should be invisible to allow either the setup delay or the plugin to show the window
    tauri::Builder::default()
      // custom commands
      .invoke_handler(tauri::generate_handler![
        process_file,
      ])
      // allow only one instance and propagate args and cwd to existing instance
      .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
        app
          .emit_all("newInstance", SingleInstancePayload { args, cwd })
          .unwrap();
      }))
      // persistent storage with filesystem
      .plugin(tauri_plugin_store::Builder::default().build())
      // save window position and size between sessions
      // if you remove this, make sure to uncomment the show_main_window code
      //  in this file and TauriProvider.jsx
      .plugin(tauri_plugin_window_state::Builder::default().build())
      // custom setup code
      .setup(|app| {
        if let Some(window) = app.get_window("main") {
          set_shadow(&window, true).ok(); // don't care if platform is unsupported
        }
  
        #[cfg(target_os = "linux")]
        app.manage(DbusState(Mutex::new(
          dbus::blocking::SyncConnection::new_session().ok(),
        )));
        let app_handle = app.handle();
        tauri::async_runtime::spawn(async move { long_running_thread(&app_handle).await });
  
        Ok(())
      })
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }