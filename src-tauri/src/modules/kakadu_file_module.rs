use aes::cipher::{generic_array::GenericArray, BlockDecrypt, BlockEncrypt, KeyInit};
use aes::Aes256;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::error::Error;
use std::fs;

/// Символы ввода для автозаполнения форм
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "UPPERCASE")] // Сериализация в верхнем регистре для совместимости
pub enum InputSymbol {
    Tab,   // Клавиша Tab
    Enter, // Клавиша Enter
    Space, // Пробел
    None,  // Отсутствие специального символа
}

/// Группа паролей (категория)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Group {
    pub id: u32,      // Уникальный идентификатор группы
    pub pid: u32,     // Идентификатор родительской группы
    pub name: String, // Название группы
}

/// Запись с данными пароля
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Record {
    pub id: u32,          // Уникальный идентификатор записи
    pub pid: u32,         // Идентификатор родительской группы
    pub name: String,     // Название записи
    pub login: String,    // Логин
    pub password: String, // Пароль
    pub url: String,      // URL сайта

    #[serde(rename = "loginSymbol")]
    pub login_symbol: InputSymbol, // Символ после логина

    #[serde(rename = "passwordSymbol")]
    pub password_symbol: InputSymbol, // Символ после пароля

    #[serde(rename = "urlSymbol")]
    pub url_symbol: InputSymbol, // Символ после URL
}

/// Основная структура данных паролей
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PasswordData {
    pub groups: Vec<Group>,   // Список групп
    pub records: Vec<Record>, // Список записей
}

/// Провайдер для работы с зашифрованными файлами паролей
pub struct KakaduProvider;

impl KakaduProvider {
    /// Открывает и расшифровывает файл с паролями
    ///
    /// # Аргументы
    /// * `path` - путь к файлу
    ///
    /// # Возвращает
    /// Result с PasswordData или ошибкой
    pub fn open_file(&self, path: String) -> Result<PasswordData, Box<dyn Error>> {
        // Временный хардкод пароля (в production должен заменяться реальным вводом)
        let password = "123456789aA";

        // Чтение зашифрованных данных из файла
        let encrypted_data = fs::read(&path)?;

        // Расшифровка данных
        let decrypted_data = Self::decrypt_data(&encrypted_data, password)?;

        // Десериализация JSON
        let password_data: PasswordData = serde_json::from_slice(&decrypted_data)?;

        Ok(password_data)
    }

    /// Расшифровывает данные с помощью AES-256
    fn decrypt_data(source_array: &[u8], password: &str) -> Result<Vec<u8>, Box<dyn Error>> {
        // Генерация 256-битного ключа из пароля с помощью SHA-256
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let key = hasher.finalize();

        // Инициализация AES-256 дешифратора
        let cipher = Aes256::new_from_slice(&key)?;

        let block_size = 16; // AES block size (128 бит)
        let mut decrypted = Vec::with_capacity(source_array.len());

        // Обработка данных блоками
        for chunk in source_array.chunks(block_size) {
            let mut block = GenericArray::clone_from_slice(chunk);
            cipher.decrypt_block(&mut block);
            decrypted.extend_from_slice(&block);
        }

        // Удаление PKCS7 padding
        Self::remove_padding(&mut decrypted, block_size);

        Ok(decrypted)
    }

    /// Сохраняет данные паролей в зашифрованный файл
    pub fn save_file(&self, path: String, data: &PasswordData) -> Result<(), Box<dyn Error>> {
        // Временный хардкод пароля
        let password = "123456789aA";

        // Сериализация в JSON
        let json_data = serde_json::to_vec(data)?;

        // Шифрование данных
        let encrypted_data = Self::encrypt_data(&json_data, password)?;

        // Запись в файл
        fs::write(path, encrypted_data)?;

        Ok(())
    }

    /// Шифрует данные с помощью AES-256
    fn encrypt_data(source_data: &[u8], password: &str) -> Result<Vec<u8>, Box<dyn Error>> {
        // Генерация ключа (аналогично decrypt_data)
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let key = hasher.finalize();

        let cipher = Aes256::new_from_slice(&key)?;
        let block_size = 16;

        // Добавление PKCS7 padding
        let mut padded_data = source_data.to_vec();
        Self::add_padding(&mut padded_data, block_size);

        let mut encrypted = Vec::with_capacity(padded_data.len());

        // Шифрование блоков
        for chunk in padded_data.chunks(block_size) {
            let mut block = GenericArray::clone_from_slice(chunk);
            cipher.encrypt_block(&mut block);
            encrypted.extend_from_slice(&block);
        }

        Ok(encrypted)
    }

    /// Добавляет PKCS7 padding к данным
    fn add_padding(data: &mut Vec<u8>, block_size: usize) {
        let pad_len = block_size - (data.len() % block_size);
        data.extend(vec![pad_len as u8; pad_len]);
    }

    /// Удаляет PKCS7 padding из данных
    fn remove_padding(data: &mut Vec<u8>, block_size: usize) {
        if let Some(&last_byte) = data.last() {
            if last_byte <= block_size as u8 {
                let pad_len = last_byte as usize;
                if data.len() >= pad_len {
                    let padding_ok = data[data.len() - pad_len..].iter().all(|&b| b == last_byte);

                    if padding_ok {
                        data.truncate(data.len() - pad_len);
                    }
                }
            }
        }
    }
}
