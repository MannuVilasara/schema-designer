'use client';

import { useEffect, useRef } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import { Trash2, Copy, Plus, Edit3, StickyNote } from 'lucide-react';
import type { ContextMenuProps } from '@/types';
import { getEntityLabel } from '@/types';

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
	onAddNote,
}: ContextMenuProps) {
	const { isDark } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const updateCollectionAccentColor = useSchemaStore((s) => s.updateCollectionAccentColor);
	const menuRef = useRef<HTMLDivElement>(null);
	const entityLabel = getEntityLabel(dbType);
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
			if (event.key === 'Escape') onClose();
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

	const itemClass = `w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
		isDark
			? 'text-[#d4d4d4] hover:bg-[#1a1a1a]'
			: 'text-[#404040] hover:bg-[#f5f5f5]'
	}`;

	const ACCENT_COLORS = [
		{ id: 'none', value: 'transparent' },
		{ id: 'blue', value: '#3b82f6' },
		{ id: 'emerald', value: '#10b981' },
		{ id: 'amber', value: '#f59e0b' },
		{ id: 'red', value: '#ef4444' },
		{ id: 'purple', value: '#8b5cf6' },
	];

	return (
		<div
			ref={menuRef}
			className={`fixed z-50 min-w-[160px] rounded-lg border py-1 ${
				isDark
					? 'bg-[#111] border-[#262626]'
					: 'bg-white border-[#e5e5e5]'
			}`}
			style={{
				left: x,
				top: y,
				boxShadow: isDark
					? '0 4px 24px rgba(0,0,0,0.4)'
					: '0 4px 24px rgba(0,0,0,0.08)',
			}}
		>
			{!isEmptyArea && (
				<div
					className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider border-b ${
						isDark
							? 'border-[#262626] text-[#525252]'
							: 'border-[#f0f0f0] text-[#a3a3a3]'
					}`}
				>
					{collectionName}
				</div>
			)}

			<div className="py-0.5">
				{isEmptyArea ? (
					<>
						<button
							className={itemClass}
							onClick={() =>
								handleAction(() => onCreateCollection?.({ x, y }))
							}
						>
							<Plus className="w-3.5 h-3.5" />
							New {entityLabel}
						</button>
						<button
							className={itemClass}
							onClick={() =>
								handleAction(() => onAddNote?.({ x, y }))
							}
						>
							<StickyNote className="w-3.5 h-3.5" />
							Add Note
						</button>
					</>
				) : (
					<>
						<button
							className={itemClass}
							onClick={() =>
								handleAction(() =>
									onAddField(collectionId, { x, y })
								)
							}
						>
							<Plus className="w-3.5 h-3.5" />
							Add Field
						</button>

						<button
							className={itemClass}
							onClick={() =>
								handleAction(() =>
									onEditCollection?.(collectionId, { x, y })
								)
							}
						>
							<Edit3 className="w-3.5 h-3.5" />
							Edit {entityLabel}
						</button>

						<button
							className={itemClass}
							onClick={() =>
								handleAction(() => onDuplicate(collectionId))
							}
						>
							<Copy className="w-3.5 h-3.5" />
							Duplicate
						</button>

						<div
							className={`my-0.5 h-px ${isDark ? 'bg-[#262626]' : 'bg-[#f0f0f0]'}`}
						/>

						<div className="px-3 py-1.5 flex gap-1.5 items-center justify-between">
							{ACCENT_COLORS.map((color) => (
								<button
									key={color.id}
									onClick={() => handleAction(() => updateCollectionAccentColor(collectionId, color.value))}
									className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 transition-transform hover:scale-110"
									style={{ backgroundColor: color.value === 'transparent' ? (isDark ? '#262626' : '#e5e5e5') : color.value }}
									title={color.id}
								/>
							))}
						</div>

						<div
							className={`my-0.5 h-px ${isDark ? 'bg-[#262626]' : 'bg-[#f0f0f0]'}`}
						/>

						<button
							className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs transition-colors text-[#dc2626] ${
								isDark
									? 'hover:bg-[#1a1a1a]'
									: 'hover:bg-[#fef2f2]'
							}`}
							onClick={() =>
								handleAction(() =>
									onDelete(collectionId, { x, y })
								)
							}
						>
							<Trash2 className="w-3.5 h-3.5" />
							Delete
						</button>
					</>
				)}
			</div>
		</div>
	);
}
