"use client";

import { Button } from "@/components/ui/button";
import { useSchemaStore } from "@/store/schemaStore";
import { Download, Moon, Sun, Trash2, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function BottomDock() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get store functions
  const exportSchema = useSchemaStore((state) => state.exportSchema);
  const importSchema = useSchemaStore((state) => state.importSchema);
  const clearCanvas = useSchemaStore((state) => state.clearCanvas);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleExport = () => {
    try {
      const schemaData = exportSchema();
      const blob = new Blob([schemaData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mongodb-schema-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Schema exported successfully!");
    } catch (error) {
      console.error("Failed to export schema:", error);
      toast.error("Failed to export schema. Please try again.");
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          importSchema(content);
          toast.success("Schema imported successfully!");
        } catch (error) {
          console.error("Failed to import schema:", error);
          toast.error("Failed to import schema. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = "";
  };

  const handleClear = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Clear Canvas</div>
          <div className="text-xs text-gray-600">
            Are you sure you want to clear the entire canvas? This action cannot
            be undone.
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                clearCanvas();
                toast.dismiss(t.id);
                toast.success("Canvas cleared successfully!");
              }}
            >
              Clear
            </button>
            <button
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    );
  };

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="absolute bottom-0 left-0 right-0 h-14 border-t px-6 flex items-center justify-between z-10 bg-white border-gray-200">
        <div className="font-medium text-gray-900">
          💻 MongoDB Schema Designer
        </div>
        <div className="flex gap-3 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-900 hover:bg-gray-100"
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="destructive" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-14 border-t px-6 flex items-center justify-between z-10 ${
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
        💻 MongoDB Schema Designer
      </div>
      <div className="flex gap-3 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={
            isDark
              ? "text-white hover:bg-gray-800"
              : "text-gray-900 hover:bg-gray-100"
          }
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="secondary" onClick={handleImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="destructive" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
