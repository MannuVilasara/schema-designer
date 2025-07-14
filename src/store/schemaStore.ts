import { create } from 'zustand';
import type { Field, Collection, SchemaState, FieldConnection } from '@/types';
import { persist, devtools } from 'zustand/middleware';

export const useSchemaStore = create<SchemaState>()(
    persist(
        (set, get) => ({
            collections: [],
            connections: [],
            addCollection: (name, options) => {
                set((state) => {
                    const baseFields: Field[] = [];
                    const now = new Date();

                    // Always add _id field as the first field
                    baseFields.push({
                        name: '_id',
                        type: 'objectId',
                        required: true,
                    });

                    // Add timestamp fields if requested
                    if (options?.includeTimestamps) {
                        if (options.includeCreatedAt) {
                            baseFields.push({
                                name: 'createdAt',
                                type: 'date',
                                required: true,
                            });
                        }
                        if (options.includeUpdatedAt) {
                            baseFields.push({
                                name: 'updatedAt',
                                type: 'date',
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
                                fields: baseFields,
                                position: { x: 100 + state.collections.length * 220, y: 100 },
                                createdAt: now,
                                updatedAt: now,
                            },
                        ],
                    };
                });
            },
            removeCollection: (id) =>
                set((state) => ({
                    collections: state.collections.filter((col) => col.id !== id),
                })),
            duplicateCollection: (id) =>
                set((state) => {
                    const collectionToDuplicate = state.collections.find((col) => col.id === id);
                    if (!collectionToDuplicate) return state;

                    const newCollection = {
                        ...collectionToDuplicate,
                        id: crypto.randomUUID(),
                        name: `${collectionToDuplicate.name} Copy`,
                        position: {
                            x: collectionToDuplicate.position?.x ? collectionToDuplicate.position.x + 50 : 150,
                            y: collectionToDuplicate.position?.y ? collectionToDuplicate.position.y + 50 : 150
                        }
                    };

                    return {
                        collections: [...state.collections, newCollection]
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
                            ? { ...col, fields: [...col.fields, field] }
                            : col
                    ),
                })),
            removeField: (collectionId, fieldIndex) =>
                set((state) => ({
                    collections: state.collections.map((col) =>
                        col.id === collectionId
                            ? {
                                ...col,
                                fields: col.fields.filter((_, index) => index !== fieldIndex)
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
                                fields: col.fields.map((f, index) =>
                                    index === fieldIndex ? field : f
                                )
                            }
                            : col
                    ),
                })),
            updateCollectionPosition: (id, position) =>
                set((state) => ({
                    collections: state.collections.map((col) =>
                        col.id === id ? { ...col, position } : col
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
                            // Update source field connections
                            if (col.id === connectionData.sourceCollectionId) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field, index) =>
                                        index === connectionData.sourceFieldIndex
                                            ? {
                                                ...field,
                                                connections: [...(field.connections || []), newConnection.id]
                                            }
                                            : field
                                    )
                                };
                            }
                            // Update target field connections
                            if (col.id === connectionData.targetCollectionId) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field, index) =>
                                        index === connectionData.targetFieldIndex
                                            ? {
                                                ...field,
                                                connections: [...(field.connections || []), newConnection.id]
                                            }
                                            : field
                                    )
                                };
                            }
                            return col;
                        })
                    };
                }),

            removeConnection: (connectionId) =>
                set((state) => {
                    const connectionToRemove = state.connections.find(conn => conn.id === connectionId);
                    if (!connectionToRemove) return state;

                    return {
                        ...state,
                        connections: state.connections.filter(conn => conn.id !== connectionId),
                        collections: state.collections.map((col) => {
                            // Remove connection from source field
                            if (col.id === connectionToRemove.sourceCollectionId) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field, index) =>
                                        index === connectionToRemove.sourceFieldIndex
                                            ? {
                                                ...field,
                                                connections: (field.connections || []).filter(id => id !== connectionId)
                                            }
                                            : field
                                    )
                                };
                            }
                            // Remove connection from target field
                            if (col.id === connectionToRemove.targetCollectionId) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field, index) =>
                                        index === connectionToRemove.targetFieldIndex
                                            ? {
                                                ...field,
                                                connections: (field.connections || []).filter(id => id !== connectionId)
                                            }
                                            : field
                                    )
                                };
                            }
                            return col;
                        })
                    };
                }),

            getFieldConnections: (collectionId, fieldIndex) => {
                const state = get();
                return state.connections.filter(conn =>
                    (conn.sourceCollectionId === collectionId && conn.sourceFieldIndex === fieldIndex) ||
                    (conn.targetCollectionId === collectionId && conn.targetFieldIndex === fieldIndex)
                );
            },

            // Export schema as JSON
            exportSchema: () => {
                const state = get();
                const schemaData = {
                    collections: state.collections,
                    connections: state.connections,
                    exportedAt: new Date().toISOString(),
                    version: '1.0'
                };
                return JSON.stringify(schemaData, null, 2);
            },

            // Import schema from JSON
            importSchema: (schemaData) => {
                try {
                    const parsed = JSON.parse(schemaData);
                    if (parsed.collections && Array.isArray(parsed.collections)) {
                        set({
                            collections: parsed.collections,
                            connections: parsed.connections || []
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
                    connections: []
                });
            },

        }),
        {
            name: 'mongodb-schema-designer',
            version: 1,
        }
    )
);
