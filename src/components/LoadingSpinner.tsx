"use client";
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  );
}
