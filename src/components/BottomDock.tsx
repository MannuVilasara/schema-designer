"use client";

import { Button } from "@/components";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function BottomDock() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

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
        <Button variant="secondary">Export Code</Button>
        <Button variant="secondary">Save Schema</Button>
      </div>
    </div>
  );
}
