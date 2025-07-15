'use client';

import React, { useEffect, useState } from 'react';
import { Navbar, Dock } from '@/components';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerModals } from './DesignerModals';
import { useFileOperations } from '../hooks/useFileOperations';
import { useDesignerActions } from '../hooks/useDesignerActions';

export const DesignerPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const { 
    fileInputRef, 
    handleExport, 
    handleImport, 
    handleFileImport, 
    handleClearCanvas 
  } = useFileOperations();
  
  const { openCodeSidebar } = useDesignerActions();

  // Only run on client side after hydration
  useEffect(() => {}, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-col h-screen pt-16">
        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden" style={{ border: '2px solid blue' }}>
          <div className="absolute inset-0" style={{ border: '2px solid green' }}>
            <DesignerCanvas />
          </div>
        </div>

        {/* Dock - Temporarily commented out for debugging */}
        {/* <Dock /> */}
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* All Modals */}
      <DesignerModals />
    </div>
  );
};