import { save } from "@tauri-apps/plugin-dialog";

export async function handleSave(
    setFileToSave: (file: string) => void,
    setDialogVisible: (visible: boolean) => void
) {
  const filter = { name: "Kakadu File", extensions: ["kkd"] };
  const file = await save({
    filters: [filter],
  });

  if (file) {
    let finalFile = file;

    // Проверяем, есть ли у файла расширение из текущего фильтра
    const hasCorrectExtension = filter.extensions.some(ext =>
        file.toLowerCase().endsWith(`.${ext}`)
    );

    // Если нет правильного расширения, добавляем первое из списка
    if (!hasCorrectExtension) {
      finalFile = `${file}.${filter.extensions[0]}`;
    }

    setFileToSave(finalFile);
    setDialogVisible(true);
  }
}