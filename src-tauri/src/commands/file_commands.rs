use crate::modules::kakadu_file_module::{KakaduProvider, Record, Group};
use crate::state::AppState;
use tauri::{AppHandle, Emitter};

/// Открывает и парсит файл с данными, сохраняет в состоянии и отправляет группы на фронтенд
///
/// # Аргументы
/// * `app` - экземпляр AppHandle для взаимодействия с Tauri
/// * `path` - путь к файлу для открытия
/// * `state` - глобальное состояние приложения
///
/// # Ошибки
/// Возвращает String с описанием ошибки при проблемах с чтением файла или отправкой событий
#[tauri::command]
pub async fn open_file(
    app: AppHandle,
    path: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let provider = KakaduProvider;
    println!("OPEN");
    match provider.open_file(path) {
        Ok(data) => {
            // Блокируем и обновляем состояние атомарно
            *state.password_data.lock().unwrap() = Some(data.clone());

            // Отправка групп через Tauri-событие на фронтенд
            app.emit("get_groups_listen", &data.groups)
                .map_err(|e| format!("Ошибка отправки групп: {}", e))?;

            Ok(())
        }
        Err(e) => Err(format!("Ошибка обработки файла: {}", e)),
    }
}

/// Сохраняет текущие данные в указанный файл
///
/// # Аргументы
/// * `path` - целевой путь для сохранения
/// * `state` - глобальное состояние с данными
///
/// # Ошибки
/// Возвращает ошибку если: нет данных для сохранения или произошла ошибка записи
#[tauri::command]
pub async fn save_file(path: String, state: tauri::State<'_, AppState>) -> Result<(), String> {
    let provider = KakaduProvider;
    let data = state.password_data.lock().unwrap();

    match &*data {
        Some(data) => provider
            .save_file(path, data)
            .map_err(|e| format!("Ошибка сохранения файла: {}", e)),
        None => Err("Отсутствуют данные для сохранения".to_string()),
    }
}

/// Получает записи по ID группы и отправляет на фронтенд
///
/// # Аргументы
/// * `app` - экземпляр AppHandle для эмита событий
/// * `group_id` - идентификатор группы для фильтрации
/// * `state` - глобальное состояние приложения
///
/// # Ошибки
/// Возвращает ошибку если данные не загружены
#[tauri::command]
pub async fn get_records_by_group(
    app: AppHandle,
    group_id: u32,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let data = state.password_data.lock().unwrap();

    let records = match &*data {
        Some(data) => data
            .records
            .iter()
            .filter(|r| r.pid == group_id)
            .cloned()
            .collect::<Vec<Record>>(),
        None => return Err("Данные не загружены в систему".to_string()),
    };

    app.emit("get_records_listen", &records)
        .map_err(|e| format!("Ошибка отправки записей: {}", e))?;

    Ok(())
}

/// Удаляет запись по ID и возвращает ID удаленной записи
///
/// # Аргументы
/// * `record_id` - ID записи для удаления
/// * `state` - глобальное состояние приложения
///
/// # Возвращает
/// ID удаленной записи при успехе
///
/// # Ошибки
/// Возвращает ошибку если: данные не загружены или запись не найдена
#[tauri::command]
pub async fn delete_record(
    record_id: u32,
    state: tauri::State<'_, AppState>,
) -> Result<u32, String> {
    let mut data = state.password_data.lock().unwrap();

    match data.as_mut() {
        Some(data) => data
            .records
            .iter()
            .position(|r| r.id == record_id)
            .map(|index| {
                data.records.remove(index);
                record_id
            })
            .ok_or_else(|| "Запись с указанным ID не найдена".to_string()),
        None => Err("Данные не инициализированы".to_string()),
    }
}

#[tauri::command]
pub async fn new_group(
    group_id: u32,
    group_name: String,
    state: tauri::State<'_, AppState>,
) -> Result<Group, String> {
    let mut data = state.password_data.lock().unwrap();
    match data.as_mut() {
        Some(data) => {
            // Объединяем ID групп и записей и находим максимальный
            let new_id = data.groups
                .iter()
                .map(|g| g.id)
                .chain(data.records.iter().map(|r| r.id))
                .max()
                .unwrap_or(0) + 1;

            let new_group = Group {
                id: new_id,
                pid: group_id,
                name: group_name,
            };

            data.groups.push(new_group.clone());
            Ok(new_group)
        },
        None => Err("Данные не инициализированы".to_string()),
    }
}

#[tauri::command]
pub async fn edit_group(
    group_id: u32,
    new_name: String,
    state: tauri::State<'_, AppState>,
) -> Result<Group, String> {
    let mut data = state.password_data.lock().unwrap();
    match data.as_mut() {
        Some(data) => {
            data.groups
                .iter_mut()
                .find(|g| g.id == group_id)
                .map(|group| {
                    group.name = new_name.clone();
                    group.clone()
                })
                .ok_or_else(|| "Группа с указанным ID не найдена".to_string())
        },
        None => Err("Данные не инициализированы".to_string()),
    }
}

#[tauri::command]
pub async fn delete_group(
    group_id: u32,
    state: tauri::State<'_, AppState>,
) -> Result<u32, String> {
    let mut data = state.password_data.lock().unwrap();
    match data.as_mut() {
        Some(data) => data
            .groups
            .iter()
            .position(|g| g.id == group_id)
            .map(|index| {
                data.groups.remove(index);
                group_id
            })
            .ok_or_else(|| "Группа с указанным ID не найдена".to_string()),
        None => Err("Данные не инициализированы".to_string()),
    }
}

#[tauri::command]
pub async fn get_groups(
    app: AppHandle,
    state: tauri::State<'_, AppState>) -> Result<(), String>{
    let data = state.password_data.lock().unwrap();

    let groups = match &*data {
        Some(data) => data
            .groups
            .iter()
            .cloned()
            .collect::<Vec<Group>>(),
        None => return Err("Данные не загружены в систему".to_string()),
    };

    app.emit("get_groups_listen", &groups)
        .map_err(|e| format!("Ошибка отправки записей: {}", e))?;

    Ok(())
}