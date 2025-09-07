mod commands;
pub mod modules;
mod state;

use modules::com_port::ComPortState;
use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .manage(ComPortState::default())
        .setup(|app| {
            let state = app.state::<ComPortState>();
            modules::com_port::start_com_port_monitor(state.clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app_commands::exit_app,
            commands::file_commands::open_file,
            commands::file_commands::save_file,
            commands::file_commands::get_records_by_group,
            commands::file_commands::delete_record,
            commands::file_commands::get_groups,
            modules::com_port::is_com_connected,
            modules::com_port::get_connected_port_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
