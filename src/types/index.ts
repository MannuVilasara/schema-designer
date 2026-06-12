/**
 * Centralized type definitions for the Schema Designer
 *
 * This file contains all TypeScript types and interfaces used throughout
 * the application to ensure type safety and consistency.
 */

import React from "react"

// Database type
export type DbType = 'postgresql' | 'mongodb';

// Field type options per database
export const MONGODB_FIELD_TYPES = [
	'string',
	'number',
	'boolean',
	'date',
	'objectId',
	'array',
	'object',
	'buffer',
	'decimal128',
	'map',
] as const;

export const POSTGRESQL_FIELD_TYPES = [
	'serial',
	'integer',
	'bigint',
	'float',
	'varchar',
	'text',
	'boolean',
	'timestamp',
	'date',
	'uuid',
	'jsonb',
	'json',
	'bytea',
	'numeric',
] as const;

export function getFieldTypes(dbType: DbType): readonly string[] {
	return dbType === 'postgresql'
		? POSTGRESQL_FIELD_TYPES
		: MONGODB_FIELD_TYPES;
}

export function getIdFieldConfig(dbType: DbType): {
	name: string;
	type: string;
} {
	return dbType === 'postgresql'
		? { name: 'id', type: 'serial' }
		: { name: '_id', type: 'objectId' };
}

export function getEntityLabel(dbType: DbType): string {
	return dbType === 'postgresql' ? 'Table' : 'Collection';
}

// Core data types
export type Field = {
	name: string;
	type: string;
	required: boolean;
	options?: string[];
	defaultValue?: any;
	unique?: boolean;
	index?: boolean;
	ref?: string;
	arrayType?: string;
	connections?: string[];
};

export type Collection = {
	id: string;
	name: string;
	fields: Field[];
	position?: { x: number; y: number };
	createdAt?: Date;
	updatedAt?: Date;
	accentColor?: string;
};

// Connection/Reference types
export type FieldConnection = {
	id: string;
	sourceCollectionName: string;
	sourceFieldName: string;
	targetCollectionName: string;
	targetFieldName: string;
	type: 'reference';
	cardinality?: '1:1' | '1:n' | 'n:1' | 'n:m';
};

// Utility types
export type Position = { x: number; y: number };

export type Note = {
	id: string;
	text: string;
	position: Position;
	width?: number;
	height?: number;
	color?: string;
};

// Store types
export type SchemaState = {
	collections: Collection[];
	connections: FieldConnection[];
	notes: Note[];
	dbType: DbType;

	// DB type management
	setDbType: (dbType: DbType) => void;

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
	updateCollectionAccentColor: (id: string, color: string) => void;
	// Connection management
	addConnection: (connection: Omit<FieldConnection, 'id'>) => void;
	removeConnection: (connectionId: string) => void;
	getFieldConnections: (
		collectionName: string,
		fieldName: string
	) => FieldConnection[];
	updateConnectionCardinality: (id: string, cardinality: '1:1' | '1:n' | 'n:1' | 'n:m') => void;

	// Note management
	addNote: (position: Position) => void;
	updateNote: (id: string, text: string) => void;
	updateNotePosition: (id: string, position: Position) => void;
	removeNote: (id: string) => void;

	// Layout
	autoLayout: () => void;

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
		accentColor?: string;
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
	onAddNote?: (position?: Position) => void;
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
