'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Trash2, Copy, Plus, Edit3, Code2 } from 'lucide-react';
import type { ContextMenuProps } from '@/types';

export default function ContextMenu({
	x,
	y,
	collectionId,
	collectionName,
	onClose,
	onDelete,
	onDuplicate,
	onAddField,
	onEditCollection,
	onCreateCollection,
	onGenerateCode,
}: ContextMenuProps) {
	const { isDark } = useThemeContext();
	const menuRef = useRef<HTMLDivElement>(null);

	const isEmptyArea = !collectionId;

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [onClose]);

	const handleAction = (action: () => void) => {
		action();
		onClose();
	};

	return (
		<div
			ref={menuRef}
			className={`fixed z-50 min-w-32 rounded-lg shadow-lg border py-1 ${
				isDark
					? 'bg-gray-800 border-gray-600 text-white'
					: 'bg-white border-gray-200 text-gray-900'
			}`}
			style={{
				left: x,
				top: y,
			}}
		>
			{!isEmptyArea && (
				<div
					className={`px-3 py-1 text-sm font-medium border-b ${
						isDark
							? 'border-gray-600 text-gray-300'
							: 'border-gray-200 text-gray-600'
					}`}
				>
					{collectionName}
				</div>
			)}

			<div className="py-1">
				{isEmptyArea ? (
					<Button
						variant="ghost"
						size="sm"
						className={`w-full justify-start px-3 py-2 text-sm ${
							isDark
								? 'hover:bg-gray-700 text-white'
								: 'hover:bg-gray-100 text-gray-900'
						}`}
						onClick={() =>
							handleAction(() => onCreateCollection?.({ x, y }))
						}
					>
						<Plus className="w-4 h-4 mr-2" />
						New Collection
					</Button>
				) : (
					<>
						<Button
							variant="ghost"
							size="sm"
							className={`w-full justify-start px-2 py-1.5 text-sm ${
								isDark
									? 'hover:bg-gray-700 text-white'
									: 'hover:bg-gray-100 text-gray-900'
							}`}
							onClick={() =>
								handleAction(() =>
									onAddField(collectionId, { x, y })
								)
							}
						>
							<Plus className="w-3 h-3 mr-2" />
							Add Field
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={`w-full justify-start px-2 py-1.5 text-sm ${
								isDark
									? 'hover:bg-gray-700 text-white'
									: 'hover:bg-gray-100 text-gray-900'
							}`}
							onClick={() =>
								handleAction(() =>
									onEditCollection?.(collectionId, { x, y })
								)
							}
						>
							<Edit3 className="w-3 h-3 mr-2" />
							Edit Collection
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={`w-full justify-start px-2 py-1.5 text-sm ${
								isDark
									? 'hover:bg-gray-700 text-white'
									: 'hover:bg-gray-100 text-gray-900'
							}`}
							onClick={() =>
								handleAction(() =>
									onGenerateCode?.(collectionId)
								)
							}
						>
							<Code2 className="w-3 h-3 mr-2" />
							Generate Code
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={`w-full justify-start px-2 py-1.5 text-sm ${
								isDark
									? 'hover:bg-gray-700 text-white'
									: 'hover:bg-gray-100 text-gray-900'
							}`}
							onClick={() =>
								handleAction(() => onDuplicate(collectionId))
							}
						>
							<Copy className="w-3 h-3 mr-2" />
							Duplicate
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={`w-full justify-start px-2 py-1.5 text-sm text-red-500 hover:text-red-600 ${
								isDark
									? 'hover:bg-red-900/20'
									: 'hover:bg-red-50'
							}`}
							onClick={() =>
								handleAction(() =>
									onDelete(collectionId, { x, y })
								)
							}
						>
							<Trash2 className="w-3 h-3 mr-2" />
							Delete
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
