use crate::modules::kakadu_file_module::PasswordData;
use std::sync::Mutex;

/// Глобальное состояние приложения для хранения и управления данными паролей
///
/// # Структура
/// Содержит защищенный Mutex'ом Option<PasswordData> для:
/// - Потокобезопасного доступа из разных частей приложения
/// - Явного отслеживания состояния инициализации данных
/// - Атомарных операций с данными
pub struct AppState {
    pub password_data: Mutex<Option<PasswordData>>,
}

impl AppState {
    /// Создает новое состояние приложения с пустыми данными
    pub fn new() -> Self {
        Self {
            password_data: Mutex::new(None), // Инициализация пустым состоянием
        }
    }
}

// Реализация трейта Default для удобного создания состояния
impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
