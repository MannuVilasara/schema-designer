import React from "react";

interface FooterProps {
  isDark: boolean;
}

export default function Footer({ isDark }: FooterProps) {
  return (
    <footer className={`text-center py-8 border-t transition-colors relative z-10 ${
      isDark 
        ? 'border-white/10 text-gray-500' 
        : 'border-gray-200 text-gray-600'
    }`}>
      © 2025 Manpreet Singh – Built with Next.js and Framer Motion.
    </footer>
  );
}
