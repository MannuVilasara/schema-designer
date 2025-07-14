import type { Field, FieldConnection, SchemaState } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to ensure timestamp fields are always at the end
const organizeFields = (fields: Field[]): Field[] => {
    const nonTimestampFields = fields.filter(field =>
        field.name !== 'createdAt' && field.name !== 'updatedAt'
    );
    const timestampFields = fields.filter(field =>
        field.name === 'createdAt' || field.name === 'updatedAt'
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
    persist(
        (set, get) => ({
            collections: [],
            connections: [],
            leftSidebarDocked: true,

            // UI state management
            setLeftSidebarDocked: (docked) => set({ leftSidebarDocked: docked }),
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
                                fields: organizeFields(baseFields),
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

                    // Generate a unique name by checking existing names
                    let baseName = collectionToDuplicate.name;
                    let newName = `${baseName}_copy`;
                    let counter = 1;

                    // Check if the name already exists and increment counter if needed
                    while (state.collections.some(col => col.name === newName)) {
                        counter++;
                        newName = `${baseName}_copy${counter}`;
                    }

                    const newCollection = {
                        ...collectionToDuplicate,
                        id: crypto.randomUUID(),
                        name: newName,
                        fields: organizeFields(collectionToDuplicate.fields),
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
                            ? { ...col, fields: organizeFields([...col.fields, field]) }
                            : col
                    ),
                })),
            removeField: (collectionId, fieldIndex) =>
                set((state) => ({
                    collections: state.collections.map((col) =>
                        col.id === collectionId
                            ? {
                                ...col,
                                fields: organizeFields(col.fields.filter((_, index) => index !== fieldIndex))
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
                                fields: organizeFields(col.fields.map((f, index) =>
                                    index === fieldIndex ? field : f
                                ))
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

                        // Prevent moving timestamp fields or moving fields to timestamp positions
                        if (sourceField.name === 'createdAt' || sourceField.name === 'updatedAt' ||
                            destField?.name === 'createdAt' || destField?.name === 'updatedAt') {
                            return col; // Don't allow reordering timestamp fields
                        }

                        // Only allow reordering within non-timestamp fields
                        const nonTimestampFields = fields.filter(field =>
                            field.name !== 'createdAt' && field.name !== 'updatedAt'
                        );
                        const timestampFields = fields.filter(field =>
                            field.name === 'createdAt' || field.name === 'updatedAt'
                        );

                        // Find the real indices within non-timestamp fields
                        const sourceNonTimestampIndex = nonTimestampFields.findIndex(f => f === sourceField);
                        const destNonTimestampIndex = nonTimestampFields.findIndex(f => f === destField);

                        if (sourceNonTimestampIndex === -1 || destNonTimestampIndex === -1) {
                            return col; // Invalid indices
                        }

                        // Reorder within non-timestamp fields
                        const reorderedNonTimestampFields = [...nonTimestampFields];
                        const [removed] = reorderedNonTimestampFields.splice(sourceNonTimestampIndex, 1);
                        reorderedNonTimestampFields.splice(destNonTimestampIndex, 0, removed);

                        // Sort timestamp fields to maintain order
                        timestampFields.sort((a, b) => {
                            if (a.name === 'createdAt') return -1;
                            if (b.name === 'createdAt') return 1;
                            return 0;
                        });

                        return {
                            ...col,
                            fields: [...reorderedNonTimestampFields, ...timestampFields]
                        };
                    })
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
                            if (col.name === connectionData.sourceCollectionName) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field) =>
                                        field.name === connectionData.sourceFieldName
                                            ? {
                                                ...field,
                                                connections: [...(field.connections || []), newConnection.id]
                                            }
                                            : field
                                    )
                                };
                            }
                            // Update target field connections
                            if (col.name === connectionData.targetCollectionName) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field) =>
                                        field.name === connectionData.targetFieldName
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
                            if (col.name === connectionToRemove.sourceCollectionName) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field) =>
                                        field.name === connectionToRemove.sourceFieldName
                                            ? {
                                                ...field,
                                                connections: (field.connections || []).filter(id => id !== connectionId)
                                            }
                                            : field
                                    )
                                };
                            }
                            // Remove connection from target field
                            if (col.name === connectionToRemove.targetCollectionName) {
                                return {
                                    ...col,
                                    fields: col.fields.map((field) =>
                                        field.name === connectionToRemove.targetFieldName
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

            getFieldConnections: (collectionName, fieldName) => {
                const state = get();
                return state.connections.filter(conn =>
                    (conn.sourceCollectionName === collectionName && conn.sourceFieldName === fieldName) ||
                    (conn.targetCollectionName === collectionName && conn.targetFieldName === fieldName)
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
