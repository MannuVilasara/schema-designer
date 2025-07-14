"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Copy,
  Download,
  X,
  Code2,
  Maximize2,
  Minimize2,
  GripVertical,
  Move,
  RotateCcw,
  Settings,
} from "lucide-react";
import { Button } from "../ui/button";
import { generateCode, ORM, ORM_LABELS, CODE_GENERATORS } from "@/generators";
import { useSchemaStore } from "@/store/schemaStore";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

interface CodeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCollectionId: string | null;
}

export default function CodeSidebar({
  isOpen,
  onClose,
  selectedCollectionId,
}: CodeSidebarProps) {
  const [selectedORM, setSelectedORM] = useState<ORM>("mongoose");
  const [isMinimized, setIsMinimized] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDocked, setIsDocked] = useState(true);

  const { collections, connections } = useSchemaStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const dragControls = useDragControls();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const selectedCollection = useMemo(() => {
    return collections.find((col) => col.id === selectedCollectionId);
  }, [collections, selectedCollectionId]);

  const generatedCode = useMemo(() => {
    if (!selectedCollection) return "";
    try {
      return generateCode(
        selectedORM,
        selectedCollection,
        collections,
        connections
      );
    } catch (error) {
      return `// Error generating code: ${error}`;
    }
  }, [selectedCollection, selectedORM, collections, connections]);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      if (isDocked) {
        const newWidth =
          typeof window !== "undefined" ? window.innerWidth - e.clientX : 320;
        setSidebarWidth(
          Math.min(
            Math.max(newWidth, 320),
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
  }, [isResizing, isDocked]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy code");
    }
  };

  const downloadFile = () => {
    if (!selectedCollection) return;

    const generator = CODE_GENERATORS[selectedORM];
    const filename = `${selectedCollection.name}${generator.fileExtension}`;
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleUndock = () => {
    setIsDocked(false);
    setPosition({
      x:
        typeof window !== "undefined"
          ? window.innerWidth - sidebarWidth - 50
          : 400,
      y: 50,
    });
  };

  const handleDock = () => {
    setIsDocked(true);
    setPosition({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setSidebarWidth(480);
    setPosition({ x: 0, y: 0 });
    setIsDocked(true);
    setIsMinimized(false);
  };

  if (!selectedCollection) {
    return null;
  }

  const sidebarVariants = {
    docked: {
      position: "fixed" as const,
      right: 0,
      top: 0,
      x: 0,
      y: 0,
      width: sidebarWidth,
      height: "100vh",
    },
    floating: {
      position: "fixed" as const,
      right: "auto",
      top: "auto",
      x: position.x,
      y: position.y,
      width: sidebarWidth,
      height: isMinimized ? "auto" : "70vh",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sidebarRef}
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
          initial={isDocked ? { x: "100%" } : false}
          animate={isDocked ? { x: 0 } : sidebarVariants.floating}
          exit={{
            x: isDocked ? "100%" : position.x + sidebarWidth,
            opacity: 0,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`backdrop-blur-md border shadow-2xl z-50 flex flex-col rounded-lg overflow-hidden ${
            isDark
              ? "bg-gray-900/95 border-gray-700"
              : "bg-white/95 border-gray-200"
          } ${isDocked ? "rounded-none rounded-l-lg" : "rounded-lg"}`}
          style={{
            width: sidebarWidth,
            minWidth: 320,
            maxWidth: "80vw",
          }}
        >
          {/* Resize handle for docked mode */}
          {isDocked && (
            <div
              ref={resizeRef}
              className={`absolute left-0 top-0 w-1 h-full cursor-col-resize hover:w-2 transition-all duration-200 ${
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
                <Code2
                  className={`w-5 h-5 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h3
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Code Generator
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
                    title="Dock to right"
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={`${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="space-y-3">
                <div>
                  <label
                    className={`text-sm font-medium block mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Collection
                  </label>
                  <div
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-gray-200"
                        : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                  >
                    {selectedCollection.name}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium block mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    ORM Framework
                  </label>
                  <select
                    value={selectedORM}
                    onChange={(e) => setSelectedORM(e.target.value as ORM)}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {Object.entries(ORM_LABELS).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        className={isDark ? "bg-gray-800" : "bg-white"}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Code Display */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className={`p-4 border-b flex-shrink-0 ${
                  isDark
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Generated {ORM_LABELS[selectedORM]} Schema
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className={`${
                        isDark
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadFile}
                      className={`${
                        isDark
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  language={CODE_GENERATORS[selectedORM].language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    height: "100%",
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {generatedCode}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Footer */}
          {!isMinimized && (
            <div
              className={`p-4 border-t flex-shrink-0 ${
                isDark
                  ? "border-gray-700 bg-gray-800/30"
                  : "border-gray-200 bg-gray-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Generated schema for{" "}
                  <span
                    className={`font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {selectedCollection.name}
                  </span>{" "}
                  collection
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{generatedCode.split("\n").length} lines</span>
                  <span>•</span>
                  <span>{Math.round(generatedCode.length / 1024)}KB</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
