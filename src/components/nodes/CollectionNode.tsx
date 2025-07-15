'use client';

import { useMemo, useState, useEffect } from 'react';
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
	Database,
	Link,
	X,
	ChevronUp,
	ChevronDown,
	Sparkles,
	Key,
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
	canMoveUp: boolean;
	canMoveDown: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

// Field Item Component
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
	canMoveUp,
	canMoveDown,
	onMoveUp,
	onMoveDown,
}: FieldItemProps) {
	const isIdField = field.name === '_id';
	const isObjectIdField = field.type === 'objectId';
	const fieldConnections = getFieldConnections(data.name, field.name);
	const hasConnections = fieldConnections.length > 0;
	const canAcceptMoreConnections = isIdField || fieldConnections.length === 0;

	return (
		<div
			className={`relative flex items-center justify-between py-2 px-2 rounded-md text-xs ${
				isTimestampField
					? 'cursor-default opacity-75'
					: 'cursor-pointer'
			} ${
				isIdField
					? isDark
						? 'bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50'
						: 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
					: isTimestampField
						? isDark
							? 'bg-amber-900/30 border border-amber-700/50'
							: 'bg-amber-50 border border-amber-200'
													: isDark
								? 'bg-gray-700/50 hover:bg-gray-700'
								: 'bg-gray-50 hover:bg-gray-100'
			}`}
			onClick={handleClick}
			onMouseDown={handleMouseDown}
			onContextMenu={(e) => handleFieldContextMenu(e, index, field.name)}
		>
			{/* Arrow controls for non-timestamp, non-ID fields */}
			{!isTimestampField && !isIdField && (
				<div className="flex items-center mr-1">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onMoveUp();
						}}
						disabled={!canMoveUp}
						className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
							!canMoveUp
								? 'opacity-30 cursor-not-allowed'
								: 'opacity-40 hover:opacity-80'
						}`}
					>
						<ChevronUp className="w-2 h-2" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onMoveDown();
						}}
						disabled={!canMoveDown}
						className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
							!canMoveDown
								? 'opacity-30 cursor-not-allowed'
								: 'opacity-40 hover:opacity-80'
						}`}
					>
						<ChevronDown className="w-2 h-2" />
					</button>
				</div>
			)}

			{/* Left connection handle for objectId fields */}
			{isObjectIdField && (
				<Handle
					type="target"
					position={Position.Left}
					id={`${data.id}-field-${index}-target`}
					className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white ${
						canAcceptMoreConnections
							? hasConnections
								? 'bg-green-500 hover:bg-green-600'
								: 'bg-blue-500 hover:bg-blue-600'
							: 'bg-gray-400 cursor-not-allowed'
					}`}
					style={{
						left: '-6px',
						zIndex: 10,
					}}
					isConnectable={canAcceptMoreConnections}
				/>
			)}

			{/* Right connection handle for objectId fields */}
			{isObjectIdField && (
				<Handle
					type="source"
					position={Position.Right}
					id={`${data.id}-field-${index}-source`}
					className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white ${
						canAcceptMoreConnections
							? hasConnections
								? 'bg-green-500 hover:bg-green-600'
								: 'bg-blue-500 hover:bg-blue-600'
							: 'bg-gray-400 cursor-not-allowed'
					}`}
					style={{
						right: '-6px',
						zIndex: 10,
					}}
					isConnectable={canAcceptMoreConnections}
				/>
			)}

			<div className="flex items-center gap-2 flex-1 min-w-0">
				<div
					className={`flex items-center justify-center w-5 h-5 rounded ${
						isIdField
							? isDark
								? 'bg-blue-600 text-blue-100'
								: 'bg-blue-500 text-white'
							: isTimestampField
								? isDark
									? 'bg-amber-600 text-amber-100'
									: 'bg-amber-500 text-white'
								: isDark
									? 'bg-gray-600 text-gray-300'
									: 'bg-gray-200 text-gray-600'
					}`}
				>
					{getFieldIcon(field.type)}
				</div>
				<span
					className={`truncate ${
						isIdField || isTimestampField
							? 'font-bold'
							: 'font-medium'
					}`}
				>
					{field.name}
				</span>
				{field.required && (
					<span className="text-red-500 text-xs">*</span>
				)}
				{isTimestampField && (
					<span className="text-amber-500 text-xs">(auto)</span>
				)}
				{/* Connection indicator */}
				{hasConnections && (
					<div className="flex items-center gap-1">
						<Link className="w-3 h-3 text-green-500" />
						<span className="text-green-500 text-xs">
							{fieldConnections.length}
						</span>
						{/* Show remove buttons for each connection - only for non-_id fields */}
						{!isIdField &&
							fieldConnections.map((connection: any) => (
								<button
									key={connection.id}
									onClick={(e) =>
										handleRemoveConnection(e, connection.id)
									}
									className="ml-1 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white"
									title="Remove connection"
								>
									<X className="w-2.5 h-2.5" />
								</button>
							))}
					</div>
				)}
			</div>
			<span
				className={`text-xs px-1.5 py-0.5 rounded font-mono ${
					isIdField
						? isDark
							? 'bg-blue-500/30 text-blue-200'
							: 'bg-blue-200 text-blue-800'
						: isTimestampField
							? isDark
								? 'bg-amber-500/30 text-amber-200'
								: 'bg-amber-200 text-amber-800'
							: isDark
								? 'bg-blue-500/20 text-blue-300'
								: 'bg-blue-100 text-blue-700'
				}`}
			>
				{field.type}
			</span>
		</div>
	);
}

