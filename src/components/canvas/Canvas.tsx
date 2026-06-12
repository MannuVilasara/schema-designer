import ReactFlow, {
	Background,
	Connection,
	Controls,
	Edge,
	MarkerType,
	Node,
	NodeChange,
	applyNodeChanges,
	SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import CustomEdge from '@/components/CustomEdge';
import toast from 'react-hot-toast';
import {
	AddFieldModal,
	ConfirmDialog,
	ConfirmFieldDeleteDialog,
	ContextMenu,
	CreateCollectionModal,
	EditCollectionModal,
	EditFieldModal,
	FieldContextMenu,
	EdgeContextMenu,
} from '@/components';
import { CollectionNode, StickyNoteNode } from '@/components/nodes';

const nodeTypes = { collectionNode: CollectionNode, stickyNoteNode: StickyNoteNode };
const edgeTypes = { custom: CustomEdge };

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
	const dbType = useSchemaStore((state) => state.dbType);

	const notes = useSchemaStore((state) => state.notes);
	const updateNotePosition = useSchemaStore((state) => state.updateNotePosition);
	const removeNote = useSchemaStore((state) => state.removeNote);
	const addNote = useSchemaStore((state) => state.addNote);

	// Global Keyboard Shortcuts (Undo/Redo)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const isUndo = (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
			const isRedo = (isMac ? e.metaKey : e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'));
			
			if (isUndo || isRedo) {
				const activeElement = document.activeElement;
				const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
				if (isInput) return; // Don't trigger if user is typing
				
				e.preventDefault();
				if (isUndo) {
					useSchemaStore.temporal.getState().undo();
				} else if (isRedo) {
					useSchemaStore.temporal.getState().redo();
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

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

	const [edgeContextMenu, setEdgeContextMenu] = useState<{
		x: number;
		y: number;
		connectionId: string;
		cardinality: '1:1' | '1:n' | 'n:1' | 'n:m';
	} | null>(null);

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
			toast.success(`Field "${field.name}" updated`);
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
			toast.success(`${dbType === 'postgresql' ? 'Table' : 'Collection'} "${name}" created`);
		},
		[addCollection, dbType]
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
		toast.success(`Field "${confirmFieldDelete.fieldName}" deleted`);
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

	const handleEditCollectionSubmit = useCallback(
		(collectionId: string, name: string) => {
			updateCollection(collectionId, name);
			setEditCollectionModal({
				isOpen: false,
				collection: null,
			});
			toast.success(`Renamed to "${name}"`);
		},
		[updateCollection]
	);

	const handleDuplicate = useCallback(
		(id: string) => {
			const collection = collections.find((col) => col.id === id);
			duplicateCollection(id);
			toast.success(`"${collection?.name}" duplicated`);
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
					position: position || collection.position,
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
					position: position || collection.position,
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

	const handleAddNote = useCallback(
		(position?: { x: number; y: number }) => {
			addNote(position || { x: 100, y: 100 });
		},
		[addNote]
	);

	const handleEdgeContextMenu = useCallback(
		(event: React.MouseEvent, connectionId: string, cardinality: '1:1' | '1:n' | 'n:1' | 'n:m') => {
			event.preventDefault();
			event.stopPropagation();
			setEdgeContextMenu({
				x: event.clientX,
				y: event.clientY,
				connectionId,
				cardinality,
			});
		},
		[]
	);

	const onReactFlowEdgeContextMenu = useCallback(
		(event: React.MouseEvent, edge: Edge) => {
			event.preventDefault();
			event.stopPropagation();
			const cardinality = edge.data?.cardinality || '1:n';
			setEdgeContextMenu({
				x: event.clientX,
				y: event.clientY,
				connectionId: edge.id,
				cardinality: cardinality,
			});
		},
		[]
	);

	const onReactFlowNodeContextMenu = useCallback(
		(event: React.MouseEvent, node: Node) => {
			event.preventDefault();
			event.stopPropagation();
			
			if (node.type === 'collectionNode') {
				setContextMenu({
					x: event.clientX,
					y: event.clientY,
					collectionId: node.id,
					collectionName: node.data.name,
				});
			}
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

	const handleClick = useCallback(() => {
		if (contextMenu) setContextMenu(null);
		if (fieldContextMenu) setFieldContextMenu(null);
		if (edgeContextMenu) setEdgeContextMenu(null);
	}, [contextMenu, fieldContextMenu, edgeContextMenu]);

	const confirmDeleteAction = useCallback(() => {
		removeCollection(confirmDelete.collectionId);
		setConfirmDelete({
			isOpen: false,
			collectionId: '',
			collectionName: '',
		});
		toast.success(`"${confirmDelete.collectionName}" deleted`);
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
			toast.success(`Field "${field.name}" added`);
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

	const closeAllMenus = useCallback(() => {
		if (contextMenu) setContextMenu(null);
		if (fieldContextMenu) setFieldContextMenu(null);
		if (edgeContextMenu) setEdgeContextMenu(null);
	}, [contextMenu, fieldContextMenu, edgeContextMenu]);

	const [localNodes, setLocalNodes] = useState<Node[]>([]);

	useEffect(() => {
		const collectionNodes: Node[] = collections.map((col, index) => ({
			id: col.id,
			type: 'collectionNode',
			data: {
				name: col.name,
				id: col.id,
				fields: col.fields,
				onContextMenu: handleContextMenu,
				onFieldContextMenu: handleFieldContextMenu,
				onCloseMenus: closeAllMenus,
				accentColor: col.accentColor,
			},
			position: col.position || { x: 100 + index * 220, y: 100 },
		}));

		const noteNodes: Node[] = notes.map((note) => ({
			id: note.id,
			type: 'stickyNoteNode',
			data: {
				text: note.text,
			},
			position: note.position,
		}));

		setLocalNodes([...collectionNodes, ...noteNodes]);
	}, [collections, notes, handleContextMenu, handleFieldContextMenu, closeAllMenus]);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setLocalNodes((nds) => applyNodeChanges(changes, nds));
		},
		[]
	);

	const onNodeDragStop = useCallback(
		(event: React.MouseEvent, node: Node) => {
			if (node.type === 'collectionNode') {
				updateCollectionPosition(node.id, node.position);
			} else if (node.type === 'stickyNoteNode') {
				updateNotePosition(node.id, node.position);
			}
		},
		[updateCollectionPosition, updateNotePosition]
	);

	const onNodesDelete = useCallback((deleted: Node[]) => {
		deleted.forEach((node) => {
			if (node.type === 'collectionNode') {
				removeCollection(node.id);
			} else if (node.type === 'stickyNoteNode') {
				removeNote(node.id);
			}
		});
	}, [removeCollection, removeNote]);

	const edges: Edge[] = useMemo(() => {
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

		// Monochromatic edge colors
		const edgeColor = isDark ? '#404040' : '#a3a3a3';

		return connections
			.map((connection) => {
				const groupKey = `${connection.sourceCollectionName}-${connection.targetCollectionName}`;
				const group = connectionGroups[groupKey];
				const connectionIndex = group.findIndex(
					(c) => c.id === connection.id
				);
				const totalInGroup = group.length;

				const sourceCollection = collections.find(
					(c) => c.name === connection.sourceCollectionName
				);
				const targetCollection = collections.find(
					(c) => c.name === connection.targetCollectionName
				);

				if (!sourceCollection || !targetCollection) return null;

				const sourceFieldIndex = sourceCollection.fields.findIndex(
					(f) => f.name === connection.sourceFieldName
				);
				const targetFieldIndex = targetCollection.fields.findIndex(
					(f) => f.name === connection.targetFieldName
				);

				let pathOptions = {};
				if (totalInGroup > 1) {
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

				const cardinality = connection.cardinality || '1:n';
				const colorSuffix = isDark ? 'dark' : 'light';
				let markerStartId = '';
				let markerEndId = '';

				if (cardinality === '1:n') {
					markerStartId = `crows-one-${colorSuffix}`;
					markerEndId = `crows-many-${colorSuffix}`;
				} else if (cardinality === '1:1') {
					markerStartId = `crows-one-${colorSuffix}`;
					markerEndId = `crows-one-${colorSuffix}`;
				} else if (cardinality === 'n:1') {
					markerStartId = `crows-many-${colorSuffix}`;
					markerEndId = `crows-one-${colorSuffix}`;
				} else if (cardinality === 'n:m') {
					markerStartId = `crows-many-${colorSuffix}`;
					markerEndId = `crows-many-${colorSuffix}`;
				}

				return {
					id: connection.id,
					source: sourceCollection.id,
					target: targetCollection.id,
					sourceHandle: `${sourceCollection.id}-field-${sourceFieldIndex}-source`,
					targetHandle: `${targetCollection.id}-field-${targetFieldIndex}-target`,
					type: totalInGroup > 1 ? 'custom' : 'default',
					animated: false,
					style: {
						stroke: edgeColor,
						strokeWidth: 1.5,
					},
					markerStart: `url(#${markerStartId})`,
					markerEnd: `url(#${markerEndId})`,
					pathOptions,
					data: {
						sourceField: connection.sourceFieldName,
						targetField: connection.targetFieldName,
						connectionType: connection.type,
						groupIndex: connectionIndex,
						totalInGroup: totalInGroup,
						cardinality: cardinality,
						onContextMenu: handleEdgeContextMenu,
					},
				};
			})
			.filter((edge): edge is NonNullable<typeof edge> => edge !== null);
	}, [connections, collections, isDark]);

	const idFieldName = dbType === 'postgresql' ? 'id' : '_id';

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

			const sourceMatch = connection.sourceHandle.match(
				/^(.+)-field-(\d+)-source$/
			);
			const targetMatch = connection.targetHandle.match(
				/^(.+)-field-(\d+)-target$/
			);

			if (!sourceMatch || !targetMatch) return;

			const sourceCollectionId = sourceMatch[1];
			const sourceFieldIndex = parseInt(sourceMatch[2]);
			const targetCollectionId = targetMatch[1];
			const targetFieldIndex = parseInt(targetMatch[2]);

			const sourceCollection = collections.find(
				(c) => c.id === sourceCollectionId
			);
			const targetCollection = collections.find(
				(c) => c.id === targetCollectionId
			);

			if (!sourceCollection || !targetCollection) return;

			const sourceField = sourceCollection.fields[sourceFieldIndex];
			const targetField = targetCollection.fields[targetFieldIndex];

			if (!sourceField || !targetField) return;

			// Validate ref types
			const refTypes = ['objectId', 'uuid'];
			if (
				!refTypes.includes(sourceField.type) ||
				!refTypes.includes(targetField.type)
			) {
				return;
			}

			// Prevent ID-to-ID connections
			if (
				sourceField.name === idFieldName &&
				targetField.name === idFieldName
			) {
				return;
			}

			// Connection limits
			if (sourceField.name !== idFieldName) {
				const sourceConnections = getFieldConnections(
					sourceCollection.name,
					sourceField.name
				);
				if (sourceConnections.length > 0) return;
			}

			if (targetField.name !== idFieldName) {
				const targetConnections = getFieldConnections(
					targetCollection.name,
					targetField.name
				);
				if (targetConnections.length > 0) return;
			}

			addConnection({
				sourceCollectionName: sourceCollection.name,
				sourceFieldName: sourceField.name,
				targetCollectionName: targetCollection.name,
				targetFieldName: targetField.name,
				type: 'reference',
			});

			toast.success(
				`Connected ${sourceCollection.name}.${sourceField.name} → ${targetCollection.name}.${targetField.name}`
			);
		},
		[collections, getFieldConnections, addConnection, idFieldName]
	);

	return (
		<>
			<div className="h-full w-full">
				<ReactFlow
					nodes={localNodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onNodeDragStop={onNodeDragStop}
					onNodesDelete={onNodesDelete}
					onConnect={onConnect}
					onPaneContextMenu={handleEmptyAreaContextMenu}
					onPaneClick={handleClick}
					onEdgeContextMenu={onReactFlowEdgeContextMenu}
					onNodeContextMenu={onReactFlowNodeContextMenu}
					fitView
					className="h-full w-full"
					defaultViewport={{ x: 0, y: 0, zoom: 1 }}
					minZoom={0.1}
					maxZoom={3}
					attributionPosition="bottom-left"
					nodesDraggable={true}
					nodesConnectable={true}
					elementsSelectable={true}
					snapToGrid={false}
					snapGrid={[1, 1]}
					deleteKeyCode={['Backspace', 'Delete']}
					multiSelectionKeyCode={null}
					preventScrolling={false}
					zoomOnScroll={true}
					zoomOnPinch={true}
					panOnScroll={false}
					panOnDrag={false}
					selectionOnDrag={true}
					selectionMode={SelectionMode.Partial}
					panActivationKeyCode="Space"
					panOnScrollSpeed={0.5}
					zoomOnDoubleClick={false}
					proOptions={{ hideAttribution: true }}
					nodeOrigin={[0, 0]}
					nodeDragThreshold={0}
				>
					<svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
						<defs>
							{/* Light Mode Markers */}
							<marker id="crows-one-light" markerWidth="20" markerHeight="20" refX="2" refY="10" orient="auto-start-reverse">
								<line x1="2" y1="5" x2="2" y2="15" stroke="#a3a3a3" strokeWidth="1.5" />
								<line x1="6" y1="5" x2="6" y2="15" stroke="#a3a3a3" strokeWidth="1.5" />
							</marker>
							<marker id="crows-many-light" markerWidth="20" markerHeight="20" refX="2" refY="10" orient="auto-start-reverse">
								<line x1="0" y1="10" x2="8" y2="5" stroke="#a3a3a3" strokeWidth="1.5" />
								<line x1="0" y1="10" x2="8" y2="15" stroke="#a3a3a3" strokeWidth="1.5" />
								<line x1="0" y1="10" x2="8" y2="10" stroke="#a3a3a3" strokeWidth="1.5" />
								<line x1="8" y1="5" x2="8" y2="15" stroke="#a3a3a3" strokeWidth="1.5" />
							</marker>
							{/* Dark Mode Markers */}
							<marker id="crows-one-dark" markerWidth="20" markerHeight="20" refX="2" refY="10" orient="auto-start-reverse">
								<line x1="2" y1="5" x2="2" y2="15" stroke="#404040" strokeWidth="1.5" />
								<line x1="6" y1="5" x2="6" y2="15" stroke="#404040" strokeWidth="1.5" />
							</marker>
							<marker id="crows-many-dark" markerWidth="20" markerHeight="20" refX="2" refY="10" orient="auto-start-reverse">
								<line x1="0" y1="10" x2="8" y2="5" stroke="#404040" strokeWidth="1.5" />
								<line x1="0" y1="10" x2="8" y2="15" stroke="#404040" strokeWidth="1.5" />
								<line x1="0" y1="10" x2="8" y2="10" stroke="#404040" strokeWidth="1.5" />
								<line x1="8" y1="5" x2="8" y2="15" stroke="#404040" strokeWidth="1.5" />
							</marker>
						</defs>
					</svg>
					<Background
						color={isDark ? '#1a1a1a' : '#e5e5e5'}
						gap={24}
						size={1.5}
						style={{
							backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
						}}
					/>
					<Controls
						position="top-right"
						className={`rounded-lg border ${
							isDark
								? 'bg-[#0a0a0a]/90 border-[#262626]'
								: 'bg-white/90 border-[#e5e5e5]'
						}`}
						style={{
							top: '16px',
							right: '16px',
						}}
					/>
				</ReactFlow>
			</div>

			{/* Context Menus */}
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
					onAddNote={handleAddNote}
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

			{edgeContextMenu && (
				<EdgeContextMenu
					x={edgeContextMenu.x}
					y={edgeContextMenu.y}
					connectionId={edgeContextMenu.connectionId}
					cardinality={edgeContextMenu.cardinality}
					onClose={() => setEdgeContextMenu(null)}
				/>
			)}

			{/* Modals */}
			<AddFieldModal
				isOpen={addFieldModal.isOpen}
				collectionName={addFieldModal.collectionName}
				position={addFieldModal.position}
				onClose={handleCloseModal}
				onAddField={handleAddFieldSubmit}
			/>

			<ConfirmDialog
				isOpen={confirmDelete.isOpen}
				title={`Delete ${dbType === 'postgresql' ? 'Table' : 'Collection'}`}
				message={`Are you sure you want to delete "${confirmDelete.collectionName}"? This cannot be undone.`}
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
		</>
	);
}

export default Canvas;
