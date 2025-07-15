import { useState, useCallback } from 'react';
import {
  ContextMenuState,
  FieldContextMenuState,
  AddFieldModalState,
  ConfirmDeleteState,
  CreateCollectionModalState,
  EditFieldModalState,
  ConfirmFieldDeleteState,
  EditCollectionModalState,
  CodeSidebarState,
  Position,
  Field,
  Collection,
} from '../types';

export const useModalState = () => {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [fieldContextMenu, setFieldContextMenu] = useState<FieldContextMenuState | null>(null);

  // Modal states
  const [addFieldModal, setAddFieldModal] = useState<AddFieldModalState>({
    isOpen: false,
    collectionId: '',
    collectionName: '',
  });

  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    isOpen: false,
    collectionId: '',
    collectionName: '',
  });

  const [createCollectionModal, setCreateCollectionModal] = useState<CreateCollectionModalState>({
    isOpen: false,
  });

  const [editFieldModal, setEditFieldModal] = useState<EditFieldModalState>({
    isOpen: false,
    collectionId: '',
    fieldIndex: -1,
    field: null,
  });

  const [confirmFieldDelete, setConfirmFieldDelete] = useState<ConfirmFieldDeleteState>({
    isOpen: false,
    collectionId: '',
    fieldIndex: -1,
    fieldName: '',
  });

  const [editCollectionModal, setEditCollectionModal] = useState<EditCollectionModalState>({
    isOpen: false,
    collection: null,
  });

  const [codeSidebar, setCodeSidebar] = useState<CodeSidebarState>({
    isOpen: false,
    selectedCollectionId: null,
  });

  // Context menu actions
  const openContextMenu = useCallback((state: ContextMenuState) => {
    setContextMenu(state);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const openFieldContextMenu = useCallback((state: FieldContextMenuState) => {
    setFieldContextMenu(state);
  }, []);

  const closeFieldContextMenu = useCallback(() => {
    setFieldContextMenu(null);
  }, []);

  // Add field modal actions
  const openAddFieldModal = useCallback((
    collectionId: string,
    collectionName: string,
    position?: Position
  ) => {
    setAddFieldModal({
      isOpen: true,
      collectionId,
      collectionName,
      position,
    });
  }, []);

  const closeAddFieldModal = useCallback(() => {
    setAddFieldModal({
      isOpen: false,
      collectionId: '',
      collectionName: '',
    });
  }, []);

  // Confirm delete actions
  const openConfirmDelete = useCallback((
    collectionId: string,
    collectionName: string,
    position?: Position
  ) => {
    setConfirmDelete({
      isOpen: true,
      collectionId,
      collectionName,
      position,
    });
  }, []);

  const closeConfirmDelete = useCallback(() => {
    setConfirmDelete({
      isOpen: false,
      collectionId: '',
      collectionName: '',
    });
  }, []);

  // Create collection modal actions
  const openCreateCollectionModal = useCallback((position?: Position) => {
    setCreateCollectionModal({ isOpen: true, position });
  }, []);

  const closeCreateCollectionModal = useCallback(() => {
    setCreateCollectionModal({ isOpen: false });
  }, []);

  // Edit field modal actions
  const openEditFieldModal = useCallback((
    collectionId: string,
    fieldIndex: number,
    field: Field,
    position?: Position
  ) => {
    setEditFieldModal({
      isOpen: true,
      collectionId,
      fieldIndex,
      field,
      position,
    });
  }, []);

  const closeEditFieldModal = useCallback(() => {
    setEditFieldModal({
      isOpen: false,
      collectionId: '',
      fieldIndex: -1,
      field: null,
    });
  }, []);

  // Confirm field delete actions
  const openConfirmFieldDelete = useCallback((
    collectionId: string,
    fieldIndex: number,
    fieldName: string,
    position?: Position
  ) => {
    setConfirmFieldDelete({
      isOpen: true,
      collectionId,
      fieldIndex,
      fieldName,
      position,
    });
  }, []);

  const closeConfirmFieldDelete = useCallback(() => {
    setConfirmFieldDelete({
      isOpen: false,
      collectionId: '',
      fieldIndex: -1,
      fieldName: '',
    });
  }, []);

  // Edit collection modal actions
  const openEditCollectionModal = useCallback((
    collection: Collection,
    position?: Position
  ) => {
    setEditCollectionModal({
      isOpen: true,
      collection,
      position,
    });
  }, []);

  const closeEditCollectionModal = useCallback(() => {
    setEditCollectionModal({
      isOpen: false,
      collection: null,
    });
  }, []);

  // Code sidebar actions
  const openCodeSidebar = useCallback((selectedCollectionId: string) => {
    setCodeSidebar({
      isOpen: true,
      selectedCollectionId,
    });
  }, []);

  const closeCodeSidebar = useCallback(() => {
    setCodeSidebar({
      isOpen: false,
      selectedCollectionId: null,
    });
  }, []);

  return {
    // States
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
    openContextMenu,
    closeContextMenu,
    openFieldContextMenu,
    closeFieldContextMenu,
    openAddFieldModal,
    closeAddFieldModal,
    openConfirmDelete,
    closeConfirmDelete,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openEditFieldModal,
    closeEditFieldModal,
    openConfirmFieldDelete,
    closeConfirmFieldDelete,
    openEditCollectionModal,
    closeEditCollectionModal,
    openCodeSidebar,
    closeCodeSidebar,
  };
};