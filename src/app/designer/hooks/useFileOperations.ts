import { useRef, useCallback } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { 
  exportSchemaToFile, 
  importSchemaFromFile, 
  createClearCanvasToast 
} from '../utils/schemaUtils';
import toast from 'react-hot-toast';

export const useFileOperations = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportSchema, importSchema, clearCanvas } = useSchemaStore();

  const handleExport = useCallback(() => {
    exportSchemaToFile(exportSchema);
  }, [exportSchema]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importSchemaFromFile(file, importSchema);
    }
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  }, [importSchema]);

  const handleClearCanvas = useCallback(() => {
    createClearCanvasToast(clearCanvas, () => {
      toast.success('Canvas cleared successfully!');
    });
  }, [clearCanvas]);

  return {
    fileInputRef,
    handleExport,
    handleImport,
    handleFileImport,
    handleClearCanvas,
  };
};