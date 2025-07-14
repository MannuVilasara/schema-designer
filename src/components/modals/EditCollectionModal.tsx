"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import type { EditCollectionModalProps } from "@/types";

export default function EditCollectionModal({
  isOpen,
  collection,
  position,
  onClose,
  onSave,
}: EditCollectionModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [collectionName, setCollectionName] = useState("");
  const [nameError, setNameError] = useState("");

  // Validate collection name
  const validateCollectionName = (name: string) => {
    if (name.includes(" ")) {
      setNameError("Collection name cannot contain spaces");
      return false;
    }
    if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      setNameError(
        "Collection name must start with a letter or underscore and contain only letters, numbers, and underscores"
      );
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollectionName(value);
    if (value.trim()) {
      validateCollectionName(value.trim());
    } else {
      setNameError("");
    }
  };

  useEffect(() => {
    if (collection) {
      setCollectionName(collection.name);
      setNameError(""); // Reset error when collection changes
    }
  }, [collection]);

  const getModalStyle = () => {
    if (!position) return {};

    const modalWidth = 320; // Reduced from 400
    const modalHeight = 280; // Reduced from 350
    const padding = 20;

    // Center the modal around the click position
    let finalX = position.x - modalWidth / 2;
    let finalY = position.y - modalHeight / 2;

    // Adjust for screen edges
    if (finalX < padding) finalX = padding;
    if (finalX + modalWidth > window.innerWidth - padding) {
      finalX = window.innerWidth - modalWidth - padding;
    }
    if (finalY < padding) finalY = padding;
    if (finalY + modalHeight > window.innerHeight - padding) {
      finalY = window.innerHeight - modalHeight - padding;
    }

    return {
      left: `${finalX}px`,
      top: `${finalY}px`,
      position: "fixed" as const,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = collectionName.trim();
    if (trimmedName && collection && validateCollectionName(trimmedName)) {
      onSave(collection.id, trimmedName);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !collection) return null;

  const hasTimestampFields = collection.fields.some(
    (field) => field.name === "createdAt" || field.name === "updatedAt"
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className={`w-80 rounded-lg border shadow-lg ${
          isDark
            ? "bg-gray-800 border-gray-600 text-white"
            : "bg-white border-gray-200 text-gray-800"
        }`}
        style={position ? getModalStyle() : {}}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold">Edit Collection</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collectionName">Collection Name</Label>
            <Input
              id="collectionName"
              type="text"
              value={collectionName}
              onChange={handleNameChange}
              placeholder="Enter collection name (no spaces)"
              required
              autoFocus
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Collection Info</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Total Fields:
                </span>
                <span className="font-medium">{collection.fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Has Timestamps:
                </span>
                <span className="font-medium">
                  {hasTimestampFields ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!collectionName.trim() || !!nameError}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
