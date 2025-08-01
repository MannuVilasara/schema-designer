import ReactFlow, {
	Background,
	Connection,
	Controls,
	Edge,
	MarkerType,
	Node,
	NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useMemo, useState } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import CustomEdge from '@/components/CustomEdge';
import toast from 'react-hot-toast';
import {
	AddFieldModal,
	// BottomDock,
	CollectionNode,
	ConfirmDialog,
	ConfirmFieldDeleteDialog,
	ContextMenu,
	CreateCollectionModal,
	EditCollectionModal,
	EditFieldModal,
	FieldContextMenu,
	CodeGenerationModal,
} from '@/components';

function Canvas() {
	const collections = useSchemaStore((state) => state.collections);
	const connections = useSchemaStore((state) => state.connections);
	const updateCollectionPosition = useSchemaStore(
		(state) => state.updateCollectionPosition
	);
	const addConnection = useSchemaStore((state) => state.addConnection);
	const removeConnection = useSchemaStore((state) => state.removeConnection);
	const getFieldConnections = useSchemaStore(
		(state) => state.getFieldConnections
	);
	const duplicateCollection = useSchemaStore(
		(state) => state.duplicateCollection
	);
	const removeCollection = useSchemaStore((state) => state.removeCollection);
	const addField = useSchemaStore((state) => state.addField);
	const updateCollection = useSchemaStore((state) => state.updateCollection);
	const removeField = useSchemaStore((state) => state.removeField);
	const updateField = useSchemaStore((state) => state.updateField);
	const addCollection = useSchemaStore((state) => state.addCollection);

	const { isDark } = useThemeContext();

	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		collectionId: string;
		collectionName: string;
	} | null>(null);

	const [fieldContextMenu, setFieldContextMenu] = useState<{
		x: number;
		y: number;
		collectionId: string;
		fieldIndex: number;
		fieldName: string;
	} | null>(null);

	const [addFieldModal, setAddFieldModal] = useState<{
		isOpen: boolean;
		collectionId: string;
		collectionName: string;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collectionId: '',
		collectionName: '',
	});
	const [confirmDelete, setConfirmDelete] = useState<{
		isOpen: boolean;
		collectionId: string;
		collectionName: string;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collectionId: '',
		collectionName: '',
	});
	const [editCollectionModal, setEditCollectionModal] = useState<{
		isOpen: boolean;
		collection: any;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collection: null,
	});
	const [createCollectionModal, setCreateCollectionModal] = useState<{
		isOpen: boolean;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
	});
	// Edit field modal state
	const [editFieldModal, setEditFieldModal] = useState<{
		isOpen: boolean;
		collectionId: string;
		fieldIndex: number;
		field: any;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collectionId: '',
		fieldIndex: -1,
		field: null,
	});
	// Code sidebar state
	const [codeSidebar, setCodeSidebar] = useState<{
		isOpen: boolean;
		selectedCollectionId: string | null;
	}>({
		isOpen: false,
		selectedCollectionId: null,
	});
	const [confirmFieldDelete, setConfirmFieldDelete] = useState<{
		isOpen: boolean;
		collectionId: string;
		fieldIndex: number;
		fieldName: string;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collectionId: '',
		fieldIndex: -1,
		fieldName: '',
	});

	const closeContextMenu = useCallback(() => {
		setContextMenu(null);
	}, []);
	const handleEditFieldSubmit = useCallback(
		(field: { name: string; type: string; required: boolean }) => {
			updateField(
				editFieldModal.collectionId,
				editFieldModal.fieldIndex,
				field
			);
			setEditFieldModal({
				isOpen: false,
				collectionId: '',
				fieldIndex: -1,
				field: null,
			});
			toast.success(`Field "${field.name}" updated successfully`);
		},
		[updateField, editFieldModal.collectionId, editFieldModal.fieldIndex]
	);

	const handleCloseEditField = useCallback(() => {
		setEditFieldModal({
			isOpen: false,
			collectionId: '',
			fieldIndex: -1,
			field: null,
		});
	}, []);
	const handleCreateCollectionSubmit = useCallback(
		(
			name: string,
			options: {
				includeTimestamps: boolean;
				includeCreatedAt: boolean;
				includeUpdatedAt: boolean;
			}
		) => {
			addCollection(name, options);
			setCreateCollectionModal({ isOpen: false });
			toast.success(`Collection "${name}" created successfully`);
		},
		[addCollection]
	);

	const handleCloseCreateModal = useCallback(() => {
		setCreateCollectionModal({ isOpen: false });
	}, []);

	const handleCloseEditCollection = useCallback(() => {
		setEditCollectionModal({
			isOpen: false,
			collection: null,
		});
	}, []);

	const confirmFieldDeleteAction = useCallback(() => {
		removeField(
			confirmFieldDelete.collectionId,
			confirmFieldDelete.fieldIndex
		);
		setConfirmFieldDelete({
			isOpen: false,
			collectionId: '',
			fieldIndex: -1,
			fieldName: '',
		});
		toast.success(
			`Field "${confirmFieldDelete.fieldName}" deleted successfully`
		);
	}, [
		removeField,
		confirmFieldDelete.collectionId,
		confirmFieldDelete.fieldIndex,
		confirmFieldDelete.fieldName,
	]);
	const handleCloseCodeSidebar = useCallback(() => {
		setCodeSidebar({
			isOpen: false,
			selectedCollectionId: null,
		});
	}, []);

	const cancelFieldDelete = useCallback(() => {
		setConfirmFieldDelete({
			isOpen: false,
			collectionId: '',
			fieldIndex: -1,
			fieldName: '',
		});
	}, []);

	const handleEditCollectionSubmit = useCallback(
		(collectionId: string, name: string) => {
			updateCollection(collectionId, name);
			setEditCollectionModal({
				isOpen: false,
				collection: null,
			});
			toast.success(`Collection renamed to "${name}" successfully`);
		},
		[updateCollection]
	);

	const handleDuplicate = useCallback(
		(id: string) => {
			const collection = collections.find((col) => col.id === id);
			duplicateCollection(id);
			toast.success(
				`Collection "${collection?.name}" duplicated successfully`
			);
		},
		[duplicateCollection, collections]
	);

	const handleAddField = useCallback(
		(collectionId: string, position?: { x: number; y: number }) => {
			const collection = collections.find(
				(col) => col.id === collectionId
			);
			if (collection) {
				setAddFieldModal({
					isOpen: true,
					collectionId: collectionId,
					collectionName: collection.name,
					position: position || collection.position, // Use cursor position if provided
				});
			}
		},
		[collections]
	);
	const handleDelete = useCallback(
		(id: string, position?: { x: number; y: number }) => {
			const collection = collections.find((col) => col.id === id);
			if (collection) {
				setConfirmDelete({
					isOpen: true,
					collectionId: id,
					collectionName: collection.name,
					position: position || collection.position, // Use cursor position if provided
				});
			}
		},
		[collections]
	);

	const handleContextMenu = useCallback(
		(
			event: React.MouseEvent,
			collectionId: string,
			collectionName: string
		) => {
			event.preventDefault();
			setContextMenu({
				x: event.clientX,
				y: event.clientY,
				collectionId,
				collectionName,
			});
		},
		[]
	);

	const handleFieldContextMenu = useCallback(
		(
			event: React.MouseEvent,
			collectionId: string,
			fieldIndex: number,
			fieldName: string
		) => {
			event.preventDefault();
			setFieldContextMenu({
				x: event.clientX,
				y: event.clientY,
				collectionId,
				fieldIndex,
				fieldName,
			});
		},
		[]
	);
	// Handle right-click on empty area to create new collection
	const handleEmptyAreaContextMenu = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			setContextMenu({
				x: event.clientX,
				y: event.clientY,
				collectionId: '',
				collectionName: '',
			});
		},
		[]
	);
	// Collection edit handlers
	const handleEditCollection = useCallback(
		(collectionId: string, position?: { x: number; y: number }) => {
			const collection = collections.find(
				(col) => col.id === collectionId
			);
			if (collection) {
				setEditCollectionModal({
					isOpen: true,
					collection,
					position,
				});
			}
		},
		[collections]
	);
	// Handle clicks to close context menu
	const handleClick = useCallback(() => {
		if (contextMenu) {
			setContextMenu(null);
		}
		if (fieldContextMenu) {
			setFieldContextMenu(null);
		}
	}, [contextMenu, fieldContextMenu]);
	const confirmDeleteAction = useCallback(() => {
		removeCollection(confirmDelete.collectionId);
		setConfirmDelete({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
		toast.success(
			`Collection "${confirmDelete.collectionName}" deleted successfully`
		);
	}, [
		removeCollection,
		confirmDelete.collectionId,
		confirmDelete.collectionName,
	]);
	const handleCreateCollection = useCallback(
		(position?: { x: number; y: number }) => {
			setCreateCollectionModal({ isOpen: true, position });
		},
		[]
	);

	const cancelDelete = useCallback(() => {
		setConfirmDelete({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
	}, []);
	const handleDeleteField = useCallback(
		(
			collectionId: string,
			fieldIndex: number,
			position?: { x: number; y: number }
		) => {
			const collection = collections.find(
				(col) => col.id === collectionId
			);
			if (collection && collection.fields[fieldIndex]) {
				setConfirmFieldDelete({
					isOpen: true,
					collectionId,
					fieldIndex,
					fieldName: collection.fields[fieldIndex].name,
					position,
				});
			}
		},
		[collections]
	);

	const handleAddFieldSubmit = useCallback(
		(field: { name: string; type: string; required: boolean }) => {
			addField(addFieldModal.collectionId, field);
			setAddFieldModal({
				isOpen: false,
				collectionId: '',
				collectionName: '',
			});
			toast.success(`Field "${field.name}" added successfully`);
		},
		[addField, addFieldModal.collectionId]
	);
	// Code generation handlers
	const handleGenerateCode = useCallback((collectionId: string) => {
		setCodeSidebar({
			isOpen: true,
			selectedCollectionId: collectionId,
		});
	}, []);

	const handleCloseModal = useCallback(() => {
		setAddFieldModal({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
	}, []);
	const closeFieldContextMenu = useCallback(() => {
		setFieldContextMenu(null);
	}, []);

	const handleEditField = useCallback(
		(
			collectionId: string,
			fieldIndex: number,
			position?: { x: number; y: number }
		) => {
			const collection = collections.find(
				(col) => col.id === collectionId
			);
			if (collection && collection.fields[fieldIndex]) {
				setEditFieldModal({
					isOpen: true,
					collectionId,
					fieldIndex,
					field: collection.fields[fieldIndex],
					position,
				});
			}
		},
		[collections]
	);
	// Close all context menus
	const closeAllMenus = useCallback(() => {
		if (contextMenu) {
			setContextMenu(null);
		}
		if (fieldContextMenu) {
			setFieldContextMenu(null);
		}
	}, [contextMenu, fieldContextMenu]);

	const nodes: Node[] = useMemo(() => {
		return collections.map((col, index) => ({
			id: col.id,
			type: 'collectionNode',
			data: {
				name: col.name,
				id: col.id,
				fields: col.fields,
				onContextMenu: handleContextMenu,
				onFieldContextMenu: handleFieldContextMenu,
				onCloseMenus: closeAllMenus,
			},
			position: col.position || { x: 100 + index * 220, y: 100 },
		}));
	}, [collections, handleContextMenu, handleFieldContextMenu, closeAllMenus]);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			changes.forEach((change) => {
				if (change.type === 'position' && change.position) {
					updateCollectionPosition(change.id, change.position);
				}
			});
		},
		[updateCollectionPosition]
	);
	const edges: Edge[] = useMemo(() => {
		// Group connections by source-target pair to handle overlapping
		const connectionGroups = connections.reduce(
			(groups, connection) => {
				const key = `${connection.sourceCollectionName}-${connection.targetCollectionName}`;
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(connection);
				return groups;
			},
			{} as Record<string, typeof connections>
		);

		return connections
			.map((connection, index) => {
				const groupKey = `${connection.sourceCollectionName}-${connection.targetCollectionName}`;
				const group = connectionGroups[groupKey];
				const connectionIndex = group.findIndex(
					(c) => c.id === connection.id
				);
				const totalInGroup = group.length;

				// Find the collection IDs from names
				const sourceCollection = collections.find(
					(c) => c.name === connection.sourceCollectionName
				);
				const targetCollection = collections.find(
					(c) => c.name === connection.targetCollectionName
				);

				if (!sourceCollection || !targetCollection) {
					return null;
				}

				// Find field indices from names for handle IDs
				const sourceFieldIndex = sourceCollection.fields.findIndex(
					(f) => f.name === connection.sourceFieldName
				);
				const targetFieldIndex = targetCollection.fields.findIndex(
					(f) => f.name === connection.targetFieldName
				);

				// Calculate offset for multiple connections between same nodes
				let pathOptions = {};
				if (totalInGroup > 1) {
					// Create more pronounced spacing for multiple connections
					const baseOffset = 40;
					const spacing = Math.min(
						80,
						baseOffset + (totalInGroup - 2) * 20
					);
					const offset =
						(connectionIndex - (totalInGroup - 1) / 2) * spacing;

					pathOptions = {
						offset: offset,
						borderRadius: Math.abs(offset) + 30,
						curvature: 0.2 + Math.abs(offset) * 0.005,
					};
				}

				return {
					id: connection.id,
					source: sourceCollection.id,
					target: targetCollection.id,
					sourceHandle: `${sourceCollection.id}-field-${sourceFieldIndex}-source`,
					targetHandle: `${targetCollection.id}-field-${targetFieldIndex}-target`,
					type: totalInGroup > 1 ? 'custom' : 'default',
					animated: true,
					style: {
						stroke: isDark ? '#3b82f6' : '#2563eb',
						strokeWidth: 2,
					},
					markerEnd: {
						type: MarkerType.Arrow,
						color: isDark ? '#3b82f6' : '#2563eb',
					},
					pathOptions,
					data: {
						sourceField: connection.sourceFieldName,
						targetField: connection.targetFieldName,
						connectionType: connection.type,
						groupIndex: connectionIndex,
						totalInGroup: totalInGroup,
					},
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => edge !== null);
	}, [connections, collections, isDark]);

	const onConnect = useCallback(
		(connection: Connection) => {
			if (
				!connection.source ||
				!connection.target ||
				!connection.sourceHandle ||
				!connection.targetHandle
			) {
				return;
			}

			// Parse the handle IDs to get collection and field information
			const sourceMatch = connection.sourceHandle.match(
				/^(.+)-field-(\d+)-source$/
			);
			const targetMatch = connection.targetHandle.match(
				/^(.+)-field-(\d+)-target$/
			);

			if (!sourceMatch || !targetMatch) {
				return;
			}

			const sourceCollectionId = sourceMatch[1];
			const sourceFieldIndex = parseInt(sourceMatch[2]);
			const targetCollectionId = targetMatch[1];
			const targetFieldIndex = parseInt(targetMatch[2]);

			// Find the collections and fields
			const sourceCollection = collections.find(
				(c) => c.id === sourceCollectionId
			);
			const targetCollection = collections.find(
				(c) => c.id === targetCollectionId
			);

			if (!sourceCollection || !targetCollection) {
				return;
			}

			const sourceField = sourceCollection.fields[sourceFieldIndex];
			const targetField = targetCollection.fields[targetFieldIndex];

			if (!sourceField || !targetField) {
				return;
			}

			// Validate that both fields are objectId type
			if (
				sourceField.type !== 'objectId' ||
				targetField.type !== 'objectId'
			) {
				return;
			}

			// Prevent _id fields from connecting to other _id fields
			if (sourceField.name === '_id' && targetField.name === '_id') {
				return;
			}

			// Check connection limits:
			// - _id fields can have multiple connections
			// - Other objectId fields can only have one connection
			if (sourceField.name !== '_id') {
				const sourceConnections = getFieldConnections(
					sourceCollection.name,
					sourceField.name
				);
				if (sourceConnections.length > 0) {
					return; // This field already has a connection
				}
			}

			if (targetField.name !== '_id') {
				const targetConnections = getFieldConnections(
					targetCollection.name,
					targetField.name
				);
				if (targetConnections.length > 0) {
					return; // This field already has a connection
				}
			}

			// Create the connection
			addConnection({
				sourceCollectionName: sourceCollection.name,
				sourceFieldName: sourceField.name,
				targetCollectionName: targetCollection.name,
				targetFieldName: targetField.name,
				type: 'reference',
			});

			toast.success(
				`Connection created between ${sourceCollection.name}.${sourceField.name} and ${targetCollection.name}.${targetField.name}`
			);
		},
		[collections, getFieldConnections, addConnection]
	);

	return (
		<>
			<div className="h-full w-full pb-14 pt-20">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={{ collectionNode: CollectionNode }}
					edgeTypes={{ custom: CustomEdge }}
					onNodesChange={onNodesChange}
					onConnect={onConnect}
					onPaneContextMenu={handleEmptyAreaContextMenu}
					onPaneClick={handleClick}
					fitView
					className="h-full w-full rounded-lg"
					defaultViewport={{ x: 0, y: 0, zoom: 1 }}
					minZoom={0.1}
					maxZoom={3}
					attributionPosition="bottom-left"
					nodesDraggable={true}
					nodesConnectable={true}
					elementsSelectable={true}
					snapToGrid={false}
					snapGrid={[1, 1]}
					deleteKeyCode={null}
					multiSelectionKeyCode={null}
					preventScrolling={false}
					zoomOnScroll={true}
					zoomOnPinch={true}
					panOnScroll={false}
					panOnScrollSpeed={0.5}
					zoomOnDoubleClick={false}
					proOptions={{ hideAttribution: true }}
					nodeOrigin={[0, 0]}
					nodeDragThreshold={0}
				>
					{/* Enhanced Background */}
					<Background
						color={isDark ? '#374151' : '#94a3b8'}
						gap={20}
						size={1}
						style={{
							backgroundColor: isDark ? '#111827' : '#f1f5f9',
						}}
					/>

					{/* Enhanced Controls */}
					<Controls
						position="top-right"
						className={`backdrop-blur-sm border rounded-lg shadow-lg ${
							isDark
								? 'bg-gray-900/95 border-gray-700/60'
								: 'bg-white/95 border-gray-300/60'
						}`}
						style={{
							top: '80px',
							right: '16px',
						}}
					/>
				</ReactFlow>
			</div>
			{/* Enhanced Context Menu */}
			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					collectionId={contextMenu.collectionId}
					collectionName={contextMenu.collectionName}
					onClose={closeContextMenu}
					onDelete={handleDelete}
					onDuplicate={handleDuplicate}
					onAddField={handleAddField}
					onEditCollection={handleEditCollection}
					onCreateCollection={handleCreateCollection}
					onGenerateCode={handleGenerateCode}
				/>
			)}

			{fieldContextMenu && (
				<FieldContextMenu
					x={fieldContextMenu.x}
					y={fieldContextMenu.y}
					collectionId={fieldContextMenu.collectionId}
					fieldIndex={fieldContextMenu.fieldIndex}
					fieldName={fieldContextMenu.fieldName}
					onClose={closeFieldContextMenu}
					onEditField={handleEditField}
					onDeleteField={handleDeleteField}
					onAddField={handleAddField}
				/>
			)}
			<AddFieldModal
				isOpen={addFieldModal.isOpen}
				collectionName={addFieldModal.collectionName}
				position={addFieldModal.position}
				onClose={handleCloseModal}
				onAddField={handleAddFieldSubmit}
			/>

			<ConfirmDialog
				isOpen={confirmDelete.isOpen}
				title="Delete Collection"
				message={`Are you sure you want to delete the "${confirmDelete.collectionName}" collection? This action cannot be undone.`}
				position={confirmDelete.position}
				onConfirm={confirmDeleteAction}
				onCancel={cancelDelete}
			/>
			<CreateCollectionModal
				isOpen={createCollectionModal.isOpen}
				position={createCollectionModal.position}
				onClose={handleCloseCreateModal}
				onCreateCollection={handleCreateCollectionSubmit}
			/>

			<EditFieldModal
				isOpen={editFieldModal.isOpen}
				field={editFieldModal.field}
				position={editFieldModal.position}
				onClose={handleCloseEditField}
				onSave={handleEditFieldSubmit}
			/>

			<ConfirmFieldDeleteDialog
				isOpen={confirmFieldDelete.isOpen}
				fieldName={confirmFieldDelete.fieldName}
				position={confirmFieldDelete.position}
				onConfirm={confirmFieldDeleteAction}
				onCancel={cancelFieldDelete}
			/>

			<EditCollectionModal
				isOpen={editCollectionModal.isOpen}
				collection={editCollectionModal.collection}
				position={editCollectionModal.position}
				onClose={handleCloseEditCollection}
				onSave={handleEditCollectionSubmit}
			/>

			{/* Enhanced Code Generation Modal */}
			<CodeGenerationModal
				isOpen={codeSidebar.isOpen}
				selectedCollectionId={codeSidebar.selectedCollectionId}
				onClose={handleCloseCodeSidebar}
			/>
		</>
	);
}

export default Canvas;
