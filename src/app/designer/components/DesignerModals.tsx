import React from 'react';
import {
  AddFieldModal,
  ConfirmDialog,
  ConfirmFieldDeleteDialog,
  ContextMenu,
  CreateCollectionModal,
  EditCollectionModal,
  EditFieldModal,
  FieldContextMenu,
  CodeGenerationModal,
} from '@/components';
import { useDesignerActions } from '../hooks/useDesignerActions';
import { useSchemaStore } from '@/store/schemaStore';

export const DesignerModals: React.FC = () => {
  const collections = useSchemaStore((state) => state.collections);
  
  const {
    // Modal states
    contextMenu,
    fieldContextMenu,
    addFieldModal,
    confirmDelete,
    createCollectionModal,
    editFieldModal,
    confirmFieldDelete,
    editCollectionModal,
    codeSidebar,
    
    // Actions
    closeContextMenu,
    closeFieldContextMenu,
    closeAddFieldModal,
    closeConfirmDelete,
    closeCreateCollectionModal,
    closeEditFieldModal,
    closeConfirmFieldDelete,
    closeEditCollectionModal,
    closeCodeSidebar,
    
    // Handlers
    handleCreateCollection,
    handleEditCollection,
    handleDeleteCollection,
    handleDuplicateCollection,
    handleAddField,
    handleEditField,
    handleDeleteField,
    handleOpenAddField,
    handleOpenEditField,
    handleOpenDeleteField,
    handleOpenEditCollection,
    handleOpenDeleteCollection,
  } = useDesignerActions();

  // Wrapper functions to match expected signatures
  const handleContextAddField = (id: string, position?: { x: number; y: number }) => {
    const collection = collections.find(col => col.id === id);
    if (collection) {
      handleOpenAddField(id, collection.name, position);
    }
  };

  const handleContextEditCollection = (id: string, position?: { x: number; y: number }) => {
    handleOpenEditCollection(id, position);
  };

  const handleContextDeleteCollection = (id: string, position?: { x: number; y: number }) => {
    handleOpenDeleteCollection(id, position);
  };

  const handleFieldContextAddField = (collectionId: string, position?: { x: number; y: number }) => {
    const collection = collections.find(col => col.id === collectionId);
    if (collection) {
      handleOpenAddField(collectionId, collection.name, position);
    }
  };

  return (
    <>
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          collectionId={contextMenu.collectionId}
          collectionName={contextMenu.collectionName}
          onClose={closeContextMenu}
          onAddField={handleContextAddField}
          onEditCollection={handleContextEditCollection}
          onDelete={handleContextDeleteCollection}
          onDuplicate={handleDuplicateCollection}
        />
      )}

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={addFieldModal.isOpen}
        collectionName={addFieldModal.collectionName}
        position={addFieldModal.position}
        onClose={closeAddFieldModal}
        onAddField={handleAddField}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Collection"
        message={`Are you sure you want to delete the "${confirmDelete.collectionName}" collection? This action cannot be undone.`}
        position={confirmDelete.position}
        onConfirm={handleDeleteCollection}
        onCancel={closeConfirmDelete}
      />

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={createCollectionModal.isOpen}
        position={createCollectionModal.position}
        onClose={closeCreateCollectionModal}
        onCreateCollection={handleCreateCollection}
      />

      {/* Field Context Menu */}
      {fieldContextMenu && (
        <FieldContextMenu
          x={fieldContextMenu.x}
          y={fieldContextMenu.y}
          collectionId={fieldContextMenu.collectionId}
          fieldIndex={fieldContextMenu.fieldIndex}
          fieldName={fieldContextMenu.fieldName}
          onClose={closeFieldContextMenu}
          onEditField={handleOpenEditField}
          onDeleteField={handleOpenDeleteField}
          onAddField={handleFieldContextAddField}
        />
      )}

      {/* Edit Field Modal */}
      <EditFieldModal
        isOpen={editFieldModal.isOpen}
        field={editFieldModal.field}
        position={editFieldModal.position}
        onClose={closeEditFieldModal}
        onSave={handleEditField}
      />

      {/* Confirm Field Delete Dialog */}
      <ConfirmFieldDeleteDialog
        isOpen={confirmFieldDelete.isOpen}
        fieldName={confirmFieldDelete.fieldName}
        position={confirmFieldDelete.position}
        onConfirm={handleDeleteField}
        onCancel={closeConfirmFieldDelete}
      />

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={editCollectionModal.isOpen}
        collection={editCollectionModal.collection}
        position={editCollectionModal.position}
        onClose={closeEditCollectionModal}
        onSave={handleEditCollection}
      />

      {/* Code Generation Modal */}
      <CodeGenerationModal
        isOpen={codeSidebar.isOpen}
        selectedCollectionId={codeSidebar.selectedCollectionId}
        onClose={closeCodeSidebar}
      />
    </>
  );
};