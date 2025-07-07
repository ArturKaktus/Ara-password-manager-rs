import { confirmDialog } from "primereact/confirmdialog";
import { invoke } from "@tauri-apps/api/core";

export async function handleExit(): Promise<void> {
  const confirmed = await new Promise<boolean>((resolve) => {
    confirmDialog({
      message: "Вы уверены, что хотите выйти?",
      header: "Подтверждение",
      icon: "pi pi-exclamation-triangle",
      accept: () => resolve(true),
      reject: () => resolve(false),
      acceptLabel: "Да",
      rejectLabel: "Нет",
    });
  });

  if (confirmed) await invoke("exit_app");
}