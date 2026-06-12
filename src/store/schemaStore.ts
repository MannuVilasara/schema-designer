import type { DbType, Field, FieldConnection, SchemaState } from '@/types';
import { getIdFieldConfig } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import dagre from 'dagre';

// Helper function to ensure timestamp fields are always at the end
const organizeFields = (fields: Field[]): Field[] => {
	const nonTimestampFields = fields.filter(
		(field) => field.name !== 'createdAt' && field.name !== 'updatedAt'
	);
	const timestampFields = fields.filter(
		(field) => field.name === 'createdAt' || field.name === 'updatedAt'
	);

	// Sort timestamp fields to ensure consistent order: createdAt first, then updatedAt
	timestampFields.sort((a, b) => {
		if (a.name === 'createdAt') return -1;
		if (b.name === 'createdAt') return 1;
		return 0;
	});

	return [...nonTimestampFields, ...timestampFields];
};

export const useSchemaStore = create<SchemaState>()(
	temporal(
		persist(
			(set, get) => ({
				collections: [],
				connections: [],
				notes: [],
				dbType: 'mongodb' as DbType,

			setDbType: (dbType: DbType) => set({ dbType }),

			addCollection: (name, options) => {
				set((state) => {
					const baseFields: Field[] = [];
					const now = new Date();
					const idConfig = getIdFieldConfig(state.dbType);

					// Always add ID field as the first field
					baseFields.push({
						name: idConfig.name,
						type: idConfig.type,
						required: true,
					});

					// Add timestamp fields if requested
					if (options?.includeTimestamps) {
						const tsType =
							state.dbType === 'postgresql'
								? 'timestamp'
								: 'date';
						if (options.includeCreatedAt) {
							baseFields.push({
								name: 'createdAt',
								type: tsType,
								required: true,
							});
						}
						if (options.includeUpdatedAt) {
							baseFields.push({
								name: 'updatedAt',
								type: tsType,
								required: true,
							});
						}
					}

					return {
						collections: [
							...state.collections,
							{
								id: crypto.randomUUID(),
								name,
								fields: organizeFields(baseFields),
								position: {
									x: 100 + state.collections.length * 220,
									y: 100,
								},
								createdAt: now,
								updatedAt: now,
							},
						],
					};
				});
			},
			removeCollection: (id) =>
				set((state) => ({
					collections: state.collections.filter(
						(col) => col.id !== id
					),
				})),
			duplicateCollection: (id) =>
				set((state) => {
					const collectionToDuplicate = state.collections.find(
						(col) => col.id === id
					);
					if (!collectionToDuplicate) return state;

					let baseName = collectionToDuplicate.name;
					let newName = `${baseName}_copy`;
					let counter = 1;

					while (
						state.collections.some((col) => col.name === newName)
					) {
						counter++;
						newName = `${baseName}_copy${counter}`;
					}

					const newCollection = {
						...collectionToDuplicate,
						id: crypto.randomUUID(),
						name: newName,
						fields: organizeFields(collectionToDuplicate.fields),
						position: {
							x: collectionToDuplicate.position?.x
								? collectionToDuplicate.position.x + 50
								: 150,
							y: collectionToDuplicate.position?.y
								? collectionToDuplicate.position.y + 50
								: 150,
						},
					};

					return {
						collections: [...state.collections, newCollection],
					};
				}),
			updateCollection: (id, name) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === id
							? { ...col, name, updatedAt: new Date() }
							: col
					),
				})),
			addField: (collectionId, field) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === collectionId
							? {
									...col,
									fields: organizeFields([
										...col.fields,
										field,
									]),
								}
							: col
					),
				})),
			removeField: (collectionId, fieldIndex) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === collectionId
							? {
									...col,
									fields: organizeFields(
										col.fields.filter(
											(_, index) => index !== fieldIndex
										)
									),
								}
							: col
					),
				})),
			updateField: (collectionId, fieldIndex, field) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === collectionId
							? {
									...col,
									fields: organizeFields(
										col.fields.map((f, index) =>
											index === fieldIndex ? field : f
										)
									),
								}
							: col
					),
				})),
			reorderFields: (collectionId, sourceIndex, destinationIndex) =>
				set((state) => ({
					collections: state.collections.map((col) => {
						if (col.id !== collectionId) return col;

						const fields = [...col.fields];
						const sourceField = fields[sourceIndex];
						const destField = fields[destinationIndex];

						if (
							sourceField.name === 'createdAt' ||
							sourceField.name === 'updatedAt' ||
							destField?.name === 'createdAt' ||
							destField?.name === 'updatedAt'
						) {
							return col;
						}

						const nonTimestampFields = fields.filter(
							(field) =>
								field.name !== 'createdAt' &&
								field.name !== 'updatedAt'
						);
						const timestampFields = fields.filter(
							(field) =>
								field.name === 'createdAt' ||
								field.name === 'updatedAt'
						);

						const sourceNonTimestampIndex =
							nonTimestampFields.findIndex(
								(f) => f === sourceField
							);
						const destNonTimestampIndex =
							nonTimestampFields.findIndex(
								(f) => f === destField
							);

						if (
							sourceNonTimestampIndex === -1 ||
							destNonTimestampIndex === -1
						) {
							return col;
						}

						const reorderedNonTimestampFields = [
							...nonTimestampFields,
						];
						const [removed] = reorderedNonTimestampFields.splice(
							sourceNonTimestampIndex,
							1
						);
						reorderedNonTimestampFields.splice(
							destNonTimestampIndex,
							0,
							removed
						);

						timestampFields.sort((a, b) => {
							if (a.name === 'createdAt') return -1;
							if (b.name === 'createdAt') return 1;
							return 0;
						});

						return {
							...col,
							fields: [
								...reorderedNonTimestampFields,
								...timestampFields,
							],
						};
					}),
				})),
			updateCollectionPosition: (id, position) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === id ? { ...col, position } : col
					),
				})),
			updateCollectionAccentColor: (id, color) =>
				set((state) => ({
					collections: state.collections.map((col) =>
						col.id === id ? { ...col, accentColor: color } : col
					),
				})),

			// Connection management
			addConnection: (connectionData) =>
				set((state) => {
					const newConnection: FieldConnection = {
						...connectionData,
						id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					};

					return {
						...state,
						connections: [...state.connections, newConnection],
						collections: state.collections.map((col) => {
							if (
								col.name === connectionData.sourceCollectionName
							) {
								return {
									...col,
									fields: col.fields.map((field) =>
										field.name ===
										connectionData.sourceFieldName
											? {
													...field,
													connections: [
														...(field.connections ||
															[]),
														newConnection.id,
													],
												}
											: field
									),
								};
							}
							if (
								col.name === connectionData.targetCollectionName
							) {
								return {
									...col,
									fields: col.fields.map((field) =>
										field.name ===
										connectionData.targetFieldName
											? {
													...field,
													connections: [
														...(field.connections ||
															[]),
														newConnection.id,
													],
												}
											: field
									),
								};
							}
							return col;
						}),
					};
				}),

			removeConnection: (connectionId) =>
				set((state) => {
					const connectionToRemove = state.connections.find(
						(conn) => conn.id === connectionId
					);
					if (!connectionToRemove) return state;

					return {
						...state,
						connections: state.connections.filter(
							(conn) => conn.id !== connectionId
						),
						collections: state.collections.map((col) => {
							if (
								col.name ===
								connectionToRemove.sourceCollectionName
							) {
								return {
									...col,
									fields: col.fields.map((field) =>
										field.name ===
										connectionToRemove.sourceFieldName
											? {
													...field,
													connections: (
														field.connections || []
													).filter(
														(id) =>
															id !== connectionId
													),
												}
											: field
									),
								};
							}
							if (
								col.name ===
								connectionToRemove.targetCollectionName
							) {
								return {
									...col,
									fields: col.fields.map((field) =>
										field.name ===
										connectionToRemove.targetFieldName
											? {
													...field,
													connections: (
														field.connections || []
													).filter(
														(id) =>
															id !== connectionId
													),
												}
											: field
									),
								};
							}
							return col;
						}),
					};
				}),

			updateConnectionCardinality: (id, cardinality) =>
				set((state) => ({
					connections: state.connections.map((conn) =>
						conn.id === id ? { ...conn, cardinality } : conn
					),
				})),

			getFieldConnections: (collectionName, fieldName) => {
				const state = get();
				return state.connections.filter(
					(conn) =>
						(conn.sourceCollectionName === collectionName &&
							conn.sourceFieldName === fieldName) ||
						(conn.targetCollectionName === collectionName &&
							conn.targetFieldName === fieldName)
				);
			},

			// Export schema as JSON
			exportSchema: () => {
				const state = get();
				const schemaData = {
					collections: state.collections,
					connections: state.connections,
					notes: state.notes,
					dbType: state.dbType,
					exportedAt: new Date().toISOString(),
					version: '2.0',
				};
				return JSON.stringify(schemaData, null, 2);
			},

			// Import schema from JSON
			importSchema: (schemaData) => {
				try {
					const parsed = JSON.parse(schemaData);
					if (
						parsed.collections &&
						Array.isArray(parsed.collections)
					) {
						set({
							collections: parsed.collections,
							connections: parsed.connections || [],
							notes: parsed.notes || [],
							dbType: parsed.dbType || 'mongodb',
						});
					} else {
						throw new Error('Invalid schema format');
					}
				} catch (error) {
					console.error('Failed to import schema:', error);
					throw error;
				}
			},

			// Clear all collections and connections
			clearCanvas: () => {
				set({
					collections: [],
					connections: [],
					notes: [],
				});
			},

			// Notes management
			addNote: (position) =>
				set((state) => ({
					notes: [
						...state.notes,
						{
							id: crypto.randomUUID(),
							text: 'New Note',
							position,
						},
					],
				})),
			updateNote: (id, text) =>
				set((state) => ({
					notes: state.notes.map((n) =>
						n.id === id ? { ...n, text } : n
					),
				})),
			updateNotePosition: (id, position) =>
				set((state) => ({
					notes: state.notes.map((n) =>
						n.id === id ? { ...n, position } : n
					),
				})),
			removeNote: (id) =>
				set((state) => ({
					notes: state.notes.filter((n) => n.id !== id),
				})),

			// Auto Layout
			autoLayout: () =>
				set((state) => {
					const g = new dagre.graphlib.Graph();
					g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 200 });
					g.setDefaultEdgeLabel(() => ({}));

					state.collections.forEach((col) => {
						// Approximate height based on fields
						const height = 50 + col.fields.length * 40;
						g.setNode(col.id, { width: 320, height });
					});

					state.connections.forEach((conn) => {
						const sourceCol = state.collections.find(
							(c) => c.name === conn.sourceCollectionName
						);
						const targetCol = state.collections.find(
							(c) => c.name === conn.targetCollectionName
						);
						if (sourceCol && targetCol) {
							g.setEdge(sourceCol.id, targetCol.id);
						}
					});

					dagre.layout(g);

					const updatedCollections = state.collections.map((col) => {
						const nodeWithPosition = g.node(col.id);
						if (!nodeWithPosition) return col;
						const height = 50 + col.fields.length * 40;
						return {
							...col,
							position: {
								x: nodeWithPosition.x - 160, // center offset
								y: nodeWithPosition.y - height / 2,
							},
						};
					});

					return { collections: updatedCollections };
				}),
		}),
		{
			name: 'schema-designer-v2',
			version: 2,
		}
	),
	{
		partialize: (state) => ({
			collections: state.collections,
			connections: state.connections,
			notes: state.notes,
			dbType: state.dbType,
		}),
	}
)
);
