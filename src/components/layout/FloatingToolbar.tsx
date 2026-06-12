'use client';

import { useRef } from 'react';
import {
	Plus,
	Download,
	Upload,
	Trash2,
	Sun,
	Moon,
	Database,
} from 'lucide-react';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import type { DbType } from '@/types';

interface FloatingToolbarProps {
	onCreateCollection: (position?: { x: number; y: number }) => void;
}

export default function FloatingToolbar({
	onCreateCollection,
}: FloatingToolbarProps) {
	const { isDark, toggleTheme } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const setDbType = useSchemaStore((s) => s.setDbType);
	const exportSchema = useSchemaStore((s) => s.exportSchema);
	const importSchema = useSchemaStore((s) => s.importSchema);
	const clearCanvas = useSchemaStore((s) => s.clearCanvas);
	const collections = useSchemaStore((s) => s.collections);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = () => {
		try {
			const schemaData = exportSchema();
			const blob = new Blob([schemaData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `schema-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success('Schema exported');
		} catch {
			toast.error('Export failed');
		}
	};

	const handleImport = () => {
		fileInputRef.current?.click();
	};

	const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith('.json')) {
			toast.error('Please select a JSON file');
			event.target.value = '';
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				importSchema(content);
				toast.success('Schema imported');
			} catch {
				toast.error('Invalid schema file');
			}
		};
		reader.readAsText(file);
		event.target.value = '';
	};

	const handleClear = () => {
		if (collections.length === 0) return;
		toast.custom(
			(t) => (
				<div
					className={`rounded-lg border p-4 min-w-[260px] ${
						isDark
							? 'bg-[#141414] border-[#262626] text-white'
							: 'bg-white border-[#e5e5e5] text-black'
					}`}
					style={{
						boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
					}}
				>
					<p className="text-sm font-medium mb-1">Clear canvas?</p>
					<p
						className={`text-xs mb-3 ${isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'}`}
					>
						This will remove all {dbType === 'postgresql' ? 'tables' : 'collections'} and cannot be undone.
					</p>
					<div className="flex gap-2">
						<button
							onClick={() => {
								clearCanvas();
								toast.dismiss(t.id);
								toast.success('Canvas cleared');
							}}
							className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors"
						>
							Clear
						</button>
						<button
							onClick={() => toast.dismiss(t.id)}
							className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
								isDark
									? 'bg-[#262626] text-white hover:bg-[#333]'
									: 'bg-[#f5f5f5] text-black hover:bg-[#e5e5e5]'
							}`}
						>
							Cancel
						</button>
					</div>
				</div>
			),
			{ duration: 8000 }
		);
	};

	const handleDbToggle = () => {
		const newType: DbType =
			dbType === 'mongodb' ? 'postgresql' : 'mongodb';
		setDbType(newType);
		toast.success(
			`Switched to ${newType === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}`
		);
	};

	const btnBase = `p-2.5 rounded-lg transition-colors ${
		isDark
			? 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]'
			: 'text-[#737373] hover:text-black hover:bg-[#f0f0f0]'
	}`;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
			<div
				className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border backdrop-blur-xl ${
					isDark
						? 'bg-[#0a0a0a]/90 border-[#262626] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
						: 'bg-white/90 border-[#e5e5e5] shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
				}`}
			>
				{/* DB Type Toggle */}
				<button
					onClick={handleDbToggle}
					className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
						isDark
							? 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]'
							: 'text-[#737373] hover:text-black hover:bg-[#f0f0f0]'
					}`}
					title={`Switch to ${dbType === 'mongodb' ? 'PostgreSQL' : 'MongoDB'}`}
				>
					<Database className="w-3.5 h-3.5" />
					<span className="tracking-tight">
						{dbType === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}
					</span>
				</button>

				{/* Divider */}
				<div
					className={`w-px h-6 ${isDark ? 'bg-[#262626]' : 'bg-[#e5e5e5]'}`}
				/>

				{/* Add */}
				<button
					onClick={() => onCreateCollection()}
					className={btnBase}
					title={`Add ${dbType === 'postgresql' ? 'table' : 'collection'}`}
				>
					<Plus className="w-4 h-4" />
				</button>

				{/* Export */}
				<button
					onClick={handleExport}
					className={btnBase}
					title="Export schema"
				>
					<Download className="w-4 h-4" />
				</button>

				{/* Import */}
				<button
					onClick={handleImport}
					className={btnBase}
					title="Import schema"
				>
					<Upload className="w-4 h-4" />
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileImport}
						className="hidden"
						accept=".json"
					/>
				</button>

				{/* Clear */}
				<button
					onClick={handleClear}
					className={btnBase}
					title="Clear canvas"
				>
					<Trash2 className="w-4 h-4" />
				</button>

				{/* Divider */}
				<div
					className={`w-px h-6 ${isDark ? 'bg-[#262626]' : 'bg-[#e5e5e5]'}`}
				/>

				{/* Theme */}
				<button
					onClick={toggleTheme}
					className={btnBase}
					title={isDark ? 'Light mode' : 'Dark mode'}
				>
					{isDark ? (
						<Sun className="w-4 h-4" />
					) : (
						<Moon className="w-4 h-4" />
					)}
				</button>
			</div>
		</div>
	);
}
