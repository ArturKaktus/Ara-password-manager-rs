use serialport::{available_ports, DataBits, Parity, StopBits};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::State;

#[derive(Default)]
pub struct ComPortState {
    pub is_connected: Arc<Mutex<bool>>,
    pub port_name: Arc<Mutex<String>>,
    pub banned_ports: Arc<Mutex<HashMap<String, Instant>>>,
}

pub fn start_com_port_monitor(state: State<'_, ComPortState>) {
    let is_connected = Arc::clone(&state.is_connected);
    let port_name = Arc::clone(&state.port_name);
    let banned_ports = Arc::clone(&state.banned_ports);

    thread::spawn(move || {
        loop {
            clean_banned_ports(&banned_ports);

            if !*is_connected.lock().unwrap() {
                // Режим поиска нового подключения
                match list_com_ports() {
                    Ok(ports) => {
                        for port in ports {
                            if is_port_banned(&port, &banned_ports) {
                                continue;
                            }

                            if ping_port(&port) {
                                *is_connected.lock().unwrap() = true;
                                *port_name.lock().unwrap() = port.clone();
                                println!("{} connected", port);
                                break;
                            } else {
                                // Бан только для портов, которые никогда не подключались
                                ban_port(&port, &banned_ports, Duration::from_secs(60));
                                println!("Port {} banned for 1 minute", port);
                            }
                        }
                    }
                    Err(e) => println!("Error listing ports: {}", e),
                }
            } else {
                // Режим проверки существующего подключения
                let port = port_name.lock().unwrap().clone();
                if !ping_port(&port) {
                    *is_connected.lock().unwrap() = false;
                    println!("{} disconnected", port);
                    // Не баним порт, который был корректно подключен
                }
            }

            thread::sleep(Duration::from_secs(1));
        }
    });
}

#[tauri::command]
pub fn is_com_connected(state: State<'_, ComPortState>) -> bool {
    *state.is_connected.lock().unwrap()
}

#[tauri::command]
pub fn get_connected_port_name(state: State<'_, ComPortState>) -> String {
    state.port_name.lock().unwrap().clone()
}

fn ping_port(port: &str) -> bool {
    match send_and_receive(&command_to_bytes("cWAY"), port) {
        Ok(_) => true,
        Err(_) => false,
    }
}

// Очистка устаревших записей в бан-листе
fn clean_banned_ports(banned_ports: &Arc<Mutex<HashMap<String, Instant>>>) {
    let mut banned = banned_ports.lock().unwrap();
    let now = Instant::now();
    banned.retain(|_, &mut time| now.duration_since(time) < Duration::from_secs(60));
}

// Проверка, забанен ли порт
fn is_port_banned(port: &str, banned_ports: &Arc<Mutex<HashMap<String, Instant>>>) -> bool {
    let banned = banned_ports.lock().unwrap();
    if let Some(banned_time) = banned.get(port) {
        if banned_time.elapsed() < Duration::from_secs(60) {
            return true;
        }
    }
    false
}

// Добавление порта в бан-лист
fn ban_port(port: &str, banned_ports: &Arc<Mutex<HashMap<String, Instant>>>, duration: Duration) {
    let mut banned = banned_ports.lock().unwrap();
    banned.insert(port.to_string(), Instant::now());
}

fn list_com_ports() -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let ports: Vec<serialport::SerialPortInfo> = available_ports()?;
    let port_names = ports.into_iter().map(|port| port.port_name).collect();
    Ok(port_names)
}

fn send_and_receive(
    send_bytes: &[u8],
    port_name: &str,
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut port = serialport::new(port_name, 115200)
        .data_bits(DataBits::Eight)
        .parity(Parity::None)
        .stop_bits(StopBits::One)
        .timeout(Duration::from_millis(300))
        .open()?;

    port.clear(serialport::ClearBuffer::All)?;
    port.write_all(send_bytes)?;
    port.flush()?;

    let start = Instant::now();
    let timeout = Duration::from_millis(1000);
    let mut received_bytes = Vec::new();

    loop {
        let available = match port.bytes_to_read() {
            Ok(n) => n as usize,
            Err(_) => 0,
        };

        if available > 0 {
            let mut chunk = vec![0; available];
            port.read_exact(&mut chunk)?;
            received_bytes.extend(chunk);
        } else if !received_bytes.is_empty() {
            break;
        }

        if start.elapsed() > timeout {
            if received_bytes.is_empty() {
                return Err("Timeout: no response".into());
            }
            break;
        }

        thread::sleep(Duration::from_millis(10));
    }

    Ok(received_bytes)
}

fn command_to_bytes(command: &str) -> Vec<u8> {
    command.as_bytes().to_vec()
}
