import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";

interface NewGroupDialogProps{
    visible: boolean;
    onHide: () => void;
    group : {name: string} | null;
    onSave: (newName: string) => void;
}

export default function NewGroupDialog({
    visible,
    onHide,
    group,
    onSave,
}: NewGroupDialogProps){
    const [name, setName] = useState("");

    useEffect(() => {
      if (visible && group) {
        setName(group.name);
      }
    }, [visible, group]);

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
          header="Создание новой группы"
          visible={visible && !!group}
          style={{ width: "50vw" }}
          onHide={onHide}
          footer={footer}
        >
          <div className="p-field">
            <label htmlFor="name">Название</label>
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