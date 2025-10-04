import "./Splitter.css";
import { Splitter, SplitterPanel } from "primereact/splitter";
import {TreeViewComponent} from "../TreeView/TreeView";
import TableViewComponent from "../TableView/TableView";


export default function SplitterComponent() {
  return (
    <Splitter className="main-splitter">
      <SplitterPanel className="flex flex-column overflow-hidden">
        
        <TreeViewComponent/>
      </SplitterPanel>
      <SplitterPanel className="flex flex-column overflow-hidden">
        
        <TableViewComponent/>
      </SplitterPanel>
    </Splitter>
  );
}
