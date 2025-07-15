import { useCallback } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { Field, Collection, CollectionOptions } from '../types';
import { useModalState } from './useModalState';
import toast from 'react-hot-toast';

export const useDesignerActions = () => {
  const {
    addCollection,
    updateCollection,
    removeCollection,
    duplicateCollection,
    addField,
    updateField,
    removeField,
    collections,
  } = useSchemaStore();

  const modalState = useModalState();

  // Collection actions
  const handleCreateCollection = useCallback((
    name: string,
    options: CollectionOptions
  ) => {
    addCollection(name, options);
    modalState.closeCreateCollectionModal();
    toast.success(`Collection "${name}" created successfully`);
  }, [addCollection, modalState]);

  const handleEditCollection = useCallback((
    collectionId: string,
    name: string
  ) => {
    updateCollection(collectionId, name);
    modalState.closeEditCollectionModal();
    toast.success(`Collection renamed to "${name}" successfully`);
  }, [updateCollection, modalState]);

  const handleDeleteCollection = useCallback(() => {
    const { collectionId, collectionName } = modalState.confirmDelete;
    removeCollection(collectionId);
    modalState.closeConfirmDelete();
    toast.success(`Collection "${collectionName}" deleted successfully`);
  }, [removeCollection, modalState]);

  const handleDuplicateCollection = useCallback((collectionId: string) => {
    duplicateCollection(collectionId);
    modalState.closeContextMenu();
    toast.success('Collection duplicated successfully');
  }, [duplicateCollection, modalState]);

  // Field actions
  const handleAddField = useCallback((
    field: Field
  ) => {
    const { collectionId } = modalState.addFieldModal;
    addField(collectionId, field);
    modalState.closeAddFieldModal();
    toast.success(`Field "${field.name}" added successfully`);
  }, [addField, modalState]);

  const handleEditField = useCallback((
    field: Field
  ) => {
    const { collectionId, fieldIndex } = modalState.editFieldModal;
    updateField(collectionId, fieldIndex, field);
    modalState.closeEditFieldModal();
    toast.success(`Field "${field.name}" updated successfully`);
  }, [updateField, modalState]);

  const handleDeleteField = useCallback(() => {
    const { collectionId, fieldIndex, fieldName } = modalState.confirmFieldDelete;
    removeField(collectionId, fieldIndex);
    modalState.closeConfirmFieldDelete();
    toast.success(`Field "${fieldName}" deleted successfully`);
  }, [removeField, modalState]);

  // Context menu handlers
  const handleContextMenu = useCallback((
    event: React.MouseEvent,
    collectionId: string,
    collectionName: string
  ) => {
    event.preventDefault();
    modalState.openContextMenu({
      x: event.clientX,
      y: event.clientY,
      collectionId,
      collectionName,
    });
  }, [modalState]);

  const handleFieldContextMenu = useCallback((
    event: React.MouseEvent,
    collectionId: string,
    fieldIndex: number,
    fieldName: string
  ) => {
    event.preventDefault();
    modalState.openFieldContextMenu({
      x: event.clientX,
      y: event.clientY,
      collectionId,
      fieldIndex,
      fieldName,
    });
  }, [modalState]);

  // Helper functions
  const getCollection = useCallback((collectionId: string) => {
    return collections.find(col => col.id === collectionId);
  }, [collections]);

  const getField = useCallback((collectionId: string, fieldIndex: number) => {
    const collection = getCollection(collectionId);
    return collection?.fields[fieldIndex];
  }, [getCollection]);

  // Modal opening handlers
  const handleOpenAddField = useCallback((
    collectionId: string,
    collectionName: string,
    position?: { x: number; y: number }
  ) => {
    modalState.openAddFieldModal(collectionId, collectionName, position);
  }, [modalState]);

  const handleOpenEditField = useCallback((
    collectionId: string,
    fieldIndex: number,
    position?: { x: number; y: number }
  ) => {
    const field = getField(collectionId, fieldIndex);
    if (field) {
      modalState.openEditFieldModal(collectionId, fieldIndex, field, position);
    }
  }, [modalState, getField]);

  const handleOpenDeleteField = useCallback((
    collectionId: string,
    fieldIndex: number,
    position?: { x: number; y: number }
  ) => {
    const field = getField(collectionId, fieldIndex);
    if (field) {
      modalState.openConfirmFieldDelete(collectionId, fieldIndex, field.name, position);
    }
  }, [modalState, getField]);

  const handleOpenEditCollection = useCallback((
    collectionId: string,
    position?: { x: number; y: number }
  ) => {
    const collection = getCollection(collectionId);
    if (collection) {
      modalState.openEditCollectionModal(collection, position);
    }
  }, [modalState, getCollection]);

  const handleOpenDeleteCollection = useCallback((
    collectionId: string,
    position?: { x: number; y: number }
  ) => {
    const collection = getCollection(collectionId);
    if (collection) {
      modalState.openConfirmDelete(collectionId, collection.name, position);
    }
  }, [modalState, getCollection]);

  return {
    ...modalState,
    
    // Collection actions
    handleCreateCollection,
    handleEditCollection,
    handleDeleteCollection,
    handleDuplicateCollection,
    
    // Field actions
    handleAddField,
    handleEditField,
    handleDeleteField,
    
    // Context menu handlers
    handleContextMenu,
    handleFieldContextMenu,
    
    // Modal opening handlers
    handleOpenAddField,
    handleOpenEditField,
    handleOpenDeleteField,
    handleOpenEditCollection,
    handleOpenDeleteCollection,
    
    // Helper functions
    getCollection,
    getField,
  };
};