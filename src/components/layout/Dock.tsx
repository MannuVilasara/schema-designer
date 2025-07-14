"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useSchemaStore } from "@/store/schemaStore";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Move,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import FieldContextMenu from "@/components/menus/FieldContextMenu";
import ContextMenu from "@/components/menus/ContextMenu";
import EditFieldModal from "@/components/modals/EditFieldModal";
import EditCollectionModal from "@/components/modals/EditCollectionModal";
import ConfirmFieldDeleteDialog from "@/components/modals/ConfirmFieldDeleteDialog";
import toast from "react-hot-toast";

export default function Dock() {
  const collections = useSchemaStore((s) => s.collections);
  const addCollection = useSchemaStore((s) => s.addCollection);
  const addField = useSchemaStore((s) => s.addField);
  const updateField = useSchemaStore((s) => s.updateField);
  const removeField = useSchemaStore((s) => s.removeField);
  const updateCollection = useSchemaStore((s) => s.updateCollection);
  const removeCollection = useSchemaStore((s) => s.removeCollection);
  const duplicateCollection = useSchemaStore((s) => s.duplicateCollection);
  const reorderFields = useSchemaStore((s) => s.reorderFields);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Enhanced draggable state management
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockWidth, setDockWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDocked, setIsDocked] = useState(true);

  const dragControls = useDragControls();
  const dockRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set()
  );

  // Drag and drop state for field reordering
  const [draggedField, setDraggedField] = useState<{
    collectionId: string;
    fieldIndex: number;
    fieldName: string;
  } | null>(null);
  const [dragOverField, setDragOverField] = useState<{
    collectionId: string;
    fieldIndex: number;
  } | null>(null);

  // Context menu and modal states
  const [fieldContextMenu, setFieldContextMenu] = useState<{
    x: number;
    y: number;
    collectionId: string;
    fieldIndex: number;
    fieldName: string;
  } | null>(null);
  const [collectionContextMenu, setCollectionContextMenu] = useState<{
    x: number;
    y: number;
    collectionId: string;
    collectionName: string;
  } | null>(null);
  const [editFieldModal, setEditFieldModal] = useState<{
    collectionId: string;
    fieldIndex: number;
    position: { x: number; y: number };
  } | null>(null);
  const [editCollectionModal, setEditCollectionModal] = useState<{
    collectionId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [deleteFieldDialog, setDeleteFieldDialog] = useState<{
    collectionId: string;
    fieldIndex: number;
    position: { x: number; y: number };
  } | null>(null);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Minimum and maximum dock widths
  const MIN_WIDTH = 320; // Fixed width
  const MAX_WIDTH = 400; // Maximum width for floating mode

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  // Context menu handlers
  const handleFieldRightClick = (
    e: React.MouseEvent,
    collectionId: string,
    fieldIndex: number,
    fieldName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setFieldContextMenu({
      x: e.clientX,
      y: e.clientY,
      collectionId,
      fieldIndex,
      fieldName,
    });
  };

  const handleCollectionRightClick = (
    e: React.MouseEvent,
    collectionId: string,
    collectionName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCollectionContextMenu({
      x: e.clientX,
      y: e.clientY,
      collectionId,
      collectionName,
    });
  };

  const closeAllMenus = () => {
    setFieldContextMenu(null);
    setCollectionContextMenu(null);
  };

  // Modal handlers
  const handleEditField = (
    collectionId: string,
    fieldIndex: number,
    position: { x: number; y: number }
  ) => {
    setEditFieldModal({ collectionId, fieldIndex, position });
    closeAllMenus();
  };

  const handleDeleteField = (
    collectionId: string,
    fieldIndex: number,
    position: { x: number; y: number }
  ) => {
    setDeleteFieldDialog({ collectionId, fieldIndex, position });
    closeAllMenus();
  };

  const handleAddField = (
    collectionId: string,
    position?: { x: number; y: number }
  ) => {
    addField(collectionId, {
      name: "newField",
      type: "String",
      required: false,
    });
    closeAllMenus();
  };

  const handleEditCollection = (
    collectionId: string,
    position?: { x: number; y: number }
  ) => {
    setEditCollectionModal({
      collectionId,
      position: position || { x: 0, y: 0 },
    });
    closeAllMenus();
  };

  const handleDeleteCollection = (
    collectionId: string,
    position?: { x: number; y: number }
  ) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      removeCollection(collectionId);
    }
    closeAllMenus();
  };

  const handleDuplicateCollection = (collectionId: string) => {
    duplicateCollection(collectionId);
    closeAllMenus();
  };

  // Field drag and drop handlers
  const handleFieldDragStart = (
    e: React.DragEvent,
    collectionId: string,
    fieldIndex: number,
    fieldName: string
  ) => {
    // Don't allow dragging timestamp fields or _id field
    if (
      fieldName === "createdAt" ||
      fieldName === "updatedAt" ||
      fieldName === "_id"
    ) {
      e.preventDefault();
      return;
    }

    setDraggedField({ collectionId, fieldIndex, fieldName });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleFieldDragOver = (
    e: React.DragEvent,
    collectionId: string,
    fieldIndex: number
  ) => {
    if (!draggedField || draggedField.collectionId !== collectionId) return;

    // Get the collection to check field at target position
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const targetField = collection.fields[fieldIndex];

    // Don't allow dropping on protected fields (_id, createdAt, updatedAt)
    if (
      targetField &&
      (targetField.name === "_id" ||
        targetField.name === "createdAt" ||
        targetField.name === "updatedAt")
    ) {
      return; // Don't set drag over state for protected positions
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverField({ collectionId, fieldIndex });
  };

  const handleFieldDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the field entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverField(null);
    }
  };

  const handleFieldDrop = (
    e: React.DragEvent,
    collectionId: string,
    fieldIndex: number
  ) => {
    e.preventDefault();

    if (!draggedField || draggedField.collectionId !== collectionId) return;

    // Get the collection to check field at target position
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const targetField = collection.fields[fieldIndex];

    // Don't allow dropping on protected fields (_id, createdAt, updatedAt)
    if (
      targetField &&
      (targetField.name === "_id" ||
        targetField.name === "createdAt" ||
        targetField.name === "updatedAt")
    ) {
      toast.error(
        `Cannot move field to ${targetField.name}'s position - protected field`
      );
      setDraggedField(null);
      setDragOverField(null);
      return;
    }

    if (draggedField.fieldIndex !== fieldIndex) {
      reorderFields(collectionId, draggedField.fieldIndex, fieldIndex);
      toast.success(`Moved field "${draggedField.fieldName}"`);
    }

    setDraggedField(null);
    setDragOverField(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
  };

  // Enhanced resize functionality similar to CodeSidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !dockRef.current) return;

      if (isDocked) {
        const newWidth = e.clientX;
        setDockWidth(
          Math.min(
            Math.max(newWidth, MIN_WIDTH),
            typeof window !== "undefined" ? window.innerWidth * 0.8 : 800
          )
        );
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isDocked, MIN_WIDTH]);

  const handleUndock = () => {
    setIsDocked(false);
    setPosition({ x: 50, y: 50 });
    toast.success("Collections panel undocked");
  };

  const handleDock = () => {
    setIsDocked(true);
    setPosition({ x: 0, y: 0 });
    toast.success("Collections panel docked to left");
  };

  const handleReset = () => {
    setDockWidth(320);
    setPosition({ x: 0, y: 0 });
    setIsDocked(true);
    setIsMinimized(false);
    toast.success("Collections panel reset");
  };

  // Dock variants for motion
  const dockVariants = {
    docked: {
      position: "fixed" as const,
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      width: dockWidth,
      height: "100vh",
    },
    floating: {
      position: "fixed" as const,
      left: "auto",
      top: "auto",
      x: position.x,
      y: position.y,
      width: dockWidth,
      height: isMinimized ? "auto" : "80vh",
    },
  };

  return (
    <div className="relative flex h-full">
      <AnimatePresence>
        <motion.div
          ref={dockRef}
          drag={!isDocked}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            left: 0,
            right:
              typeof window !== "undefined" ? window.innerWidth - 320 : 800,
            top: 0,
            bottom:
              typeof window !== "undefined"
                ? window.innerHeight - (isMinimized ? 100 : 400)
                : 600,
          }}
          onDragEnd={(_, info) => {
            if (!isDocked) {
              setPosition((prev) => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y,
              }));
            }
          }}
          initial={isDocked ? { x: "-100%" } : false}
          animate={isDocked ? { x: 0 } : dockVariants.floating}
          exit={{
            x: isDocked ? "-100%" : position.x - dockWidth,
            opacity: 0,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`backdrop-blur-md border shadow-2xl z-40 flex flex-col rounded-lg overflow-hidden ${
            isDark
              ? "bg-gray-900/95 border-gray-700"
              : "bg-white/95 border-gray-200"
          } ${isDocked ? "rounded-none rounded-r-lg" : "rounded-lg"}`}
          style={{
            width: dockWidth,
            minWidth: MIN_WIDTH,
            maxWidth: "80vw",
          }}
          onClick={closeAllMenus}
        >
          {/* Resize handle for docked mode */}
          {isDocked && (
            <div
              ref={resizeRef}
              className={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:w-2 transition-all duration-200 ${
                isDark
                  ? "bg-blue-500/20 hover:bg-blue-500/40"
                  : "bg-blue-400/20 hover:bg-blue-400/40"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />
          )}

          {/* Header with drag handle */}
          <div
            className={`p-4 border-b flex-shrink-0 ${
              isDark
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {!isDocked && (
                  <button
                    onPointerDown={(e) => dragControls.start(e)}
                    className={`cursor-move p-1 rounded hover:bg-opacity-20 ${
                      isDark ? "hover:bg-white" : "hover:bg-gray-600"
                    }`}
                  >
                    <Move className="w-4 h-4" />
                  </button>
                )}
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  📦 Collections
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </Button>

                {isDocked ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndock}
                    className={`${
                      isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Undock window"
                  >
                    <GripVertical className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDock}
                    className={`${
                      isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Dock to left"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className={`${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title="Reset position and size"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 flex-1 overflow-y-auto">
                {/* Collections list */}
                <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                  {collections.map((col) => {
                    const isCollectionExpanded = expandedCollections.has(
                      col.id
                    );
                    return (
                      <div
                        key={col.id}
                        className={`rounded-lg ${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        {/* Collection header - clickable to expand/collapse */}
                        <div
                          className={`flex items-center justify-between p-3 cursor-pointer hover:${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          } rounded-lg transition-colors`}
                          onClick={() => {
                            closeAllMenus(); // Hide context menu on left click
                            toggleCollection(col.id);
                          }}
                          onMouseDown={closeAllMenus} // Hide context menu on drag start
                          onContextMenu={(e) =>
                            handleCollectionRightClick(e, col.id, col.name)
                          }
                        >
                          <div
                            className={`font-medium ${
                              isDark ? "text-blue-300" : "text-blue-600"
                            }`}
                          >
                            {col.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {col.fields.length}
                            </span>
                            {isCollectionExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>

                        {/* Collection fields - only show when expanded */}
                        {isCollectionExpanded && (
                          <div className="px-3 pb-3">
                            <div className="space-y-2">
                              {col.fields.length === 0 ? (
                                <div
                                  className={`text-xs italic text-center py-2 px-3 rounded ${
                                    isDark
                                      ? "text-gray-500 bg-gray-700/50"
                                      : "text-gray-400 bg-gray-50"
                                  }`}
                                >
                                  No fields yet - Add fields and drag to reorder
                                </div>
                              ) : (
                                col.fields.map((field, idx) => {
                                  const isDragging =
                                    draggedField?.collectionId === col.id &&
                                    draggedField?.fieldIndex === idx;
                                  const isDropTarget =
                                    dragOverField?.collectionId === col.id &&
                                    dragOverField?.fieldIndex === idx;
                                  const canDrag =
                                    field.name !== "createdAt" &&
                                    field.name !== "updatedAt" &&
                                    field.name !== "_id";
                                  const isProtectedField =
                                    field.name === "_id" ||
                                    field.name === "createdAt" ||
                                    field.name === "updatedAt";

                                  return (
                                    <div
                                      key={`${col.id}-${idx}`}
                                      draggable={canDrag}
                                      onDragStart={(e) =>
                                        handleFieldDragStart(
                                          e,
                                          col.id,
                                          idx,
                                          field.name
                                        )
                                      }
                                      onDragOver={(e) =>
                                        handleFieldDragOver(e, col.id, idx)
                                      }
                                      onDragLeave={handleFieldDragLeave}
                                      onDrop={(e) =>
                                        handleFieldDrop(e, col.id, idx)
                                      }
                                      onDragEnd={handleFieldDragEnd}
                                      title={
                                        isProtectedField
                                          ? `${field.name} is a protected field and cannot be moved`
                                          : canDrag
                                          ? "Drag to reorder fields"
                                          : undefined
                                      }
                                      className={`flex items-center justify-between p-2 rounded text-xs transition-all duration-200 ${
                                        isDragging
                                          ? "opacity-50 scale-95 shadow-lg"
                                          : isDropTarget
                                          ? isDark
                                            ? "bg-blue-600/30 border-2 border-blue-400 border-dashed shadow-md"
                                            : "bg-blue-100 border-2 border-blue-400 border-dashed shadow-md"
                                          : isProtectedField
                                          ? isDark
                                            ? "bg-gray-800/50 border border-gray-600"
                                            : "bg-gray-200/50 border border-gray-300"
                                          : isDark
                                          ? "bg-gray-700/50 hover:bg-gray-700"
                                          : "bg-gray-50 hover:bg-gray-100"
                                      } ${
                                        canDrag
                                          ? "cursor-grab hover:shadow-sm active:cursor-grabbing"
                                          : isProtectedField
                                          ? "cursor-not-allowed"
                                          : "cursor-pointer"
                                      }`}
                                      onClick={closeAllMenus} // Hide context menu on left click
                                      onMouseDown={closeAllMenus} // Hide context menu on mouse down
                                      onContextMenu={(e) =>
                                        handleFieldRightClick(
                                          e,
                                          col.id,
                                          idx,
                                          field.name
                                        )
                                      }
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {canDrag && (
                                          <GripVertical
                                            className={`w-3 h-3 flex-shrink-0 ${
                                              isDark
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        )}
                                        {isProtectedField && (
                                          <Lock
                                            className={`w-3 h-3 flex-shrink-0 ${
                                              isDark
                                                ? "text-yellow-500"
                                                : "text-yellow-600"
                                            }`}
                                          />
                                        )}
                                        <span
                                          className={`font-medium truncate ${
                                            isDark
                                              ? "text-green-400"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {field.name}
                                        </span>
                                        {field.required && (
                                          <span className="text-red-500 text-xs">
                                            *
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                            isDark
                                              ? field.type === "ObjectId"
                                                ? "bg-purple-900/30 text-purple-300"
                                                : field.type === "String"
                                                ? "bg-blue-900/30 text-blue-300"
                                                : field.type === "Number"
                                                ? "bg-green-900/30 text-green-300"
                                                : field.type === "Boolean"
                                                ? "bg-red-900/30 text-red-300"
                                                : field.type === "Date"
                                                ? "bg-yellow-900/30 text-yellow-300"
                                                : "bg-gray-900/30 text-gray-300"
                                              : field.type === "ObjectId"
                                              ? "bg-purple-100 text-purple-700"
                                              : field.type === "String"
                                              ? "bg-blue-100 text-blue-700"
                                              : field.type === "Number"
                                              ? "bg-green-100 text-green-700"
                                              : field.type === "Boolean"
                                              ? "bg-red-100 text-red-700"
                                              : field.type === "Date"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-orange-100 text-orange-700"
                                          }`}
                                        >
                                          {field.type}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Context Menus */}
      {fieldContextMenu && (
        <FieldContextMenu
          x={fieldContextMenu.x}
          y={fieldContextMenu.y}
          collectionId={fieldContextMenu.collectionId}
          fieldIndex={fieldContextMenu.fieldIndex}
          fieldName={fieldContextMenu.fieldName}
          onClose={closeAllMenus}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onAddField={handleAddField}
        />
      )}

      {collectionContextMenu && (
        <ContextMenu
          x={collectionContextMenu.x}
          y={collectionContextMenu.y}
          collectionId={collectionContextMenu.collectionId}
          collectionName={collectionContextMenu.collectionName}
          onClose={closeAllMenus}
          onDelete={handleDeleteCollection}
          onDuplicate={handleDuplicateCollection}
          onAddField={handleAddField}
          onEditCollection={handleEditCollection}
          onCreateCollection={() => {}}
          onGenerateCode={() => {}}
        />
      )}

      {/* Modals */}
      {editFieldModal &&
        (() => {
          const collection = collections.find(
            (c) => c.id === editFieldModal.collectionId
          );
          const field = collection?.fields[editFieldModal.fieldIndex];
          return field ? (
            <EditFieldModal
              isOpen={true}
              field={field}
              position={editFieldModal.position}
              onSave={(fieldData) => {
                updateField(
                  editFieldModal.collectionId,
                  editFieldModal.fieldIndex,
                  fieldData
                );
                setEditFieldModal(null);
              }}
              onClose={() => setEditFieldModal(null)}
            />
          ) : null;
        })()}

      {editCollectionModal &&
        (() => {
          const collection = collections.find(
            (c) => c.id === editCollectionModal.collectionId
          );
          return collection ? (
            <EditCollectionModal
              isOpen={true}
              collection={collection}
              position={editCollectionModal.position}
              onSave={(collectionId, name) => {
                updateCollection(editCollectionModal.collectionId, name);
                setEditCollectionModal(null);
              }}
              onClose={() => setEditCollectionModal(null)}
            />
          ) : null;
        })()}

      {deleteFieldDialog &&
        (() => {
          const collection = collections.find(
            (c) => c.id === deleteFieldDialog.collectionId
          );
          const field = collection?.fields[deleteFieldDialog.fieldIndex];
          return field ? (
            <ConfirmFieldDeleteDialog
              isOpen={true}
              fieldName={field.name}
              position={deleteFieldDialog.position}
              onConfirm={() => {
                removeField(
                  deleteFieldDialog.collectionId,
                  deleteFieldDialog.fieldIndex
                );
                setDeleteFieldDialog(null);
              }}
              onCancel={() => setDeleteFieldDialog(null)}
            />
          ) : null;
        })()}
    </div>
  );
}
