import { save } from "@tauri-apps/plugin-dialog";

export async function handleSave(
  setFileToSave: (file: string) => void,
  setDialogVisible: (visible: boolean) => void
) {
  const file = await save({
    filters: [{ name: "Kakadu File", extensions: ["kkd"] }],
  });

  if (file) {
    setFileToSave(file);
    setDialogVisible(true);
  }
}