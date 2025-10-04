import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Tree, TreeEventNodeEvent } from "primereact/tree";
import "./TreeView.css";
import { Group } from "../Models/Kakadu/GroupModel";
import { invoke } from "@tauri-apps/api/core";
import { ContextMenu } from "primereact/contextmenu";
import NewGroupDialog from "./dialogs/NewGroupDialog";

interface GroupTreeNode {
  key: string;
  label: string;
  icon: string;
  children?: GroupTreeNode[];
}

export function TreeViewComponent() {
  const [nodes, setNodes] = useState<GroupTreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [contextMenuNodeKey, setContextMenuNodeKey] = useState<string | null>(null);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const cm = useRef<ContextMenu>(null);

  const buildTreeFromGroups = (groups: Group[]): GroupTreeNode[] => {
    const nodeMap = new Map<number, GroupTreeNode>();
    const rootNodes: GroupTreeNode[] = [];
    console.log("groups: ", groups);
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
    console.log("Выбрана группа: ", selectedKey)
    // Отправляем ID выбранной группы в Rust backend
    invoke("get_records_by_group", {groupId: +selectedKey})
        .then(() => console.log("Group ID sent successfully"))
        .catch((err) => console.error("Error sending group ID:", err));
  };

  useEffect(() => {
    const setup = async () => {
      // 1. Сначала подписываемся на событие
      const unlisten = await listen<Group[]>("get_groups_listen", (event) => {
        const newTree = event.payload?.length > 0
            ? buildTreeFromGroups(event.payload)
            : [];
        setNodes(newTree);
      });

      // 2. Затем запрашиваем данные
      await invoke("get_groups").catch(err => console.error("Ошибка загрузки групп:", err));

      return unlisten;
    };

    const cleanupPromise = setup();

    return () => {
      cleanupPromise.then(unlisten => unlisten());
    };
  }, []);
  const menuModel = [
    {
      label: "Создать",
      icon: "pi pi-fw pi-plus",
      command: () => {
        console.log("Создать для узла", contextMenuNodeKey);
        setNewGroupDialog(true);
      }
    },
    {
      label: "Редактировать",
      icon: "pi pi-fw pi-pencil",
      command: () => {
        console.log("Редактировать узел", contextMenuNodeKey);
        // Ваша логика редактирования
      }
    },
    {
      label: "Удалить",
      icon: "pi pi-fw pi-times",
      disabled: selectedKey === "0", // Делаем кнопку неактивной для корневой папки
      command: () => {
        console.log("Удалить узел", contextMenuNodeKey);
        // Ваша логика удаления
      }
    },
  ];

  const handleContextMenu = (MouseEvent: TreeEventNodeEvent) => {
    if (!MouseEvent.node?.key) {
      console.warn("No value in selection event");
      return;
    }
    const contextMenuNodeKey = MouseEvent.node.key;
    if (!selectedKey) {
      console.warn("Selected value is empty");
      return;
    }
    setContextMenuNodeKey(contextMenuNodeKey.toString());

    cm.current?.show(MouseEvent.originalEvent);
  };

  const handleSaveGroup = (name: string) => {
    if (!name.trim()) {
      console.warn("Group name cannot be empty");
      return;
    }
    if (selectedKey == null) {
      console.warn("Не выбрана группа. selectedKey == null.")
    }

    // @ts-ignore
    invoke("new_group_command", {parentGroupId: +selectedKey, groupName: name})
        .then(() => console.log("Группа создалась."))
        .catch((err) => console.error("Ошибка создании группы:", err));
    // 1. Находим максимальный ID среди всех групп
    // const findAllIds = (nodes: GroupTreeNode[]): number[] => {
    //   let ids: number[] = [];
    //   nodes.forEach(node => {
    //     const id = parseInt(node.key);
    //     if (!isNaN(id)) {
    //       ids.push(id);
    //     }
    //     if (node.children) {
    //       ids = [...ids, ...findAllIds(node.children)];
    //     }
    //   });
    //   return ids;
    // };

    // const allIds = findAllIds(nodes);
    // const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
    // const newId = maxId + 1;

    // // 2. Создаем новую группу
    // const newGroup: GroupTreeNode = {
    //   key: newId.toString(),
    //   label: name,
    //   icon: "pi pi-folder",
    //   children: []
    // };

    // // 4. Добавляем новую группу к выбранному родителю
    // const addNodeToTree = (nodes: GroupTreeNode[]): GroupTreeNode[] => {
    //   return nodes.map(node => {
    //     if (node.key === parentKey) {
    //       return {
    //         ...node,
    //         children: [...(node.children || []), newGroup]
    //       };
    //     }
    //
    //     if (node.children) {
    //       return {
    //         ...node,
    //         children: addNodeToTree(node.children)
    //       };
    //     }
    //
    //     return node;
    //   });
    // };
    //
    // // 5. Обновляем состояние
    // setNodes(prevNodes => addNodeToTree(prevNodes));
    // setNewGroupDialog(false);
  }
  return (
      <>
        {/* <div className="flex gap-2 p-2">
        <Button 
          icon="pi pi-plus" 
          style={{ borderRadius: '6px' }}
          tooltip="Новый" 
          tooltipOptions={{ position: 'bottom' }}
          onClick={() => {
    if (nodes.length === 0) return; // Защита от пустого дерева
    setNewGroupDialog(true);
  }}
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
      </div> */}

        <NewGroupDialog
            visible={newGroupDialog}
            onHide={() => setNewGroupDialog(false)}
            group={{name: ""}}
            onSave={handleSaveGroup}
        />
        <ContextMenu model={menuModel} ref={cm}/>
        <Tree
            value={nodes}
            selectionMode="single"
            selectionKeys={selectedKey ? {[selectedKey]: true} : {}}
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
