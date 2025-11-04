use crate::modules::kakadu_file_module::{Group, PasswordData};
use crate::utils::emit_event;
use std::sync::Mutex;
use tauri::AppHandle;

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
    /// Создает новое состояние приложения с корневой группой
    pub fn new() -> Self {
        Self {
            password_data: Mutex::new(Some(PasswordData {
                groups: vec![Self::create_root_group()],
                records: Vec::new(),
            })),
        }
    }

    /// Создает корневую группу
    fn create_root_group() -> Group {
        Group {
            id: 1,
            pid: 0,
            name: "NewDatabase".to_string()
        }
    }

    /// Очищает список групп, оставляя только корневую, и отправляет список на фронтенд
    pub fn clear_group_list(&self, app: &tauri::AppHandle) -> Result<(), String> {
        let mut password_data = self.password_data.lock()
            .map_err(|e| format!("Ошибка блокировки Mutex: {}", e))?;

        // Теперь мы уверены, что данные есть, так как инициализируются в new()
        let data = password_data.as_mut().unwrap();
        data.groups.clear();
        data.groups.push(Self::create_root_group());

        // Отправляем обновлённый список на фронтенд
        emit_event(&app, "get_groups_listen", &data.groups, "Ошибка отправки групп")?;

        Ok(())
    }
}
