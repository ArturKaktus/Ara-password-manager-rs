import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface OpenDialogProps {
  visible: boolean;
  password: string;
  setPassword: (value: string) => void;
  onHide: () => void;
  onSubmit: () => void;
}

export function OpenDialog({
  visible,
  password,
  setPassword,
  onHide,
  onSubmit,
}: OpenDialogProps) {
  return (
    <Dialog
      header="ВВЕДИТЕ ПАРОЛЬ"
      visible={visible}
      style={{ width: "25vw" }}
      footer={
        <div>
          <Button
            label="Отмена"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text"
          />
          <Button
            label="Открыть"
            icon="pi pi-check"
            onClick={onSubmit}
            autoFocus
            disabled={!password}
          />
        </div>
      }
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label>Пароль:</label>
          <InputText
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
}
