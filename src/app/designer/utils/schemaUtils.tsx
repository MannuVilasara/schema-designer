import React from 'react';
import toast from 'react-hot-toast';

export const exportSchemaToFile = (exportSchema: () => string) => {
  try {
    const schemaData = exportSchema();
    const blob = new Blob([schemaData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mongodb-schema-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Schema exported successfully!');
  } catch (error) {
    console.error('Failed to export schema:', error);
    toast.error('Failed to export schema. Please try again.');
  }
};

export const importSchemaFromFile = (
  file: File,
  importSchema: (data: string) => void
) => {
  if (!file) {
    toast.error('No file selected for import');
    return;
  }

  if (!file.name.endsWith('.json')) {
    toast.error('Please select a JSON file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const schemaData = JSON.parse(content);
      
      // Validate schema structure
      if (!schemaData || typeof schemaData !== 'object') {
        throw new Error('Invalid schema format');
      }

      importSchema(content);
      toast.success('Schema imported successfully!');
    } catch (error) {
      console.error('Failed to import schema:', error);
      toast.error('Failed to import schema. Please check the file format.');
    }
  };
  
  reader.onerror = () => {
    toast.error('Failed to read file');
  };
  
  reader.readAsText(file);
};

export const createClearCanvasToast = (
  clearCanvas: () => void,
  onSuccess: () => void
) => {
  return toast.custom(
    (t) => (
      <div
        style={{
          padding: '1rem 1.25rem',
          minWidth: 280,
          background: 'var(--toast-bg, #18181b)',
          color: 'var(--toast-fg, #fff)',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          border: '1px solid #333',
          fontSize: '1rem',
          fontWeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 22, marginRight: 6 }}>⚠️</span>
          <span>Clear Canvas?</span>
        </div>
        <div
          style={{
            fontSize: '0.95rem',
            color: '#cbd5e1',
            marginBottom: 2,
          }}
        >
          This will remove all collections and fields.
          <br />
          <span style={{ color: '#ef4444', fontWeight: 600 }}>
            This action cannot be undone.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            style={{
              background: 'linear-gradient(90deg,#ef4444 60%,#dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1.1rem',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239,68,68,0.12)',
              transition: 'background 0.2s',
            }}
            onClick={() => {
              clearCanvas();
              toast.dismiss(t.id);
              onSuccess();
            }}
          >
            Yes, clear
          </button>
          <button
            style={{
              background: 'linear-gradient(90deg,#2563eb 60%,#1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1.1rem',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
              transition: 'background 0.2s',
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