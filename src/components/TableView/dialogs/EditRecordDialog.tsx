import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";

interface EditRecordDialogProps {
  visible: boolean;
  onHide: () => void;
  record: { name: string } | null;
  onSave: (newName: string) => void;
}

export default function EditRecordDialog({
  visible,
  onHide,
  record,
  onSave,
}: EditRecordDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible && record) {
      setName(record.name);
    }
  }, [visible, record]);

  const handleSave = () => {
    onSave(name);
    onHide();
  };

  const footer = (
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
        onClick={handleSave}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header="Редактирование записи"
      visible={visible && !!record}
      style={{ width: "50vw" }}
      onHide={onHide}
      footer={footer}
    >
      <div className="p-field">
        <label htmlFor="name">Имя</label>
        <InputText
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>
    </Dialog>
  );
}
