use serde::Serialize;
use tauri::{AppHandle, Emitter};

pub fn emit_event<T: Serialize>(
    app: &AppHandle,
    event: &str,
    data: &T,
    error_text: &str,
) -> Result<(), String> {
    app.emit(event, data)
        .map_err(|e| format!("{}: {}", error_text, e))
}