export default function CollectionNode({ data }: CollectionNodeProps) {
	const { isDark } = useThemeContext();
	const connections = useSchemaStore((state) => state.connections);
	const getFieldConnections = useSchemaStore(
		(state) => state.getFieldConnections
	);
	const removeConnection = useSchemaStore((state) => state.removeConnection);
	const reorderFields = useSchemaStore((state) => state.reorderFields);

	// isDark is now provided by ThemeContext

	// Calculate dynamic height based on field count
	const getCollectionHeight = () => {
		const headerHeight = 88; // Enhanced header section height (was 80)
		const fieldHeight = 36; // Each field row height (more precise measurement)
		const containerPadding = 24; // Enhanced container padding (px-3 py-3 = 12px + 12px)
		const spaceBetweenFields = 6; // space-y-1.5 = 6px
		const minFieldsHeight = 70; // Minimum height for enhanced "No fields yet" state

		if (data.fields.length === 0) {
			return headerHeight + minFieldsHeight;
		}

		// Calculate total fields height including spaces between them
		const totalFieldsHeight = data.fields.length * fieldHeight;
		const totalSpacingHeight = Math.max(
			0,
			(data.fields.length - 1) * spaceBetweenFields
		);
		const fieldsHeight =
			totalFieldsHeight + totalSpacingHeight + containerPadding;
		const totalHeight = headerHeight + fieldsHeight;

		// Set reasonable limits: min 140px, max 500px
		return Math.min(Math.max(totalHeight, 140), 500);
	};

	// Determine if we need scrolling (when hitting max height)
	const needsScrolling = () => {
		const headerHeight = 88; // Enhanced header height
		const fieldHeight = 36;
		const containerPadding = 24; // Enhanced container padding
		const spaceBetweenFields = 6;
		const maxHeight = 500;

		const totalFieldsHeight = data.fields.length * fieldHeight;
		const totalSpacingHeight = Math.max(
			0,
			(data.fields.length - 1) * spaceBetweenFields
		);
		const fieldsHeight =
			totalFieldsHeight + totalSpacingHeight + containerPadding;

		return headerHeight + fieldsHeight > maxHeight;
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
				return <Type className="w-3 h-3" />;
			case 'number':
				return <Hash className="w-3 h-3" />;
			case 'boolean':
				return <ToggleLeft className="w-3 h-3" />;
			case 'date':
				return <Calendar className="w-3 h-3" />;
			case 'array':
				return <List className="w-3 h-3" />;
			case 'object':
				return <Braces className="w-3 h-3" />;
			case 'objectId':
				return <ExternalLink className="w-3 h-3" />;
			default:
				return <Type className="w-3 h-3" />;
		}
	};

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (data.onContextMenu) {
			data.onContextMenu(event, data.id, data.name);
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
		toast.success('Connection removed successfully');
	};

	return (
		<div
			className={`rounded-xl shadow-xl border min-w-64 max-w-80 cursor-pointer relative group ${
				isDark
					? 'border-gray-700 hover:border-blue-400 text-white shadow-gray-900/50 bg-gray-800'
					: 'border-gray-300 hover:border-blue-500 text-gray-800 shadow-gray-500/30 bg-white'
			}`}
			style={{
				...dynamicStyles,
				willChange: 'transform',
				backfaceVisibility: 'hidden',
				transform: 'translateZ(0)',
			}}
			onContextMenu={handleContextMenu}
			onClick={handleClick}
			onMouseDown={handleMouseDown}
			suppressHydrationWarning
		>
			{/* Enhanced Collection Header */}
			<div
				className={`px-4 py-4 border-b relative overflow-hidden ${
					isDark ? 'border-gray-700' : 'border-gray-300'
				}`}
			>
				{/* Header Background Gradient */}
				<div className={`absolute inset-0 ${
					isDark 
						? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-50' 
						: 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-70'
				} group-hover:opacity-80`}
				></div>
				
				<div className="relative z-10">
					<div className="flex items-center justify-center gap-2 mb-2">
						<div className={`p-1.5 rounded-lg ${
							isDark 
								? 'bg-blue-500/20 text-blue-400' 
								: 'bg-blue-100 text-blue-600'
						}`}>
							<Database className="w-4 h-4" />
						</div>
						<span className="font-bold text-lg tracking-wide">{data.name}</span>
					</div>
					<div className="flex items-center justify-center gap-2">
						<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
							isDark 
								? 'bg-gray-700 text-gray-300' 
								: 'bg-gray-100 text-gray-600'
						}`}>
							<span>{data.fields.length}</span>
							<span>field{data.fields.length !== 1 ? 's' : ''}</span>
						</div>
						{data.fields.some(f => f.type === 'objectId') && (
							<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
								isDark 
									? 'bg-purple-500/20 text-purple-400' 
									: 'bg-purple-100 text-purple-600'
							}`}>
								<Link className="w-3 h-3" />
								<span>refs</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Enhanced Fields List */}
			<div
				className={`px-3 py-3 ${
					showScrolling
						? 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500'
						: 'overflow-hidden'
				}`}
				style={{
					height: showScrolling
						? `${collectionHeight - 88}px` // Adjusted for new header height
						: 'auto',
				}}
			>
				{data.fields.length > 0 ? (
					<div className="space-y-1.5">
						{data.fields.map((field: any, index: number) => {
							const isTimestampField =
								field.name === 'createdAt' ||
								field.name === 'updatedAt';
							const isIdField = field.name === '_id';
							const isLockedField = isTimestampField || isIdField;

							// Check if the target position would be a locked field
							const targetUpField =
								index > 0 ? data.fields[index - 1] : null;
							const targetDownField =
								index < data.fields.length - 1
									? data.fields[index + 1]
									: null;

							const targetUpIsLocked =
								targetUpField &&
								(targetUpField.name === '_id' ||
									targetUpField.name === 'createdAt' ||
									targetUpField.name === 'updatedAt');

							const targetDownIsLocked =
								targetDownField &&
								(targetDownField.name === '_id' ||
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

							const handleMoveUp = () => {
								if (canMoveUp) {
									reorderFields(data.id, index, index - 1);
								}
							};

							const handleMoveDown = () => {
								if (canMoveDown) {
									reorderFields(data.id, index, index + 1);
								}
							};

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
									canMoveUp={canMoveUp}
									canMoveDown={canMoveDown}
									onMoveUp={handleMoveUp}
									onMoveDown={handleMoveDown}
								/>
							);
						})}
					</div>
				) : (
					<div className={`text-center py-6 ${
						isDark ? 'text-gray-400' : 'text-gray-500'
					}`}>
						<div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
							isDark 
								? 'bg-gray-700/50 border border-gray-600' 
								: 'bg-gray-100 border border-gray-200'
						}`}>
							<Plus className="w-5 h-5" />
						</div>
						<p className="text-sm font-medium mb-1">No fields yet</p>
						<p className="text-xs opacity-75">Right-click to add fields</p>
					</div>
				)}
			</div>
		</div>
	);
}
