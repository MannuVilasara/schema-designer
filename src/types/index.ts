/**
 * Centralized type definitions for the MongoDB Schema Designer
 *
 * This file contains all TypeScript types and interfaces used throughout
 * the application to ensure type safety and consistency.
 */

// Core data types
export type Field = {
	name: string;
	type: string; // string, number, boolean, date, etc.
	required: boolean;
	options?: string[]; // for select fields, etc.
	defaultValue?: any; // default value for the field
	unique?: boolean; // field uniqueness constraint
	index?: boolean; // field indexing
	ref?: string; // reference to another collection (for objectId)
	arrayType?: string; // type of array elements (for array fields)
	// Connection tracking for objectId fields
	connections?: string[]; // Array of edge IDs that connect to this field
};

export type Collection = {
	id: string;
	name: string;
	fields: Field[];
	position?: { x: number; y: number }; // Add position tracking
	// You can add more properties if needed, like timestamps, etc.
	createdAt?: Date;
	updatedAt?: Date;
};

// Connection/Reference types
export type FieldConnection = {
	id: string; // Unique edge ID
	sourceCollectionName: string;
	sourceFieldName: string;
	targetCollectionName: string;
	targetFieldName: string;
	type: 'reference'; // Type of connection (reference, embed, etc.)
};

// Utility types
export type Position = { x: number; y: number };

// Store types
export type SchemaState = {
	collections: Collection[];
	connections: FieldConnection[]; // Store all field connections
	leftSidebarDocked: boolean; // UI state for left sidebar

	// UI state management
	setLeftSidebarDocked: (docked: boolean) => void;

	// Collection management
	addCollection: (
		name: string,
		options?: {
			includeTimestamps: boolean;
			includeCreatedAt: boolean;
			includeUpdatedAt: boolean;
		}
	) => void;
	removeCollection: (id: string) => void;
	duplicateCollection: (id: string) => void;
	updateCollection: (id: string, name: string) => void;
	addField: (collectionId: string, field: Field) => void;
	removeField: (collectionId: string, fieldIndex: number) => void;
	updateField: (
		collectionId: string,
		fieldIndex: number,
		field: Field
	) => void;
	reorderFields: (
		collectionId: string,
		sourceIndex: number,
		destinationIndex: number
	) => void;
	updateCollectionPosition: (
		id: string,
		position: { x: number; y: number }
	) => void;
	// Connection management
	addConnection: (connection: Omit<FieldConnection, 'id'>) => void;
	removeConnection: (connectionId: string) => void;
	getFieldConnections: (
		collectionName: string,
		fieldName: string
	) => FieldConnection[];
	// Import/Export and storage
	exportSchema: () => string;
	importSchema: (schemaData: string) => void;
	clearCanvas: () => void;
};

// Component prop types
export type CollectionNodeProps = {
	data: {
		name: string;
		id: string;
		fields: Field[];
		onContextMenu: (
			event: React.MouseEvent,
			collectionId: string,
			collectionName: string
		) => void;
		onFieldContextMenu: (
			event: React.MouseEvent,
			collectionId: string,
			fieldIndex: number,
			fieldName: string
		) => void;
		onCloseMenus?: () => void;
	};
};

// Modal prop types
export type AddFieldModalProps = {
	isOpen: boolean;
	collectionName: string;
	position?: Position;
	onClose: () => void;
	onAddField: (field: {
		name: string;
		type: string;
		required: boolean;
	}) => void;
};

export type EditFieldModalProps = {
	isOpen: boolean;
	field: Field;
	position?: Position;
	onSave: (fieldData: Field) => void;
	onClose: () => void;
};

export type EditCollectionModalProps = {
	isOpen: boolean;
	collection: Collection;
	position?: Position;
	onSave: (collectionId: string, name: string) => void;
	onClose: () => void;
};

export type CreateCollectionModalProps = {
	isOpen: boolean;
	position?: Position;
	onClose: () => void;
	onCreateCollection: (
		name: string,
		options: {
			includeTimestamps: boolean;
			includeCreatedAt: boolean;
			includeUpdatedAt: boolean;
		}
	) => void;
};

export type ConfirmDialogProps = {
	isOpen: boolean;
	title: string;
	message: string;
	position?: Position;
	onConfirm: () => void;
	onCancel: () => void;
};

export type ConfirmFieldDeleteDialogProps = {
	isOpen: boolean;
	fieldName: string;
	position?: Position;
	onConfirm: () => void;
	onCancel: () => void;
};

// Context menu prop types
export type ContextMenuProps = {
	x: number;
	y: number;
	collectionId: string;
	collectionName: string;
	onClose: () => void;
	onDelete: (id: string, position?: Position) => void;
	onDuplicate: (id: string) => void;
	onAddField: (id: string, position?: Position) => void;
	onEditCollection?: (id: string, position?: Position) => void;
	onCreateCollection?: (position?: Position) => void;
	onGenerateCode?: (id: string) => void;
};

export type FieldContextMenuProps = {
	x: number;
	y: number;
	collectionId: string;
	fieldIndex: number;
	fieldName: string;
	onClose: () => void;
	onEditField: (
		collectionId: string,
		fieldIndex: number,
		position: Position
	) => void;
	onDeleteField: (
		collectionId: string,
		fieldIndex: number,
		position: Position
	) => void;
	onAddField: (collectionId: string, position?: Position) => void;
};
