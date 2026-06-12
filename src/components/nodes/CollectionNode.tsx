'use client';

import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import toast from 'react-hot-toast';
import {
	Type,
	Hash,
	ToggleLeft,
	Calendar,
	List,
	Braces,
	ExternalLink,
	Key,
	ChevronUp,
	ChevronDown,
	Link,
	X,
	Plus,
} from 'lucide-react';
import type { CollectionNodeProps } from '@/types';

interface FieldItemProps {
	field: any;
	index: number;
	isDark: boolean;
	data: any;
	getFieldIcon: (type: string) => React.ReactNode;
	getFieldConnections: (collectionName: string, fieldName: string) => any[];
	handleClick: () => void;
	handleMouseDown: (e: React.MouseEvent) => void;
	handleFieldContextMenu: (
		e: React.MouseEvent,
		index: number,
		fieldName: string
	) => void;
	handleRemoveConnection: (e: React.MouseEvent, connectionId: string) => void;
	isTimestampField: boolean;
	isIdField: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

function FieldItem({
	field,
	index,
	isDark,
	data,
	getFieldIcon,
	getFieldConnections,
	handleClick,
	handleMouseDown,
	handleFieldContextMenu,
	handleRemoveConnection,
	isTimestampField,
	isIdField,
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: FieldItemProps) {
	const isObjectIdField =
		field.type === 'objectId' || field.type === 'uuid';
	const fieldConnections = getFieldConnections(data.name, field.name);
	const hasConnections = fieldConnections.length > 0;
	const canAcceptMoreConnections = isIdField || fieldConnections.length === 0;

	return (
		<div
			className={`relative flex items-center justify-between py-1.5 px-2 rounded text-xs ${
				isTimestampField
					? 'cursor-default'
					: 'cursor-pointer'
			} ${
				isDark
					? isIdField
						? 'bg-[#1a1a1a]'
						: isTimestampField
							? 'bg-[#141414]'
							: 'hover:bg-[#1a1a1a]'
					: isIdField
						? 'bg-[#f7f7f7]'
						: isTimestampField
							? 'bg-[#fafafa]'
							: 'hover:bg-[#f7f7f7]'
			}`}
			style={{ transition: 'none' }}
			onClick={handleClick}
			onMouseDown={handleMouseDown}
			onContextMenu={(e) => handleFieldContextMenu(e, index, field.name)}
		>
			{/* Reorder controls */}
			{!isTimestampField && !isIdField && (
				<div className="flex flex-col items-center mr-1 gap-0">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onMoveUp();
						}}
						disabled={!canMoveUp}
						className={`p-0 rounded ${
							!canMoveUp
								? 'opacity-20 cursor-not-allowed'
								: isDark
									? 'opacity-30 hover:opacity-70 text-[#a3a3a3]'
									: 'opacity-30 hover:opacity-70 text-[#737373]'
						}`}
						style={{ transition: 'none' }}
					>
						<ChevronUp className="w-2.5 h-2.5" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onMoveDown();
						}}
						disabled={!canMoveDown}
						className={`p-0 rounded ${
							!canMoveDown
								? 'opacity-20 cursor-not-allowed'
								: isDark
									? 'opacity-30 hover:opacity-70 text-[#a3a3a3]'
									: 'opacity-30 hover:opacity-70 text-[#737373]'
						}`}
						style={{ transition: 'none' }}
					>
						<ChevronDown className="w-2.5 h-2.5" />
					</button>
				</div>
			)}

			{/* Connection handles for ref fields */}
			{isObjectIdField && (
				<Handle
					type="target"
					position={Position.Left}
					id={`${data.id}-field-${index}-target`}
					className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-2 rounded-full ${
						isDark
							? 'border-[#262626]'
							: 'border-[#e5e5e5]'
					} ${
						canAcceptMoreConnections
							? hasConnections
								? isDark
									? 'bg-[#a3a3a3]'
									: 'bg-[#525252]'
								: isDark
									? 'bg-[#525252]'
									: 'bg-[#a3a3a3]'
							: isDark
								? 'bg-[#333] cursor-not-allowed'
								: 'bg-[#d4d4d4] cursor-not-allowed'
					}`}
					style={{
						left: '-5px',
						zIndex: 10,
						transition: 'none',
					}}
					isConnectable={canAcceptMoreConnections}
				/>
			)}
			{isObjectIdField && (
				<Handle
					type="source"
					position={Position.Right}
					id={`${data.id}-field-${index}-source`}
					className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-2 rounded-full ${
						isDark
							? 'border-[#262626]'
							: 'border-[#e5e5e5]'
					} ${
						canAcceptMoreConnections
							? hasConnections
								? isDark
									? 'bg-[#a3a3a3]'
									: 'bg-[#525252]'
								: isDark
									? 'bg-[#525252]'
									: 'bg-[#a3a3a3]'
							: isDark
								? 'bg-[#333] cursor-not-allowed'
								: 'bg-[#d4d4d4] cursor-not-allowed'
					}`}
					style={{
						right: '-5px',
						zIndex: 10,
						transition: 'none',
					}}
					isConnectable={canAcceptMoreConnections}
				/>
			)}

			<div className="flex items-center gap-1.5 flex-1 min-w-0">
				<span className={isDark ? 'text-[#525252]' : 'text-[#d4d4d4]'}>
					{getFieldIcon(field.type)}
				</span>
				<span
					className={`truncate ${
						isIdField
							? 'font-semibold'
							: isTimestampField
								? isDark
									? 'text-[#525252] italic'
									: 'text-[#a3a3a3] italic'
								: 'font-medium'
					}`}
				>
					{field.name}
				</span>
				{field.required && !isIdField && (
					<span
						className={`text-[10px] ${isDark ? 'text-[#525252]' : 'text-[#a3a3a3]'}`}
					>
						*
					</span>
				)}
				{isTimestampField && (
					<span
						className={`text-[10px] ${isDark ? 'text-[#3a3a3a]' : 'text-[#c4c4c4]'}`}
					>
						auto
					</span>
				)}
				{/* Connection indicator */}
				{hasConnections && (
					<div className="flex items-center gap-0.5">
						<Link
							className={`w-2.5 h-2.5 ${isDark ? 'text-[#737373]' : 'text-[#a3a3a3]'}`}
						/>
						<span
							className={`text-[10px] ${isDark ? 'text-[#737373]' : 'text-[#a3a3a3]'}`}
						>
							{fieldConnections.length}
						</span>
						{!isIdField &&
							fieldConnections.map((connection: any) => (
								<button
									key={connection.id}
									onClick={(e) =>
										handleRemoveConnection(e, connection.id)
									}
									className={`ml-0.5 p-0.5 rounded-full transition-colors ${
										isDark
											? 'bg-[#262626] hover:bg-[#dc2626] text-[#737373] hover:text-white'
											: 'bg-[#f0f0f0] hover:bg-[#dc2626] text-[#a3a3a3] hover:text-white'
									}`}
									title="Remove connection"
									style={{ transition: 'background 0.15s, color 0.15s' }}
								>
									<X className="w-2 h-2" />
								</button>
							))}
					</div>
				)}
			</div>
			<span
				className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
					isDark
						? 'bg-[#1a1a1a] text-[#525252]'
						: 'bg-[#f5f5f5] text-[#a3a3a3]'
				}`}
			>
				{field.type}
			</span>
		</div>
	);
}

export default function CollectionNode({ data }: CollectionNodeProps) {
	const { isDark } = useThemeContext();
	const getFieldConnections = useSchemaStore(
		(state) => state.getFieldConnections
	);
	const removeConnection = useSchemaStore((state) => state.removeConnection);
	const reorderFields = useSchemaStore((state) => state.reorderFields);
	const dbType = useSchemaStore((state) => state.dbType);

	const idFieldName = dbType === 'postgresql' ? 'id' : '_id';

	// Dynamic height
	const getCollectionHeight = () => {
		const headerHeight = 52;
		const fieldHeight = 32;
		const containerPadding = 16;
		const spaceBetweenFields = 4;
		const minFieldsHeight = 56;

		if (data.fields.length === 0) {
			return headerHeight + minFieldsHeight;
		}

		const totalFieldsHeight = data.fields.length * fieldHeight;
		const totalSpacingHeight = Math.max(
			0,
			(data.fields.length - 1) * spaceBetweenFields
		);
		const fieldsHeight =
			totalFieldsHeight + totalSpacingHeight + containerPadding;
		return Math.min(Math.max(headerHeight + fieldsHeight, 120), 460);
	};

	const needsScrolling = () => {
		const headerHeight = 52;
		const fieldHeight = 32;
		const containerPadding = 16;
		const spaceBetweenFields = 4;

		const totalFieldsHeight = data.fields.length * fieldHeight;
		const totalSpacingHeight = Math.max(
			0,
			(data.fields.length - 1) * spaceBetweenFields
		);
		return (
			headerHeight +
				totalFieldsHeight +
				totalSpacingHeight +
				containerPadding >
			460
		);
	};

	const collectionHeight = getCollectionHeight();
	const showScrolling = needsScrolling();

	const dynamicStyles = useMemo(
		() => ({ height: `${collectionHeight}px` }),
		[collectionHeight]
	);

	const getFieldIcon = (type: string) => {
		switch (type) {
			case 'string':
			case 'varchar':
			case 'text':
				return <Type className="w-3 h-3" />;
			case 'number':
			case 'integer':
			case 'bigint':
			case 'float':
			case 'numeric':
			case 'serial':
			case 'decimal128':
				return <Hash className="w-3 h-3" />;
			case 'boolean':
				return <ToggleLeft className="w-3 h-3" />;
			case 'date':
			case 'timestamp':
				return <Calendar className="w-3 h-3" />;
			case 'array':
				return <List className="w-3 h-3" />;
			case 'object':
			case 'json':
			case 'jsonb':
			case 'map':
				return <Braces className="w-3 h-3" />;
			case 'objectId':
			case 'uuid':
				return <Key className="w-3 h-3" />;
			case 'buffer':
			case 'bytea':
				return <ExternalLink className="w-3 h-3" />;
			default:
				return <Type className="w-3 h-3" />;
		}
	};

	const handleFieldContextMenu = (
		event: React.MouseEvent,
		fieldIndex: number,
		fieldName: string
	) => {
		event.preventDefault();
		event.stopPropagation();
		if (data.onFieldContextMenu) {
			data.onFieldContextMenu(event, data.id, fieldIndex, fieldName);
		}
	};

	const handleClick = () => {
		if (data.onCloseMenus) {
			data.onCloseMenus();
		}
	};

	const handleMouseDown = (event: React.MouseEvent) => {
		if (data.onCloseMenus) {
			data.onCloseMenus();
		}
	};

	const handleRemoveConnection = (
		event: React.MouseEvent,
		connectionId: string
	) => {
		event.preventDefault();
		event.stopPropagation();
		removeConnection(connectionId);
		toast.success('Connection removed');
	};

	return (
		<div
			className={`rounded-lg border min-w-60 max-w-72 cursor-pointer relative group ${
				isDark
					? 'border-[#262626] hover:border-[#404040] text-white'
					: 'border-[#e5e5e5] hover:border-[#bbb] text-black'
			}`}
			style={{
				...dynamicStyles,
				opacity: 1,
				transition: 'none',
				backgroundColor: isDark ? '#111111' : '#ffffff',
				color: isDark ? '#fafafa' : '#0a0a0a',
				boxShadow: isDark
					? '0 1px 8px rgba(0,0,0,0.3)'
					: '0 1px 8px rgba(0,0,0,0.06)',
			}}
			onClick={handleClick}
			onMouseDown={handleMouseDown}
			suppressHydrationWarning
		>
			{/* Header */}
			<div
				className={`px-3 py-2.5 border-b ${
					isDark ? 'border-[#262626]' : 'border-[#e5e5e5]'
				}`}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{data.accentColor && data.accentColor !== 'transparent' && (
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: data.accentColor }}
							/>
						)}
						<span className="font-semibold text-sm tracking-tight">
							{data.name}
						</span>
					</div>
					<span
						className={`text-[10px] font-mono ${
							isDark ? 'text-[#525252]' : 'text-[#a3a3a3]'
						}`}
					>
						{data.fields.length}
					</span>
				</div>
			</div>

			{/* Fields */}
			<div
				className={`px-2 py-2 ${
					showScrolling
						? 'overflow-y-auto'
						: 'overflow-hidden'
				}`}
				style={{
					height: showScrolling
						? `${collectionHeight - 52}px`
						: 'auto',
				}}
			>
				{data.fields.length > 0 ? (
					<div className="space-y-1">
						{data.fields.map((field: any, index: number) => {
							const isTimestampField =
								field.name === 'createdAt' ||
								field.name === 'updatedAt';
							const isIdField = field.name === idFieldName;
							const isLockedField = isTimestampField || isIdField;

							const targetUpField =
								index > 0 ? data.fields[index - 1] : null;
							const targetDownField =
								index < data.fields.length - 1
									? data.fields[index + 1]
									: null;

							const targetUpIsLocked =
								targetUpField &&
								(targetUpField.name === idFieldName ||
									targetUpField.name === 'createdAt' ||
									targetUpField.name === 'updatedAt');

							const targetDownIsLocked =
								targetDownField &&
								(targetDownField.name === idFieldName ||
									targetDownField.name === 'createdAt' ||
									targetDownField.name === 'updatedAt');

							const canMoveUp =
								index > 0 &&
								!isLockedField &&
								!targetUpIsLocked;
							const canMoveDown =
								index < data.fields.length - 1 &&
								!isLockedField &&
								!targetDownIsLocked;

							return (
								<FieldItem
									key={`${data.id}-field-${index}`}
									field={field}
									index={index}
									isDark={isDark}
									data={data}
									getFieldIcon={getFieldIcon}
									getFieldConnections={getFieldConnections}
									handleClick={handleClick}
									handleMouseDown={handleMouseDown}
									handleFieldContextMenu={
										handleFieldContextMenu
									}
									handleRemoveConnection={
										handleRemoveConnection
									}
									isTimestampField={isTimestampField}
									isIdField={isIdField}
									canMoveUp={canMoveUp}
									canMoveDown={canMoveDown}
									onMoveUp={() => {
										if (canMoveUp)
											reorderFields(
												data.id,
												index,
												index - 1
											);
									}}
									onMoveDown={() => {
										if (canMoveDown)
											reorderFields(
												data.id,
												index,
												index + 1
											);
									}}
								/>
							);
						})}
					</div>
				) : (
					<div
						className={`text-center py-4 ${
							isDark ? 'text-[#3a3a3a]' : 'text-[#c4c4c4]'
						}`}
					>
						<Plus className="w-4 h-4 mx-auto mb-1" />
						<p className="text-[11px]">Right-click to add fields</p>
					</div>
				)}
			</div>
		</div>
	);
}
