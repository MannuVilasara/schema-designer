'use client';

import { useEffect, useRef } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Trash2, Edit3, Plus } from 'lucide-react';
import type { FieldContextMenuProps } from '@/types';

export default function FieldContextMenu({
	x,
	y,
	collectionId,
	fieldIndex,
	fieldName,
	onClose,
	onEditField,
	onDeleteField,
	onAddField,
}: FieldContextMenuProps) {
	const { isDark } = useThemeContext();
	const menuRef = useRef<HTMLDivElement>(null);

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

	return (
		<div
			ref={menuRef}
			className={`fixed z-50 min-w-[140px] rounded-lg border py-1 ${
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
			<div
				className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider border-b ${
					isDark
						? 'border-[#262626] text-[#525252]'
						: 'border-[#f0f0f0] text-[#a3a3a3]'
				}`}
			>
				{fieldName}
			</div>

			<div className="py-0.5">
				<button
					className={itemClass}
					onClick={() =>
						handleAction(() => onAddField(collectionId, { x, y }))
					}
				>
					<Plus className="w-3.5 h-3.5" />
					Add Field
				</button>

				<button
					className={itemClass}
					onClick={() =>
						handleAction(() =>
							onEditField(collectionId, fieldIndex, { x, y })
						)
					}
				>
					<Edit3 className="w-3.5 h-3.5" />
					Edit Field
				</button>

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
							onDeleteField(collectionId, fieldIndex, { x, y })
						)
					}
				>
					<Trash2 className="w-3.5 h-3.5" />
					Delete Field
				</button>
			</div>
		</div>
	);
}
