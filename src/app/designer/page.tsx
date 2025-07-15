'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

import {
	AddFieldModal,
	BottomDock,
	CollectionNode,
	ConfirmDialog,
	ConfirmFieldDeleteDialog,
	ContextMenu,
	CreateCollectionModal,
	Dock,
	EditCollectionModal,
	EditFieldModal,
	FieldContextMenu,
	Navbar,
} from '@/components';
import CustomEdge from '@/components/CustomEdge';
import CodeSidebar from '@/components/layout/CodeSidebar';
import { useSchemaStore } from '@/store/schemaStore';
import { useTheme } from 'next-themes';
import { useThemeContext } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function HomePage() {
	const collections = useSchemaStore((state) => state.collections);
	const connections = useSchemaStore((state) => state.connections);
	const updateCollectionPosition = useSchemaStore(
		(state) => state.updateCollectionPosition
	);
	const removeCollection = useSchemaStore((state) => state.removeCollection);
	const duplicateCollection = useSchemaStore(
		(state) => state.duplicateCollection
	);
	const updateCollection = useSchemaStore((state) => state.updateCollection);
	const addField = useSchemaStore((state) => state.addField);
	const removeField = useSchemaStore((state) => state.removeField);
	const updateField = useSchemaStore((state) => state.updateField);
	const addCollection = useSchemaStore((state) => state.addCollection);
	const addConnection = useSchemaStore((state) => state.addConnection);
	const removeConnection = useSchemaStore((state) => state.removeConnection);
	const getFieldConnections = useSchemaStore(
		(state) => state.getFieldConnections
	);
	const { theme, resolvedTheme } = useTheme();
	const { isDark: isDarkMode } = useThemeContext();
	const [mounted, setMounted] = useState(false);
	const [scrollY, setScrollY] = useState(0);

	// Only run on client side after hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Context menu state
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		collectionId: string;
		collectionName: string;
	} | null>(null);

	// Add field modal state
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

	// Confirm delete dialog state
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

	// Create collection modal state
	const [createCollectionModal, setCreateCollectionModal] = useState<{
		isOpen: boolean;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
	});

	// Field context menu state
	const [fieldContextMenu, setFieldContextMenu] = useState<{
		x: number;
		y: number;
		collectionId: string;
		fieldIndex: number;
		fieldName: string;
	} | null>(null);

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

	// Confirm field delete dialog state
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

	// Edit collection modal state
	const [editCollectionModal, setEditCollectionModal] = useState<{
		isOpen: boolean;
		collection: any;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
		collection: null,
	});

	// Code sidebar state
	const [codeSidebar, setCodeSidebar] = useState<{
		isOpen: boolean;
		selectedCollectionId: string | null;
	}>({
		isOpen: false,
		selectedCollectionId: null,
	});

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

	// Handle clicks to close context menu
	const handleClick = useCallback(() => {
		if (contextMenu) {
			setContextMenu(null);
		}
		if (fieldContextMenu) {
			setFieldContextMenu(null);
		}
	}, [contextMenu, fieldContextMenu]);

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

	const closeContextMenu = useCallback(() => {
		setContextMenu(null);
	}, []);

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

	const cancelDelete = useCallback(() => {
		setConfirmDelete({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
	}, []);

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

	const handleCloseModal = useCallback(() => {
		setAddFieldModal({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
	}, []);

	const handleCreateCollection = useCallback(
		(position?: { x: number; y: number }) => {
			setCreateCollectionModal({ isOpen: true, position });
		},
		[]
	);

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

	// Field operation handlers
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

	const cancelFieldDelete = useCallback(() => {
		setConfirmFieldDelete({
			isOpen: false,
			collectionId: '',
			fieldIndex: -1,
			fieldName: '',
		});
	}, []);

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

	const handleCloseEditCollection = useCallback(() => {
		setEditCollectionModal({
			isOpen: false,
			collection: null,
		});
	}, []);

	// Code generation handlers
	const handleGenerateCode = useCallback((collectionId: string) => {
		setCodeSidebar({
			isOpen: true,
			selectedCollectionId: collectionId,
		});
	}, []);

	const handleCloseCodeSidebar = useCallback(() => {
		setCodeSidebar({
			isOpen: false,
			selectedCollectionId: null,
		});
	}, []);

	// Prevent hydration mismatch by using fallback until mounted
	const isDark = mounted ? resolvedTheme === 'dark' : false;

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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
			{/* Enhanced Navigation */}
			<Navbar scrollY={scrollY} />
			
			{/* Main Designer Container */}
			<div className="h-screen w-full flex pt-16 relative">
				{/* Enhanced Dock */}
				<div className="z-40">
					<Dock />
				</div>
				
				{/* Main Canvas Area */}
				<div className="flex-1 relative overflow-hidden">
					{/* Canvas Header */}
					<div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
						<div className="flex items-center space-x-4">
							{/* Workspace Title */}
							<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
								<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
									Schema Designer
								</h1>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{collections.length} collection{collections.length !== 1 ? 's' : ''}
								</p>
							</div>
							
							{/* Quick Stats */}
							<div className="hidden md:flex items-center space-x-3">
								<div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-200/50 dark:border-blue-700/50">
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
										<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
											{connections.length} connection{connections.length !== 1 ? 's' : ''}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Canvas Controls */}
						<div className="flex items-center space-x-2">
							<button 
								onClick={() => handleCreateCollection()}
								className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
								</svg>
								<span>Add Collection</span>
							</button>
						</div>
					</div>

					{/* Main Canvas */}
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
								className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg"
								style={{
									top: '80px',
									right: '16px'
								}}
							/>
						</ReactFlow>
					</div>

					{/* Enhanced Bottom Dock */}
					<div className="absolute bottom-0 left-0 right-0 z-30">
						<BottomDock />
					</div>

					{/* Empty State */}
					{collections.length === 0 && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="text-center max-w-md mx-auto px-6">
								<div className="mb-6">
									<div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
										<svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
									Start Building Your Schema
								</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
									Create your first collection to begin designing your MongoDB schema. 
									Right-click anywhere on the canvas or use the button above.
								</p>
								<div className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
										<span>Right-click to create collections</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
										<span>Drag to connect ObjectId fields</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
										<span>Generate code for your schemas</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
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

			{/* Enhanced Modals */}
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

			{/* Enhanced Code Sidebar */}
			<CodeSidebar
				isOpen={codeSidebar.isOpen}
				selectedCollectionId={codeSidebar.selectedCollectionId}
				onClose={handleCloseCodeSidebar}
			/>
		</div>
	);
}
