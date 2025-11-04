import { invoke } from "@tauri-apps/api/core";

export async function handleNew(): Promise<void> {
  await invoke("new_file");
}