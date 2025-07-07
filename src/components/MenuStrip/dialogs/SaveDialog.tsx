import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface SaveDialogProps {
  visible: boolean;
  password: string;
  confirmPassword: string;
  validation: {
    isValid: boolean;
    hasNumber: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    isLengthValid: boolean;
  };
  passwordsMatch: boolean;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  onHide: () => void;
  onSubmit: () => void;
}

export function SaveDialog({
  visible,
  password,
  confirmPassword,
  validation,
  passwordsMatch,
  setPassword,
  setConfirmPassword,
  onHide,
  onSubmit,
}: SaveDialogProps) {
  return (
    <Dialog
      header="СОХРАНИТЬ БАЗУ ДАННЫХ"
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
            label="Сохранить"
            icon="pi pi-check"
            onClick={onSubmit}
            autoFocus
            disabled={!passwordsMatch}
          />
        </div>
      }
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label>Придумайте пароль:</label>
          <div className="p-inputgroup" style={{ height: "40px" }}>
            <InputText
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Не менее 10 символов"
              style={{ height: "100%", flex: 1 }}
            />
            <span
              className="p-inputgroup-addon"
              style={{ width: "40px", height: "100%" }}
            >
              <i
                className={`pi pi-${validation.isValid ? "check" : "times"}`}
                style={{
                  color: validation.isValid ? "green" : "red",
                  fontSize: "1rem",
                }}
              />
            </span>
          </div>
        </div>

        <div className="p-field mt-3">
          <label>Повторите пароль:</label>
          <div className="p-inputgroup" style={{ height: "40px" }}>
            <InputText
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              style={{ height: "100%", flex: 1 }}
            />
            <span
              className="p-inputgroup-addon"
              style={{ width: "40px", height: "100%" }}
            >
              <i
                className={`pi pi-${passwordsMatch ? "check" : "times"}`}
                style={{
                  color: passwordsMatch ? "green" : "red",
                  fontSize: "1rem",
                }}
              />
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div style={{ color: validation.isLengthValid ? "green" : "black" }}>
            <i
              className={`pi pi-${
                validation.isLengthValid ? "check" : "circle-off"
              } mr-2`}
            />
            Введено от 10 до 19 символов
          </div>
          <div
            style={{ color: validation.hasNumber ? "green" : "black" }}
            className="mt-1"
          >
            <i
              className={`pi pi-${
                validation.hasNumber ? "check" : "circle-off"
              } mr-2`}
            />
            Пароль содержит цифру
          </div>
          <div
            style={{
              color:
                validation.hasLowercase && validation.hasUppercase
                  ? "green"
                  : "black",
            }}
            className="mt-1"
          >
            <i
              className={`pi pi-${
                validation.hasLowercase && validation.hasUppercase
                  ? "check"
                  : "circle-off"
              } mr-2`}
            />
            Пароль содержит строчную и заглавную букву
          </div>
        </div>
      </div>
    </Dialog>
  );
}
