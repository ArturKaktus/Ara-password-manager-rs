import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface PasswordDialogProps {
  visible: boolean;
  isSaveDialog: boolean;
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
  resetDialog: () => void;
  handleSubmit: () => void;
}

export function PasswordDialog({
  visible,
  isSaveDialog,
  password,
  confirmPassword,
  validation,
  passwordsMatch,
  setPassword,
  setConfirmPassword,
  resetDialog,
  handleSubmit,
}: PasswordDialogProps) {
  return (
    <Dialog
      header={isSaveDialog ? "СОХРАНИТЬ БАЗУ ДАННЫХ" : "Введите пароль"}
      visible={visible}
      style={{ width: "25vw" }}
      footer={
        <div>
          <Button
            label="Отмена"
            icon="pi pi-times"
            onClick={resetDialog}
            className="p-button-text"
          />
          <Button
            label={isSaveDialog ? "Сохранить" : "Открыть"}
            icon="pi pi-check"
            onClick={handleSubmit}
            autoFocus
            disabled={isSaveDialog ? !passwordsMatch : !password}
          />
        </div>
      }
      onHide={resetDialog}
    >
      <div className="p-fluid">
        {isSaveDialog ? (
          <>
            <div className="p-field">
              <label htmlFor="password">Придумайте пароль:</label>
              <div className="p-inputgroup" style={{ alignItems: "center" }}>
                <InputText
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Не менее 10 символов"
                  className="mt-2"
                  style={{ flex: 1 }}
                />
                <span
                  className="p-inputgroup-addon"
                  style={{
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <i
                    className={`pi pi-${
                      validation.isValid ? "check" : "times"
                    }`}
                    style={{
                      color: validation.isValid ? "green" : "red",
                      fontSize: "1rem",
                    }}
                  />
                </span>
              </div>
            </div>

            <div className="p-field mt-3">
              <label htmlFor="confirmPassword">Повторите пароль:</label>
              <div className="p-inputgroup" style={{ alignItems: "center" }}>
                <InputText
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="mt-2"
                  style={{ flex: 1 }}
                />
                <span
                  className="p-inputgroup-addon"
                  style={{
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
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
              <div
                style={{ color: validation.isLengthValid ? "green" : "black" }}
                className="flex align-items-center"
              >
                <i
                  className={`pi pi-${
                    validation.isLengthValid ? "check" : "circle-off"
                  } mr-2`}
                  style={{ fontSize: "0.9rem" }}
                />
                <span>Введено от 10 до 19 символов</span>
              </div>
              <div
                style={{ color: validation.hasNumber ? "green" : "black" }}
                className="flex align-items-center mt-2"
              >
                <i
                  className={`pi pi-${
                    validation.hasNumber ? "check" : "circle-off"
                  } mr-2`}
                  style={{ fontSize: "0.9rem" }}
                />
                <span>Пароль содержит цифру</span>
              </div>
              <div
                style={{
                  color:
                    validation.hasLowercase && validation.hasUppercase
                      ? "green"
                      : "black",
                }}
                className="flex align-items-center mt-2"
              >
                <i
                  className={`pi pi-${
                    validation.hasLowercase && validation.hasUppercase
                      ? "check"
                      : "circle-off"
                  } mr-2`}
                  style={{ fontSize: "0.9rem" }}
                />
                <span>
                  Пароль содержит одну строчную и одну заглавную букву
                </span>
              </div>
            </div>
          </>
        ) : (
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
        )}
      </div>
    </Dialog>
  );
}
