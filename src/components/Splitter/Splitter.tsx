import "./Splitter.css";
import { Splitter, SplitterPanel } from "primereact/splitter";
import TreeViewComponent from "../TreeView/TreeView";
import TableViewComponent from "../TableView/TableView";
import { Button } from "primereact/button";

export default function SplitterComponent() {
  return (
    <Splitter className="main-splitter">
      <SplitterPanel className="flex flex-column overflow-hidden">
        <div className="flex gap-2 p-2">
          <Button 
            icon="pi pi-plus" 
            style={{ borderRadius: '6px' }}
            tooltip="Новый" 
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button 
            icon="pi pi-pencil" 
            style={{ borderRadius: '6px' }}
            tooltip="Редактировать" 
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button 
            icon="pi pi-trash" 
            style={{ borderRadius: '6px' }}
            tooltip="Удалить" 
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
        <TreeViewComponent/>
      </SplitterPanel>
      <SplitterPanel className="flex flex-column overflow-hidden">
        <div className="flex gap-2 p-2">
          <Button 
            icon="pi pi-plus" 
            style={{ borderRadius: '6px' }}
            tooltip="Новый" 
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button 
            icon="pi pi-pencil" 
            style={{ borderRadius: '6px' }}
            tooltip="Редактировать" 
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button 
            icon="pi pi-trash" 
            style={{ borderRadius: '6px' }}
            tooltip="Удалить" 
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
        <TableViewComponent/>
      </SplitterPanel>
    </Splitter>
  );
}
