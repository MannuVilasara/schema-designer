"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "framer-motion";
import React, {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSchemaStore } from "@/store/schemaStore";
import { Download, Moon, Sun, Trash2, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

import "@/styles/BottomDock.css"; // Ensure this path is correct

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    if (!ref.current) return distance + 1;

    const rect = ref.current.getBoundingClientRect();
    return val - rect.x - rect.width / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  const size = useSpring(targetSize, {
    mass: 0.02,
    stiffness: 400,
    damping: 20,
  });

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement<any>, { isHovered })
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = "", isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    let timeoutId: NodeJS.Timeout;

    const unsubscribe = isHovered.on("change", (latest) => {
      if (latest === 1) {
        // Show immediately on hover
        clearTimeout(timeoutId);
        setIsVisible(true);
      } else {
        // Hide with a small delay to prevent flickering
        timeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 100);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [isHovered]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: -5, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function BottomDock({
  className = "",
  spring = { mass: 0.05, stiffness: 300, damping: 20 },
  magnification = 60,
  distance = 120,
  panelHeight = 60,
  dockHeight = 120,
  baseItemSize = 48,
}: Omit<DockProps, "items">) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get store functions
  const exportSchema = useSchemaStore((state) => state.exportSchema);
  const importSchema = useSchemaStore((state) => state.importSchema);
  const clearCanvas = useSchemaStore((state) => state.clearCanvas);
  const leftSidebarDocked = useSchemaStore((state) => state.leftSidebarDocked);

  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Only run on client side after hydration
  useEffect(() => {
    setMounted(true);

    // Show a helpful toast on first load
    const hasSeenDockInfo = localStorage.getItem("schemer-dock-info-seen");
    if (!hasSeenDockInfo) {
      setTimeout(() => {
        toast("💡 Dock auto-hides when mouse moves away from bottom", {
          duration: 4000,
          icon: "ℹ️",
        });
        localStorage.setItem("schemer-dock-info-seen", "true");
      }, 2000);
    }
  }, []);

  // Auto-hide functionality based on mouse position
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseY.set(e.clientY);
      const windowHeight = window.innerHeight;
      const triggerZone = windowHeight - 150; // Show when mouse is within 150px of bottom

      if (e.clientY > triggerZone) {
        setIsVisible(true);
      } else {
        // Add a small delay before hiding to prevent flickering
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 500);

        // Clear timer if mouse comes back to trigger zone
        const checkTimer = setInterval(() => {
          if (mouseY.get() > triggerZone) {
            clearTimeout(hideTimer);
            clearInterval(checkTimer);
          }
        }, 50);

        // Cleanup after delay
        setTimeout(() => {
          clearInterval(checkTimer);
        }, 500);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, mouseY]);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} theme`);
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected for import");
      return;
    }

    // Check file type
    if (!file.name.endsWith(".json")) {
      toast.error("Please select a JSON file");
      event.target.value = "";
      return;
    }

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

    reader.onerror = () => {
      toast.error("Failed to read the file");
    };

    reader.readAsText(file);

    // Clear the input value so the same file can be imported again
    event.target.value = "";
  };

  const handleClearCanvas = () => {
    toast.custom(
      (t) => (
        <div
          style={{
            padding: "1rem 1.25rem",
            minWidth: 280,
            background: "var(--toast-bg, #18181b)",
            color: "var(--toast-fg, #fff)",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            border: "1px solid #333",
            fontSize: "1rem",
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22, marginRight: 6 }}>⚠️</span>
            <span>Clear Canvas?</span>
          </div>
          <div
            style={{ fontSize: "0.95rem", color: "#cbd5e1", marginBottom: 2 }}
          >
            This will remove all collections and fields.
            <br />
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              This action cannot be undone.
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              style={{
                background: "linear-gradient(90deg,#ef4444 60%,#dc2626 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.1rem",
                fontWeight: 600,
                fontSize: "0.98rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239,68,68,0.12)",
                transition: "background 0.2s",
              }}
              onClick={() => {
                clearCanvas();
                toast.dismiss(t.id);
                toast.success("Canvas cleared successfully!");
              }}
            >
              Yes, clear
            </button>
            <button
              style={{
                background: "linear-gradient(90deg,#2563eb 60%,#1d4ed8 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.1rem",
                fontWeight: 600,
                fontSize: "0.98rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.12)",
                transition: "background 0.2s",
              }}
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 7000 }
    );
  };

  const dockItems: DockItemData[] = [
    {
      icon: <Upload className="w-4 h-4" />,
      label: "Export",
      onClick: handleExport,
    },
    {
      icon: <Download className="w-4 h-4" />,
      label: "Import",
      onClick: handleImport,
    },
    {
      icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      label: "Theme",
      onClick: toggleTheme,
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: "Clear",
      onClick: handleClearCanvas,
    },
  ];

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + 20),
    [magnification, dockHeight]
  );

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, {
    mass: 0.05,
    stiffness: 400,
    damping: 25,
  });

  // Dock visibility animation
  const dockY = useSpring(isVisible ? 0 : 100, {
    mass: 0.05,
    stiffness: 300,
    damping: 25,
  });

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              mass: 0.05,
              stiffness: 300,
              damping: 25,
            }}
            style={{
              height,
              scrollbarWidth: "none",
              y: dockY,
            }}
            className={`dock-outer ${
              leftSidebarDocked ? "with-left-sidebar" : "without-left-sidebar"
            }`}
          >
            <motion.div
              onMouseMove={({ pageX }) => {
                isHovered.set(1);
                mouseX.set(pageX);
              }}
              onMouseLeave={() => {
                isHovered.set(0);
                mouseX.set(Infinity);
              }}
              className={`dock-panel ${className}`}
              style={{ height: panelHeight }}
              role="toolbar"
              aria-label="Application dock"
            >
              {dockItems.map((item, index) => (
                <DockItem
                  key={index}
                  onClick={item.onClick}
                  className={item.className}
                  mouseX={mouseX}
                  spring={spring}
                  distance={distance}
                  magnification={magnification}
                  baseItemSize={baseItemSize}
                >
                  <DockIcon>{item.icon}</DockIcon>
                  <DockLabel>{item.label}</DockLabel>
                </DockItem>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        style={{ display: "none" }}
      />
    </>
  );
}
