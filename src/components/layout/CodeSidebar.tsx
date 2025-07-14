import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Download, X, Code2 } from "lucide-react";
import { Button } from "../ui/button";
import { generateCode, ORM, ORM_LABELS, CODE_GENERATORS } from "@/generators";
import { useSchemaStore } from "@/store/schemaStore";

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
  const { collections, connections } = useSchemaStore();

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
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
  };

  if (!selectedCollection) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 backdrop-blur-md bg-white/10 border-l border-white/20 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/20 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Code Generator
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-white/80 block mb-2">
                  Collection
                </label>
                <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                  {selectedCollection.name}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/80 block mb-2">
                  ORM Framework
                </label>
                <select
                  value={selectedORM}
                  onChange={(e) => setSelectedORM(e.target.value as ORM)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  {Object.entries(ORM_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gray-800">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/20 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  Generated {ORM_LABELS[selectedORM]} Schema
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadFile}
                    className="text-white/60 hover:text-white hover:bg-white/10"
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
                }}
                showLineNumbers
                wrapLines
              >
                {generatedCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-white/5">
            <p className="text-xs text-white/60 text-center">
              Generated schema for{" "}
              <span className="font-medium text-white/80">
                {selectedCollection.name}
              </span>{" "}
              collection
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
