import "./MenuStrip.css";
import { useState, useEffect } from "react";
import { Menubar } from "primereact/menubar";
import { PrimeIcons } from "primereact/api";
import { invoke } from "@tauri-apps/api/core";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

import { handleNew } from "./handlers/HandleNew";
import { handleExit } from "./handlers/HandleExit";
import { handleOpen } from "./handlers/HandleOpen";
import { handleSave } from "./handlers/HandleSave";
import { SaveDialog } from "./dialogs/SaveDialog";
import { OpenDialog } from "./dialogs/OpenDialog";

export default function MenuStripComponent() {
  // Состояния для SaveDialog
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [savePassword, setSavePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fileToSave, setFileToSave] = useState<string | null>(null);
  const [validation, setValidation] = useState({
    isValid: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    isLengthValid: false,
  });

  // Состояния для OpenDialog
  const [openDialogVisible, setOpenDialogVisible] = useState(false);
  const [openPassword, setOpenPassword] = useState("");
  const [fileToOpen, setFileToOpen] = useState<string | null>(null);

  // Валидация пароля для сохранения
  useEffect(() => {
    const hasNumber = /\d/.test(savePassword);
    const hasLowercase = /[a-z]/.test(savePassword);
    const hasUppercase = /[A-Z]/.test(savePassword);
    const isLengthValid =
      savePassword.length >= 10 && savePassword.length <= 19;

    setValidation({
      isValid: hasNumber && hasLowercase && hasUppercase && isLengthValid,
      hasNumber,
      hasLowercase,
      hasUppercase,
      isLengthValid,
    });
  }, [savePassword]);

  const passwordsMatch = validation.isValid && savePassword === confirmPassword;

  const resetSaveDialog = () => {
    setSavePassword("");
    setConfirmPassword("");
    setFileToSave(null);
    setSaveDialogVisible(false);
  };

  const resetOpenDialog = () => {
    setOpenPassword("");
    setFileToOpen(null);
    setOpenDialogVisible(false);
  };

  let items = [
    {
      label: "Файл",
      items: [
        {
          label: "Новый",
          icon: PrimeIcons.PLUS,
          command: () => handleNew()
        },
        {
          label: "Открыть",
          icon: PrimeIcons.FOLDER_OPEN,
          command: () => handleOpen(setFileToOpen, setOpenDialogVisible),
        },
        {
          label: "Сохранить",
          icon: PrimeIcons.SAVE,
          command: () => handleSave(setFileToSave, setSaveDialogVisible),
        },
        {
          label: "Выход",
          icon: PrimeIcons.BAN,
          command: () => handleExit(),
        },
      ],
    },
    {
      label: "Устройство",
      items: [
        {
          label: "Загрузить",
          icon: PrimeIcons.UPLOAD,
          command: () => {
            window.location.hash = "/";
          },
        },
        {
          label: "Сохранить",
          icon: PrimeIcons.DOWNLOAD,
        },
      ],
    },
  ];

  return (
    <>
      <ConfirmDialog />
      {/* <Dialog
        header="Введите пароль"
        visible={passwordDialogVisible}
        style={{ width: "25vw" }}
        footer={passwordDialogFooter}
        onHide={resetPasswordDialog}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="password">Пароль</label>
            <InputText
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="mt-2"
            />
          </div>
        </div>
      </Dialog> */}
      <SaveDialog
        visible={saveDialogVisible}
        password={savePassword}
        confirmPassword={confirmPassword}
        validation={validation}
        passwordsMatch={passwordsMatch}
        setPassword={setSavePassword}
        setConfirmPassword={setConfirmPassword}
        onHide={resetSaveDialog}
        onSubmit={async () => {
          if (fileToSave && passwordsMatch) {
            // // Логика сохранения
            // await invoke("save_file", {
            //   path: fileToOpen,
            //   password: openPassword,
            // });
            // console.log("Saving file:", fileToSave);
            // resetSaveDialog();
            try {
              await invoke("save_file", {
                path: fileToSave,
                password: savePassword,
              });
              resetSaveDialog();
            } catch (error) {
              console.error("Ошибка при сохранении файла:", error);
            }
          }
        }}
      />

      <OpenDialog
        visible={openDialogVisible}
        password={openPassword}
        setPassword={setOpenPassword}
        onHide={resetOpenDialog}
        onSubmit={async () => {
          if (fileToOpen && openPassword) {
            try {
              await invoke("open_file", {
                path: fileToOpen,
                password: openPassword,
              });
              resetOpenDialog();
            } catch (error) {
              console.error("Ошибка при открытии файла:", error);
              // Можно добавить отображение ошибки пользователю
              confirmDialog({
                message: "Неверный пароль или повреждённый файл",
                header: "Ошибка",
                icon: "pi pi-exclamation-triangle",
                acceptLabel: "OK",
              });
            }
          }
        }}
      />

      <Menubar model={items} />
    </>
  );
}
