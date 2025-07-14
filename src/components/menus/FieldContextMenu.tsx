"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Edit3, Trash2, Plus } from "lucide-react";
import type { FieldContextMenuProps } from "@/types";

export default function FieldContextMenu({
  x,
  y,
  collectionId,
  fieldIndex,
  fieldName,
  onClose,
  onEditField,
  onDeleteField,
  onAddField,
}: FieldContextMenuProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the menu and handle edge cases
  const getMenuStyle = () => {
    const menuWidth = 180;
    const menuHeight = 120;
    const padding = 10;

    let finalX = x;
    let finalY = y;

    // Adjust for right edge
    if (
      typeof window !== "undefined" &&
      x + menuWidth > window.innerWidth - padding
    ) {
      finalX = x - menuWidth;
    }

    // Adjust for bottom edge
    if (
      typeof window !== "undefined" &&
      y + menuHeight > window.innerHeight - padding
    ) {
      finalY = y - menuHeight;
    }

    return {
      left: `${Math.max(padding, finalX)}px`,
      top: `${Math.max(padding, finalY)}px`,
    };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleEditField = () => {
    onEditField(collectionId, fieldIndex, { x, y });
    onClose();
  };

  const handleDeleteField = () => {
    onDeleteField(collectionId, fieldIndex, { x, y });
    onClose();
  };

  const handleAddField = () => {
    onAddField(collectionId, { x, y });
    onClose();
  };

  const isIdField = fieldName === "_id";

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-44 rounded-lg border shadow-lg ${
        isDark
          ? "bg-gray-800 border-gray-600 text-white"
          : "bg-white border-gray-200 text-gray-800"
      }`}
      style={getMenuStyle()}
    >
      <div className="py-1">
        <button
          onClick={handleEditField}
          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-80 transition-colors ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit field
        </button>

        <button
          onClick={handleAddField}
          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-80 transition-colors ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add new field
        </button>

        {!isIdField && (
          <>
            <div
              className={`my-1 border-t ${
                isDark ? "border-gray-600" : "border-gray-200"
              }`}
            />
            <button
              onClick={handleDeleteField}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-opacity-80 transition-colors ${
                isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete field
            </button>
          </>
        )}
      </div>
    </div>
  );
}
