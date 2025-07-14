"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components";
import { useTheme } from "next-themes";
import { X, Plus } from "lucide-react";

type AddFieldModalProps = {
  isOpen: boolean;
  collectionName: string;
  position?: { x: number; y: number };
  onClose: () => void;
  onAddField: (field: {
    name: string;
    type: string;
    required: boolean;
  }) => void;
};

const fieldTypes = [
  "string",
  "number",
  "boolean",
  "date",
  "array",
  "object",
  "objectId",
];

export default function AddFieldModal({
  isOpen,
  collectionName,
  position,
  onClose,
  onAddField,
}: AddFieldModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [isRequired, setIsRequired] = useState(false);

  // Calculate modal position near the collection
  const getModalStyle = () => {
    if (position) {
      const modalWidth = 320; // w-80 = 320px
      const modalHeight = 400; // Estimated height for form

      // Calculate position with bounds checking
      let left = position.x + 20; // Small offset from collection
      let top = position.y + 20;

      // Ensure modal doesn't go off-screen
      if (left + modalWidth > window.innerWidth) {
        left = position.x - modalWidth - 20; // Show to the left instead
      }
      if (top + modalHeight > window.innerHeight) {
        top = position.y - modalHeight - 20; // Show above instead
      }

      // Ensure minimum margins
      left = Math.max(10, Math.min(left, window.innerWidth - modalWidth - 10));
      top = Math.max(10, Math.min(top, window.innerHeight - modalHeight - 10));

      return {
        position: "fixed" as const,
        left,
        top,
        zIndex: 50,
      };
    }
    return {}; // Default centering will be handled by CSS
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    onAddField({
      name: fieldName.trim(),
      type: fieldType,
      required: isRequired,
    });

    // Reset form
    setFieldName("");
    setFieldType("string");
    setIsRequired(false);
    onClose();
  };

  const handleClose = () => {
    setFieldName("");
    setFieldType("string");
    setIsRequired(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalStyle = getModalStyle();
  const isPositioned = position && Object.keys(modalStyle).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />

      {/* Modal Card */}
      <div
        className={`w-80 max-w-sm rounded-xl shadow-2xl border backdrop-blur-sm z-50 ${
          isDark
            ? "bg-gray-800/95 border-gray-600 text-white"
            : "bg-white/95 border-gray-200 text-gray-900"
        } ${isPositioned ? "fixed" : "relative"}`}
        style={
          isPositioned
            ? modalStyle
            : {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
        }
      >
        {/* Card Header */}
        <div
          className={`p-4 border-b ${
            isDark ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-50 text-green-600"
                }`}
              >
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold">
                Add Field to {collectionName}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className={`h-8 w-8 rounded-lg ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fieldName" className="text-sm font-medium">
                Field Name
              </Label>
              <Input
                id="fieldName"
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Enter field name"
                className={isDark ? "bg-gray-700 border-gray-600" : ""}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="fieldType" className="text-sm font-medium">
                Field Type
              </Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger
                  className={isDark ? "bg-gray-700 border-gray-600" : ""}
                >
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="required" className="text-sm">
                Required field
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!fieldName.trim()}
              >
                Add Field
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
