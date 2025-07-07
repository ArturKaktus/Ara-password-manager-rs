import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Tree, TreeEventNodeEvent } from "primereact/tree";
import "./TreeView.css";
import { Group } from "../Models/Kakadu/GroupModel";
import { invoke } from "@tauri-apps/api/core";
import { ContextMenu } from "primereact/contextmenu";

interface GroupTreeNode {
  key: string;
  label: string;
  icon: string;
  children?: GroupTreeNode[];
}

export default function TreeViewComponent() {
  const [nodes, setNodes] = useState<GroupTreeNode[]>([]); // Всегда начинаем с пустого массива
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined
  );
  const cm = useRef<ContextMenu>(null);

  const buildTreeFromGroups = (groups: Group[]): GroupTreeNode[] => {
    const nodeMap = new Map<number, GroupTreeNode>();
    const rootNodes: GroupTreeNode[] = [];

    // 1. Создаем все узлы
    groups.forEach((group) => {
      nodeMap.set(group.id, {
        key: group.id.toString(),
        label: group.name,
        icon: "pi pi-folder",
        children: [],
      });
    });

    // 2. Строим иерархию
    groups.forEach((group) => {
      const node = nodeMap.get(group.id);
      if (!node) return;

      if (group.pid === 0) {
        rootNodes.push(node);
      } else {
        const parent = nodeMap.get(group.pid);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      }
    });

    return rootNodes;
  };

  const handleNodeSelect = (event: any) => {
    if (!event?.value) {
      console.warn("No value in selection event");
      return;
    }

    const selectedKey = event.value;

    if (!selectedKey) {
      console.warn("Selected value is empty");
      return;
    }

    setSelectedKey(selectedKey);

    // Отправляем ID выбранной группы в Rust backend
    invoke("get_records_by_group", { groupId: +selectedKey })
      .then(() => console.log("Group ID sent successfully"))
      .catch((err) => console.error("Error sending group ID:", err));
  };

  useEffect(() => {
    const unlisten = listen<Group[]>("get_groups_listen", (event) => {
      const newTree =
        event.payload?.length > 0 ? buildTreeFromGroups(event.payload) : [];

      setNodes(newTree);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);
  const menuModel = [
    {
      label: "Редактировать",
      icon: "pi pi-fw pi-pencil",
    },
    {
      label: "Удалить",
      icon: "pi pi-fw pi-times",
    },
  ];

  const handleContextMenu = (MouseEvent: TreeEventNodeEvent) => {
    cm.current?.show(MouseEvent.originalEvent);
  };
  return (
    <>
      <ContextMenu model={menuModel} ref={cm} />
      <Tree
        value={nodes}
        selectionMode="single"
        selectionKeys={selectedKey ? { [selectedKey]: true } : {}}
        onSelectionChange={(e) => handleNodeSelect(e)}
        className="w-full h-full"
        onContextMenu={(e) => handleContextMenu(e)}
        style={{
          minWidth: "100%",
          width: "100%",
          padding: 0,
        }}
      />
    </>
  );
}
