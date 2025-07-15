export interface ContextMenuState {
  x: number;
  y: number;
  collectionId: string;
  collectionName: string;
}

export interface FieldContextMenuState {
  x: number;
  y: number;
  collectionId: string;
  fieldIndex: number;
  fieldName: string;
}

export interface AddFieldModalState {
  isOpen: boolean;
  collectionId: string;
  collectionName: string;
  position?: { x: number; y: number };
}

export interface ConfirmDeleteState {
  isOpen: boolean;
  collectionId: string;
  collectionName: string;
  position?: { x: number; y: number };
}

export interface CreateCollectionModalState {
  isOpen: boolean;
  position?: { x: number; y: number };
}

export interface EditFieldModalState {
  isOpen: boolean;
  collectionId: string;
  fieldIndex: number;
  field: any;
  position?: { x: number; y: number };
}

export interface ConfirmFieldDeleteState {
  isOpen: boolean;
  collectionId: string;
  fieldIndex: number;
  fieldName: string;
  position?: { x: number; y: number };
}

export interface EditCollectionModalState {
  isOpen: boolean;
  collection: any;
  position?: { x: number; y: number };
}

export interface CodeSidebarState {
  isOpen: boolean;
  selectedCollectionId: string | null;
}

export interface Position {
  x: number;
  y: number;
}

export interface Field {
  name: string;
  type: string;
  required: boolean;
}

export interface Collection {
  id: string;
  name: string;
  fields: Field[];
  position?: Position;
}

export interface CollectionOptions {
  includeTimestamps: boolean;
  includeCreatedAt: boolean;
  includeUpdatedAt: boolean;
}