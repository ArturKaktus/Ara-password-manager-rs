import { open } from "@tauri-apps/plugin-dialog";

export async function handleOpen(
  setFileToOpen: (file: string) => void,
  setDialogVisible: (visible: boolean) => void
) {
  const file = await open({
    filters: [{ name: "Kakadu File", extensions: ["kkd"] }],
    multiple: false,
    directory: false,
  });

  if (file) {
    setFileToOpen(file);
    setDialogVisible(true);
  }
}