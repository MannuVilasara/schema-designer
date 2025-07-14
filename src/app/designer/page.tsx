"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeChange,
  Connection,
  addEdge,
  EdgeChange,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { useSchemaStore } from "@/store/schemaStore";
import {
  CollectionNode,
  Dock,
  BottomDock,
  ContextMenu,
  FieldContextMenu,
  AddFieldModal,
  ConfirmDialog,
  CreateCollectionModal,
  EditFieldModal,
  EditCollectionModal,
  ConfirmFieldDeleteDialog,
} from "@/components";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

export default function HomePage() {
  const collections = useSchemaStore((state) => state.collections);
  const connections = useSchemaStore((state) => state.connections);
  const updateCollectionPosition = useSchemaStore(
    (state) => state.updateCollectionPosition
  );
  const removeCollection = useSchemaStore((state) => state.removeCollection);
  const duplicateCollection = useSchemaStore(
    (state) => state.duplicateCollection
  );
  const updateCollection = useSchemaStore((state) => state.updateCollection);
  const addField = useSchemaStore((state) => state.addField);
  const removeField = useSchemaStore((state) => state.removeField);
  const updateField = useSchemaStore((state) => state.updateField);
  const addCollection = useSchemaStore((state) => state.addCollection);
  const addConnection = useSchemaStore((state) => state.addConnection);
  const removeConnection = useSchemaStore((state) => state.removeConnection);
  const getFieldConnections = useSchemaStore(
    (state) => state.getFieldConnections
  );
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    collectionId: string;
    collectionName: string;
  } | null>(null);

  // Add field modal state
  const [addFieldModal, setAddFieldModal] = useState<{
    isOpen: boolean;
    collectionId: string;
    collectionName: string;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
    collectionId: "",
    collectionName: "",
  });

  // Confirm delete dialog state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    collectionId: string;
    collectionName: string;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
    collectionId: "",
    collectionName: "",
  });

  // Create collection modal state
  const [createCollectionModal, setCreateCollectionModal] = useState<{
    isOpen: boolean;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
  });

  // Field context menu state
  const [fieldContextMenu, setFieldContextMenu] = useState<{
    x: number;
    y: number;
    collectionId: string;
    fieldIndex: number;
    fieldName: string;
  } | null>(null);

  // Edit field modal state
  const [editFieldModal, setEditFieldModal] = useState<{
    isOpen: boolean;
    collectionId: string;
    fieldIndex: number;
    field: any;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
    collectionId: "",
    fieldIndex: -1,
    field: null,
  });

  // Confirm field delete dialog state
  const [confirmFieldDelete, setConfirmFieldDelete] = useState<{
    isOpen: boolean;
    collectionId: string;
    fieldIndex: number;
    fieldName: string;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
    collectionId: "",
    fieldIndex: -1,
    fieldName: "",
  });

  // Edit collection modal state
  const [editCollectionModal, setEditCollectionModal] = useState<{
    isOpen: boolean;
    collection: any;
    position?: { x: number; y: number };
  }>({
    isOpen: false,
    collection: null,
  });

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, collectionId: string, collectionName: string) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        collectionId,
        collectionName,
      });
    },
    []
  );

  const handleFieldContextMenu = useCallback(
    (
      event: React.MouseEvent,
      collectionId: string,
      fieldIndex: number,
      fieldName: string
    ) => {
      event.preventDefault();
      setFieldContextMenu({
        x: event.clientX,
        y: event.clientY,
        collectionId,
        fieldIndex,
        fieldName,
      });
    },
    []
  );

  // Handle right-click on empty area to create new collection
  const handleEmptyAreaContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      collectionId: "",
      collectionName: "",
    });
  }, []);

  // Handle clicks to close context menu
  const handleClick = useCallback(() => {
    if (contextMenu) {
      setContextMenu(null);
    }
    if (fieldContextMenu) {
      setFieldContextMenu(null);
    }
  }, [contextMenu, fieldContextMenu]);

  // Close all context menus
  const closeAllMenus = useCallback(() => {
    if (contextMenu) {
      setContextMenu(null);
    }
    if (fieldContextMenu) {
      setFieldContextMenu(null);
    }
  }, [contextMenu, fieldContextMenu]);

  const nodes: Node[] = useMemo(() => {
    return collections.map((col, index) => ({
      id: col.id,
      type: "collectionNode",
      data: {
        name: col.name,
        id: col.id,
        fields: col.fields,
        onContextMenu: handleContextMenu,
        onFieldContextMenu: handleFieldContextMenu,
        onCloseMenus: closeAllMenus,
      },
      position: col.position || { x: 100 + index * 220, y: 100 },
    }));
  }, [collections, handleContextMenu, handleFieldContextMenu, closeAllMenus]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateCollectionPosition(change.id, change.position);
        }
      });
    },
    [updateCollectionPosition]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(
    (id: string, position?: { x: number; y: number }) => {
      const collection = collections.find((col) => col.id === id);
      if (collection) {
        setConfirmDelete({
          isOpen: true,
          collectionId: id,
          collectionName: collection.name,
          position: position || collection.position, // Use cursor position if provided
        });
      }
    },
    [collections]
  );

  const confirmDeleteAction = useCallback(() => {
    removeCollection(confirmDelete.collectionId);
    setConfirmDelete({ isOpen: false, collectionId: "", collectionName: "" });
    toast.success(
      `Collection "${confirmDelete.collectionName}" deleted successfully`
    );
  }, [
    removeCollection,
    confirmDelete.collectionId,
    confirmDelete.collectionName,
  ]);

  const cancelDelete = useCallback(() => {
    setConfirmDelete({ isOpen: false, collectionId: "", collectionName: "" });
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      const collection = collections.find((col) => col.id === id);
      duplicateCollection(id);
      toast.success(`Collection "${collection?.name}" duplicated successfully`);
    },
    [duplicateCollection, collections]
  );

  const handleAddField = useCallback(
    (collectionId: string, position?: { x: number; y: number }) => {
      const collection = collections.find((col) => col.id === collectionId);
      if (collection) {
        setAddFieldModal({
          isOpen: true,
          collectionId: collectionId,
          collectionName: collection.name,
          position: position || collection.position, // Use cursor position if provided
        });
      }
    },
    [collections]
  );

  const handleAddFieldSubmit = useCallback(
    (field: { name: string; type: string; required: boolean }) => {
      addField(addFieldModal.collectionId, field);
      setAddFieldModal({ isOpen: false, collectionId: "", collectionName: "" });
      toast.success(`Field "${field.name}" added successfully`);
    },
    [addField, addFieldModal.collectionId]
  );

  const handleCloseModal = useCallback(() => {
    setAddFieldModal({ isOpen: false, collectionId: "", collectionName: "" });
  }, []);

  const handleCreateCollection = useCallback(
    (position?: { x: number; y: number }) => {
      setCreateCollectionModal({ isOpen: true, position });
    },
    []
  );

  const handleCreateCollectionSubmit = useCallback(
    (
      name: string,
      options: {
        includeTimestamps: boolean;
        includeCreatedAt: boolean;
        includeUpdatedAt: boolean;
      }
    ) => {
      addCollection(name, options);
      setCreateCollectionModal({ isOpen: false });
      toast.success(`Collection "${name}" created successfully`);
    },
    [addCollection]
  );

  const handleCloseCreateModal = useCallback(() => {
    setCreateCollectionModal({ isOpen: false });
  }, []);

  // Field operation handlers
  const closeFieldContextMenu = useCallback(() => {
    setFieldContextMenu(null);
  }, []);

  const handleEditField = useCallback(
    (
      collectionId: string,
      fieldIndex: number,
      position?: { x: number; y: number }
    ) => {
      const collection = collections.find((col) => col.id === collectionId);
      if (collection && collection.fields[fieldIndex]) {
        setEditFieldModal({
          isOpen: true,
          collectionId,
          fieldIndex,
          field: collection.fields[fieldIndex],
          position,
        });
      }
    },
    [collections]
  );

  const handleEditFieldSubmit = useCallback(
    (field: { name: string; type: string; required: boolean }) => {
      updateField(
        editFieldModal.collectionId,
        editFieldModal.fieldIndex,
        field
      );
      setEditFieldModal({
        isOpen: false,
        collectionId: "",
        fieldIndex: -1,
        field: null,
      });
      toast.success(`Field "${field.name}" updated successfully`);
    },
    [updateField, editFieldModal.collectionId, editFieldModal.fieldIndex]
  );

  const handleCloseEditField = useCallback(() => {
    setEditFieldModal({
      isOpen: false,
      collectionId: "",
      fieldIndex: -1,
      field: null,
    });
  }, []);

  const handleDeleteField = useCallback(
    (
      collectionId: string,
      fieldIndex: number,
      position?: { x: number; y: number }
    ) => {
      const collection = collections.find((col) => col.id === collectionId);
      if (collection && collection.fields[fieldIndex]) {
        setConfirmFieldDelete({
          isOpen: true,
          collectionId,
          fieldIndex,
          fieldName: collection.fields[fieldIndex].name,
          position,
        });
      }
    },
    [collections]
  );

  const confirmFieldDeleteAction = useCallback(() => {
    removeField(confirmFieldDelete.collectionId, confirmFieldDelete.fieldIndex);
    setConfirmFieldDelete({
      isOpen: false,
      collectionId: "",
      fieldIndex: -1,
      fieldName: "",
    });
    toast.success(
      `Field "${confirmFieldDelete.fieldName}" deleted successfully`
    );
  }, [
    removeField,
    confirmFieldDelete.collectionId,
    confirmFieldDelete.fieldIndex,
    confirmFieldDelete.fieldName,
  ]);

  const cancelFieldDelete = useCallback(() => {
    setConfirmFieldDelete({
      isOpen: false,
      collectionId: "",
      fieldIndex: -1,
      fieldName: "",
    });
  }, []);

  // Collection edit handlers
  const handleEditCollection = useCallback(
    (collectionId: string, position?: { x: number; y: number }) => {
      const collection = collections.find((col) => col.id === collectionId);
      if (collection) {
        setEditCollectionModal({
          isOpen: true,
          collection,
          position,
        });
      }
    },
    [collections]
  );

  const handleEditCollectionSubmit = useCallback(
    (collectionId: string, name: string) => {
      updateCollection(collectionId, name);
      setEditCollectionModal({
        isOpen: false,
        collection: null,
      });
      toast.success(`Collection renamed to "${name}" successfully`);
    },
    [updateCollection]
  );

  const handleCloseEditCollection = useCallback(() => {
    setEditCollectionModal({
      isOpen: false,
      collection: null,
    });
  }, []);

  // Prevent hydration mismatch by using fallback until mounted
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const edges: Edge[] = useMemo(() => {
    return connections.map((connection) => ({
      id: connection.id,
      source: connection.sourceCollectionId,
      target: connection.targetCollectionId,
      sourceHandle: `${connection.sourceCollectionId}-field-${connection.sourceFieldIndex}-source`,
      targetHandle: `${connection.targetCollectionId}-field-${connection.targetFieldIndex}-target`,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: isDark ? "#3b82f6" : "#2563eb",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: isDark ? "#3b82f6" : "#2563eb",
      },
      data: {
        sourceField: connection.sourceFieldIndex,
        targetField: connection.targetFieldIndex,
        connectionType: connection.type,
      },
    }));
  }, [connections, isDark]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (
        !connection.source ||
        !connection.target ||
        !connection.sourceHandle ||
        !connection.targetHandle
      ) {
        return;
      }

      // Parse the handle IDs to get collection and field information
      const sourceMatch = connection.sourceHandle.match(
        /^(.+)-field-(\d+)-source$/
      );
      const targetMatch = connection.targetHandle.match(
        /^(.+)-field-(\d+)-target$/
      );

      if (!sourceMatch || !targetMatch) {
        return;
      }

      const sourceCollectionId = sourceMatch[1];
      const sourceFieldIndex = parseInt(sourceMatch[2]);
      const targetCollectionId = targetMatch[1];
      const targetFieldIndex = parseInt(targetMatch[2]);

      // Find the collections and fields
      const sourceCollection = collections.find(
        (c) => c.id === sourceCollectionId
      );
      const targetCollection = collections.find(
        (c) => c.id === targetCollectionId
      );

      if (!sourceCollection || !targetCollection) {
        return;
      }

      const sourceField = sourceCollection.fields[sourceFieldIndex];
      const targetField = targetCollection.fields[targetFieldIndex];

      if (!sourceField || !targetField) {
        return;
      }

      // Validate that both fields are objectId type
      if (sourceField.type !== "objectId" || targetField.type !== "objectId") {
        return;
      }

      // Prevent _id fields from connecting to other _id fields
      if (sourceField.name === "_id" && targetField.name === "_id") {
        return;
      }

      // Check connection limits:
      // - _id fields can have multiple connections
      // - Other objectId fields can only have one connection
      if (sourceField.name !== "_id") {
        const sourceConnections = getFieldConnections(
          sourceCollectionId,
          sourceFieldIndex
        );
        if (sourceConnections.length > 0) {
          return; // This field already has a connection
        }
      }

      if (targetField.name !== "_id") {
        const targetConnections = getFieldConnections(
          targetCollectionId,
          targetFieldIndex
        );
        if (targetConnections.length > 0) {
          return; // This field already has a connection
        }
      }

      // Create the connection
      addConnection({
        sourceCollectionId,
        sourceFieldIndex,
        targetCollectionId,
        targetFieldIndex,
        type: "reference",
      });

      toast.success(
        `Connection created between ${sourceCollection.name}.${sourceField.name} and ${targetCollection.name}.${targetField.name}`
      );
    },
    [collections, getFieldConnections, addConnection]
  );

  return (
    <div
      className={`h-screen w-full flex ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Dock />
      <div className="flex-1 relative">
        <div className="h-full w-full pb-14">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{ collectionNode: CollectionNode }}
            onNodesChange={onNodesChange}
            onConnect={onConnect}
            onPaneContextMenu={handleEmptyAreaContextMenu}
            onPaneClick={handleClick}
            fitView
            className="h-full w-full"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={3}
            attributionPosition="bottom-left"
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            snapToGrid={false}
            snapGrid={[1, 1]}
            deleteKeyCode={null}
            multiSelectionKeyCode={null}
            preventScrolling={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            panOnScrollSpeed={0.5}
            zoomOnDoubleClick={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color={isDark ? "#374151" : "#94a3b8"}
              gap={20}
              size={1}
              style={{ backgroundColor: isDark ? "#1f2937" : "#f8fafc" }}
            />
            <Controls position="top-right" />
          </ReactFlow>
        </div>

        <BottomDock />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          collectionId={contextMenu.collectionId}
          collectionName={contextMenu.collectionName}
          onClose={closeContextMenu}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onAddField={handleAddField}
          onEditCollection={handleEditCollection}
          onCreateCollection={handleCreateCollection}
        />
      )}

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={addFieldModal.isOpen}
        collectionName={addFieldModal.collectionName}
        position={addFieldModal.position}
        onClose={handleCloseModal}
        onAddField={handleAddFieldSubmit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Collection"
        message={`Are you sure you want to delete the "${confirmDelete.collectionName}" collection? This action cannot be undone.`}
        position={confirmDelete.position}
        onConfirm={confirmDeleteAction}
        onCancel={cancelDelete}
      />

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={createCollectionModal.isOpen}
        position={createCollectionModal.position}
        onClose={handleCloseCreateModal}
        onCreateCollection={handleCreateCollectionSubmit}
      />

      {/* Field Context Menu */}
      {fieldContextMenu && (
        <FieldContextMenu
          x={fieldContextMenu.x}
          y={fieldContextMenu.y}
          collectionId={fieldContextMenu.collectionId}
          fieldIndex={fieldContextMenu.fieldIndex}
          fieldName={fieldContextMenu.fieldName}
          onClose={closeFieldContextMenu}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onAddField={handleAddField}
        />
      )}

      {/* Edit Field Modal */}
      <EditFieldModal
        isOpen={editFieldModal.isOpen}
        field={editFieldModal.field}
        position={editFieldModal.position}
        onClose={handleCloseEditField}
        onSave={handleEditFieldSubmit}
      />

      {/* Confirm Field Delete Dialog */}
      <ConfirmFieldDeleteDialog
        isOpen={confirmFieldDelete.isOpen}
        fieldName={confirmFieldDelete.fieldName}
        position={confirmFieldDelete.position}
        onConfirm={confirmFieldDeleteAction}
        onCancel={cancelFieldDelete}
      />

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={editCollectionModal.isOpen}
        collection={editCollectionModal.collection}
        position={editCollectionModal.position}
        onClose={handleCloseEditCollection}
        onSave={handleEditCollectionSubmit}
      />
    </div>
  );
}
