"use client";

import { useMemo, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { useTheme } from "next-themes";
import { useSchemaStore } from "@/store/schemaStore";
import toast from "react-hot-toast";
import {
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  Braces,
  ExternalLink,
  Database,
  Link,
  X,
} from "lucide-react";
import type { CollectionNodeProps } from "@/types";

export default function CollectionNode({ data }: CollectionNodeProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const connections = useSchemaStore((state) => state.connections);
  const getFieldConnections = useSchemaStore(
    (state) => state.getFieldConnections
  );
  const removeConnection = useSchemaStore((state) => state.removeConnection);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Calculate dynamic height based on field count
  const getCollectionHeight = () => {
    const headerHeight = 80; // Header section height
    const fieldHeight = 36; // Each field row height (more precise measurement)
    const containerPadding = 16; // Container padding (px-3 py-2 = 12px + 4px)
    const spaceBetweenFields = 6; // space-y-1.5 = 6px
    const minFieldsHeight = 60; // Minimum height for "No fields yet" state

    if (data.fields.length === 0) {
      return headerHeight + minFieldsHeight;
    }

    // Calculate total fields height including spaces between them
    const totalFieldsHeight = data.fields.length * fieldHeight;
    const totalSpacingHeight = Math.max(
      0,
      (data.fields.length - 1) * spaceBetweenFields
    );
    const fieldsHeight =
      totalFieldsHeight + totalSpacingHeight + containerPadding;
    const totalHeight = headerHeight + fieldsHeight;

    // Set reasonable limits: min 140px, max 500px
    return Math.min(Math.max(totalHeight, 140), 500);
  };

  // Determine if we need scrolling (when hitting max height)
  const needsScrolling = () => {
    const headerHeight = 80;
    const fieldHeight = 36;
    const containerPadding = 16;
    const spaceBetweenFields = 6;
    const maxHeight = 500;

    const totalFieldsHeight = data.fields.length * fieldHeight;
    const totalSpacingHeight = Math.max(
      0,
      (data.fields.length - 1) * spaceBetweenFields
    );
    const fieldsHeight =
      totalFieldsHeight + totalSpacingHeight + containerPadding;

    return headerHeight + fieldsHeight > maxHeight;
  };

  const collectionHeight = getCollectionHeight();
  const showScrolling = needsScrolling();

  // Pre-calculate style values to prevent flickering during drag
  const dynamicStyles = useMemo(
    () => ({
      height: `${collectionHeight}px`,
      width: "auto",
      borderWidth: data.fields.length > 8 ? "3px" : "2px",
      borderRadius: data.fields.length > 6 ? "12px" : "8px",
      zIndex: 1,
    }),
    [collectionHeight, data.fields.length]
  );

  const getFieldIcon = (type: string) => {
    const iconClass = "w-3 h-3";
    switch (type) {
      case "string":
        return <Type className={iconClass} />;
      case "number":
        return <Hash className={iconClass} />;
      case "boolean":
        return <ToggleLeft className={iconClass} />;
      case "date":
        return <Calendar className={iconClass} />;
      case "array":
        return <List className={iconClass} />;
      case "object":
        return <Braces className={iconClass} />;
      case "objectId":
        return <ExternalLink className={iconClass} />;
      default:
        return <Type className={iconClass} />;
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (data.onContextMenu) {
      data.onContextMenu(event, data.id, data.name);
    }
  };

  const handleFieldContextMenu = (
    event: React.MouseEvent,
    fieldIndex: number,
    fieldName: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (data.onFieldContextMenu) {
      data.onFieldContextMenu(event, data.id, fieldIndex, fieldName);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data.onCloseMenus) {
      data.onCloseMenus();
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (data.onCloseMenus) {
      data.onCloseMenus();
    }
  };

  const handleRemoveConnection = (
    event: React.MouseEvent,
    connectionId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    removeConnection(connectionId);
    toast.success("Connection removed successfully");
  };

  return (
    <div
      className={`rounded-lg shadow-lg border min-w-64 max-w-80 hover:border-blue-400 transition-colors cursor-pointer relative ${
        isDark
          ? "bg-gray-800 border-blue-400 text-white"
          : "bg-white border-blue-200 text-gray-800"
      }`}
      style={dynamicStyles}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Collection Header */}
      <div
        className={`px-4 py-3 border-b ${
          isDark ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Database className="w-4 h-4" />
          <span className="font-semibold text-lg">{data.name}</span>
        </div>
        <div
          className={`text-center text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {data.fields.length} field{data.fields.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Fields List */}
      <div
        className={`px-3 py-2 ${
          showScrolling
            ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
            : "overflow-hidden"
        }`}
        style={{
          height: showScrolling
            ? `${collectionHeight - 80}px` // Subtract header height
            : "auto",
        }}
      >
        {data.fields.length > 0 ? (
          <div className="space-y-1.5">
            {data.fields.map((field, index) => {
              const isIdField = field.name === "_id";
              const isObjectIdField = field.type === "objectId";
              const fieldConnections = getFieldConnections(data.id, index);
              const hasConnections = fieldConnections.length > 0;
              const canAcceptMoreConnections =
                isIdField || fieldConnections.length === 0;

              return (
                <div
                  key={index}
                  className={`relative flex items-center justify-between py-2 px-2 rounded-md text-xs transition-colors cursor-pointer ${
                    isIdField
                      ? isDark
                        ? "bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50"
                        : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                      : isDark
                      ? "bg-gray-700/50 hover:bg-gray-700"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={handleClick}
                  onMouseDown={handleMouseDown}
                  onContextMenu={(e) =>
                    handleFieldContextMenu(e, index, field.name)
                  }
                >
                  {/* Left connection handle for objectId fields */}
                  {isObjectIdField && (
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`${data.id}-field-${index}-target`}
                      className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white transition-all ${
                        canAcceptMoreConnections
                          ? hasConnections
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      style={{
                        left: "-6px",
                        zIndex: 10,
                      }}
                      isConnectable={canAcceptMoreConnections}
                    />
                  )}

                  {/* Right connection handle for objectId fields */}
                  {isObjectIdField && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`${data.id}-field-${index}-source`}
                      className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white transition-all ${
                        canAcceptMoreConnections
                          ? hasConnections
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      style={{
                        right: "-6px",
                        zIndex: 10,
                      }}
                      isConnectable={canAcceptMoreConnections}
                    />
                  )}

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded ${
                        isIdField
                          ? isDark
                            ? "bg-blue-600 text-blue-100"
                            : "bg-blue-500 text-white"
                          : isDark
                          ? "bg-gray-600 text-gray-300"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {getFieldIcon(field.type)}
                    </div>
                    <span
                      className={`truncate ${
                        isIdField ? "font-bold" : "font-medium"
                      }`}
                    >
                      {field.name}
                    </span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                    {/* Connection indicator */}
                    {hasConnections && (
                      <div className="flex items-center gap-1">
                        <Link className="w-3 h-3 text-green-500" />
                        <span className="text-green-500 text-xs">
                          {fieldConnections.length}
                        </span>
                        {/* Show remove buttons for each connection - only for non-_id fields */}
                        {!isIdField &&
                          fieldConnections.map((connection) => (
                            <button
                              key={connection.id}
                              onClick={(e) =>
                                handleRemoveConnection(e, connection.id)
                              }
                              className="ml-1 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                              title="Remove connection"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      isIdField
                        ? isDark
                          ? "bg-blue-500/30 text-blue-200"
                          : "bg-blue-200 text-blue-800"
                        : isDark
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {field.type}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`text-center py-4 text-sm ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            No fields yet
          </div>
        )}
      </div>
    </div>
  );
}
