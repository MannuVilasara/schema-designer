import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import { Trash2, Network } from 'lucide-react';
import { useEffect, useRef } from 'react';

type EdgeContextMenuProps = {
	x: number;
	y: number;
	connectionId: string;
	cardinality: '1:1' | '1:n' | 'n:1' | 'n:m';
	onClose: () => void;
};

export default function EdgeContextMenu({
	x,
	y,
	connectionId,
	cardinality,
	onClose,
}: EdgeContextMenuProps) {
	const { isDark } = useThemeContext();
	const menuRef = useRef<HTMLDivElement>(null);
	const removeConnection = useSchemaStore((s) => s.removeConnection);
	const updateConnectionCardinality = useSchemaStore(
		(s) => s.updateConnectionCardinality
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onClose]);

	const handleAction = (action: () => void) => {
		action();
		onClose();
	};

	const itemClass = `w-full px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
		isDark
			? 'hover:bg-[#262626] text-[#ededed]'
			: 'hover:bg-[#f5f5f5] text-[#171717]'
	}`;

	const renderCardinalityOption = (
		value: '1:1' | '1:n' | 'n:1' | 'n:m',
		label: string
	) => (
		<button
			className={itemClass}
			onClick={() => handleAction(() => updateConnectionCardinality(connectionId, value))}
		>
			<Network className="w-3.5 h-3.5 opacity-70" />
			<div className="flex justify-between w-full">
				<span>{label}</span>
				{cardinality === value && <span className="opacity-50">✓</span>}
			</div>
		</button>
	);

	return (
		<div
			ref={menuRef}
			className={`absolute z-50 min-w-[160px] rounded-lg border shadow-lg overflow-hidden ${
				isDark
					? 'bg-[#0a0a0a]/95 border-[#262626] backdrop-blur-md'
					: 'bg-white/95 border-[#e5e5e5] backdrop-blur-md'
			}`}
			style={{ top: y, left: x }}
		>
			<div className="py-1 border-b border-border/50">
				<div className={`px-3 py-1 text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
					Cardinality
				</div>
				{renderCardinalityOption('1:1', 'One-to-One')}
				{renderCardinalityOption('1:n', 'One-to-Many')}
				{renderCardinalityOption('n:1', 'Many-to-One')}
				{renderCardinalityOption('n:m', 'Many-to-Many')}
			</div>
			
			<div className="py-1">
				<button
					className={`${itemClass} text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10`}
					onClick={() => handleAction(() => removeConnection(connectionId))}
				>
					<Trash2 className="w-3.5 h-3.5" />
					Delete Connection
				</button>
			</div>
		</div>
	);
}
