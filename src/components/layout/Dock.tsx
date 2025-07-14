"use client";

import { useState, useRef, useEffect } from "react";
import { useSchemaStore } from "@/store/schemaStore";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import FieldContextMenu from "@/components/menus/FieldContextMenu";
import ContextMenu from "@/components/menus/ContextMenu";
import EditFieldModal from "@/components/modals/EditFieldModal";
import EditCollectionModal from "@/components/modals/EditCollectionModal";
import ConfirmFieldDeleteDialog from "@/components/modals/ConfirmFieldDeleteDialog";

export default function Dock() {
  const collections = useSchemaStore((s) => s.collections);
  const addCollection = useSchemaStore((s) => s.addCollection);
  const addField = useSchemaStore((s) => s.addField);
  const updateField = useSchemaStore((s) => s.updateField);
  const removeField = useSchemaStore((s) => s.removeField);
  const updateCollection = useSchemaStore((s) => s.updateCollection);
  const removeCollection = useSchemaStore((s) => s.removeCollection);
  const duplicateCollection = useSchemaStore((s) => s.duplicateCollection);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isExpanded, setIsExpanded] = useState(true);
  const [dockWidth, setDockWidth] = useState(256); // Default width in px
  const [isResizing, setIsResizing] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set()
  );

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

  const dockRef = useRef<HTMLDivElement>(null);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Minimum and maximum dock widths
  const MIN_WIDTH = 48; // Collapsed width
  const MAX_WIDTH = 400; // Maximum width
  const CONTENT_MIN_WIDTH = 200; // Minimum width to show content properly

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

  const toggleDock = () => {
    setIsExpanded(!isExpanded);
    // Set width based on expanded state
    if (!isExpanded) {
      setDockWidth(256); // Expand to default width
    } else {
      setDockWidth(MIN_WIDTH); // Collapse to minimum width
    }
  };

  // Handle mouse resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !dockRef.current) return;

      // Calculate width based on mouse position relative to the dock's left edge
      const dockRect = dockRef.current.getBoundingClientRect();
      const newWidth = e.clientX - dockRect.left;

      const constrainedWidth = Math.min(
        Math.max(newWidth, MIN_WIDTH),
        MAX_WIDTH
      );

      setDockWidth(constrainedWidth);

      // Auto-expand/collapse based on width
      if (constrainedWidth > CONTENT_MIN_WIDTH && !isExpanded) {
        setIsExpanded(true);
      } else if (constrainedWidth <= MIN_WIDTH + 20 && isExpanded) {
        setIsExpanded(false);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
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
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, isExpanded]);

  return (
    <div className="relative flex h-full" onClick={closeAllMenus}>
      <div
        ref={dockRef}
        className={`flex flex-col gap-4 border-r h-full overflow-hidden ${
          !isResizing ? "transition-all duration-300 ease-in-out" : ""
        } ${
          isDark
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-200"
        }`}
        style={{
          width: `${dockWidth}px`,
          minWidth: `${MIN_WIDTH}px`,
          maxWidth: `${MAX_WIDTH}px`,
        }}
      >
        <div className="p-4 flex flex-col gap-4 h-full overflow-hidden">
          {/* Header with toggle button */}
          <div className="flex items-center justify-between">
            {isExpanded && dockWidth > CONTENT_MIN_WIDTH && (
              <div className="text-lg font-semibold">📦 Collections</div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDock}
              className={`p-2 ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              } ${
                !isExpanded || dockWidth <= CONTENT_MIN_WIDTH ? "w-full" : ""
              }`}
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded && dockWidth > CONTENT_MIN_WIDTH ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Collections list - only show when expanded and wide enough */}
          {isExpanded && dockWidth > CONTENT_MIN_WIDTH && (
            <>
              <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                {collections.map((col) => {
                  const isCollectionExpanded = expandedCollections.has(col.id);
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
                                No fields yet
                              </div>
                            ) : (
                              col.fields.map((field, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-2 rounded text-xs ${
                                    isDark
                                      ? "bg-gray-700/50 hover:bg-gray-700"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  } transition-colors cursor-pointer`}
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
                                          ? "bg-yellow-900/30 text-yellow-300"
                                          : "bg-orange-100 text-orange-700"
                                      }`}
                                    >
                                      {field.type}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Collapsed state - show only icons */}
          {(!isExpanded || dockWidth <= CONTENT_MIN_WIDTH) && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <div
                className={`text-xs font-medium text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                📦
              </div>
              <div
                className={`text-xs text-center ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {collections.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="w-1 cursor-col-resize hover:w-2 transition-all duration-200 bg-transparent mx-1"
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
      />

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
