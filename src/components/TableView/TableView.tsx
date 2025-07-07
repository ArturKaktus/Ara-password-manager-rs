import "./TableView.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Record } from "../Models/Kakadu/RecordModel";
import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { ContextMenu } from "primereact/contextmenu";
import EditRecordDialog from "./dialogs/EditRecordDialog";
import { invoke } from "@tauri-apps/api/core";

export default function TableViewComponent() {
  const [records, setRecords] = useState<Record[]>([]);
  const cm = useRef<ContextMenu>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | undefined>(
    undefined
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const dt = useRef<DataTable<Record[]>>(null); // Правильная типизация ref для DataTable

  useEffect(() => {
    const unlisten = listen<Record[]>("get_records_listen", (event) => {
      const newRecords = event.payload?.length > 0 ? event.payload : [];
      setRecords(newRecords);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleEditClick = () => {
    setEditModalVisible(true);
  };

  const handleDeleteClick = async () => {
    if (!selectedRecord) return;

    try {
      // Сохраняем текущую позицию прокрутки
      const scrollTop =
        dt.current?.getElement()?.querySelector(".p-datatable-wrapper")
          ?.scrollTop || 0;

      // Вызываем команду удаления
      await invoke("delete_record", { recordId: selectedRecord.id });

      // Обновляем локальное состояние
      setRecords((prev) =>
        prev.filter((record) => record.id !== selectedRecord.id)
      );

      // Восстанавливаем позицию прокрутки после обновления
      setTimeout(() => {
        const wrapper = dt.current
          ?.getElement()
          ?.querySelector(".p-datatable-wrapper");
        if (wrapper) {
          wrapper.scrollTop = scrollTop;
        }
      }, 0);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleSaveName = (newName: string) => {
    if (selectedRecord) {
      const updatedRecords = records.map((record) =>
        record === selectedRecord ? { ...record, name: newName } : record
      );
      setRecords(updatedRecords);
    }
  };

  const menuModel = [
    {
      label: "Редактировать",
      icon: "pi pi-fw pi-pencil",
      command: handleEditClick,
    },
    {
      label: "Удалить",
      icon: "pi pi-fw pi-times",
      command: handleDeleteClick,
    },
  ];

  const handleContextMenu = (event: React.MouseEvent, record: Record) => {
    event.preventDefault();
    setSelectedRecord(record);
    cm.current?.show(event);
  };

  return (
    <>
      <ContextMenu model={menuModel} ref={cm} />

      <EditRecordDialog
        visible={editModalVisible}
        onHide={() => setEditModalVisible(false)}
        record={selectedRecord ?? { name: "" }}
        onSave={handleSaveName}
      />

      <div className="table-container">
        <DataTable
          ref={dt}
          stripedRows
          className="w-full h-full"
          size="small"
          value={records}
          onContextMenu={(e: {
            originalEvent: React.MouseEvent;
            data: Record;
          }) => handleContextMenu(e.originalEvent, e.data)}
          contextMenuSelection={selectedRecord}
          onContextMenuSelectionChange={(e) => setSelectedRecord(e.value)}
        >
          <Column field="name" header="Name"></Column>
          <Column field="login" header="Login"></Column>
          <Column
            field="password"
            header="Password"
            body={(data: Record) => "•".repeat(data.password?.length || 6)}
          ></Column>
        </DataTable>
      </div>
    </>
  );
}
