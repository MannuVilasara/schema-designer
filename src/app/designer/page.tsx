'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Navbar } from '@/components';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getEntityLabel } from '@/types';
import toast from 'react-hot-toast';
import Canvas from '@/components/canvas/Canvas';
import { Trash2, Download, Upload, Plus, Wand2, Undo2, Redo2, Share2, Database } from 'lucide-react';
import LZString from 'lz-string';

export default function HomePage() {
	const collections = useSchemaStore((state) => state.collections);
	const exportSchema = useSchemaStore((state) => state.exportSchema);
	const importSchema = useSchemaStore((state) => state.importSchema);
	const clearCanvas = useSchemaStore((state) => state.clearCanvas);
	const autoLayout = useSchemaStore((state) => state.autoLayout);
	const dbType = useSchemaStore((state) => state.dbType);
	const setDbType = useSchemaStore((state) => state.setDbType);

	const { isDark } = useThemeContext();
	const [scrollY, setScrollY] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const hash = window.location.hash;
		if (hash.startsWith('#schema=')) {
			try {
				const compressed = hash.replace('#schema=', '');
				const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
				if (decompressed) {
					importSchema(decompressed);
					toast.success('Schema loaded from URL');
					// Clear the hash to avoid reloading on refresh
					window.history.replaceState(null, '', window.location.pathname);
				}
			} catch (error) {
				console.error('Failed to load schema from URL:', error);
				toast.error('Failed to load shared schema');
			}
		}
	}, [importSchema]);

	const handleClearCanvas = () => {
		if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
			clearCanvas();
			toast.success('Canvas cleared');
		}
	};

	const handleExport = () => {
		try {
			const schemaData = exportSchema();
			const blob = new Blob([schemaData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `schema-${dbType}-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success('Schema exported');
		} catch (error) {
			console.error('Failed to export schema:', error);
			toast.error('Failed to export schema');
		}
	};

	const handleShare = () => {
		try {
			const schemaData = exportSchema();
			const compressed = LZString.compressToEncodedURIComponent(schemaData);
			window.location.hash = `schema=${compressed}`;
			navigator.clipboard.writeText(window.location.href);
			toast.success('Share link copied to clipboard!');
		} catch (error) {
			console.error('Failed to generate share link:', error);
			toast.error('Failed to generate share link');
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
			} catch (error) {
				console.error('Failed to import schema:', error);
				toast.error('Failed to import schema. Check file format.');
			}
		};
		reader.readAsText(file);
		event.target.value = '';
	};

	const entityLabel = getEntityLabel(dbType);

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${
				isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'
			}`}
			suppressHydrationWarning
		>
			<Navbar scrollY={scrollY} />

			<div className="h-screen w-full flex pt-14 relative">
				<div className="flex-1 relative overflow-hidden">
					{/* Canvas Header Controls */}
					<div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 p-1.5 rounded-lg border shadow-sm backdrop-blur-md bg-background/80">
						<button
							onClick={handleClearCanvas}
							title="Clear Canvas"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Trash2 className="w-4 h-4" />
						</button>
						<div className="w-px h-4 bg-border" />
						<button
							onClick={handleImport}
							title="Import Schema"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
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
						<button
							onClick={handleExport}
							title="Export Schema"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Download className="w-4 h-4" />
						</button>
						<button
							onClick={handleShare}
							title="Share Schema via URL"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Share2 className="w-4 h-4" />
						</button>
						<div className="w-px h-4 bg-border" />
						<button
							onClick={() => useSchemaStore.temporal.getState().undo()}
							title="Undo (Ctrl+Z)"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Undo2 className="w-4 h-4" />
						</button>
						<button
							onClick={() => useSchemaStore.temporal.getState().redo()}
							title="Redo (Ctrl+Y)"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Redo2 className="w-4 h-4" />
						</button>
						<div className="w-px h-4 bg-border" />
						<button
							onClick={() => {
								const newType = dbType === 'mongodb' ? 'postgresql' : 'mongodb';
								setDbType(newType);
								toast.success(`Switched to ${newType === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}`);
							}}
							title={`Switch to ${dbType === 'mongodb' ? 'PostgreSQL' : 'MongoDB'}`}
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors font-medium text-xs flex items-center gap-1.5`}
						>
							<Database className="w-4 h-4" />
							{dbType === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}
						</button>
						<div className="w-px h-4 bg-border" />
						<button
							onClick={() => {
								autoLayout();
								toast.success('Layout Organized');
							}}
							title="Tidy Up"
							className={`p-2 rounded hover:bg-muted text-muted-foreground transition-colors`}
						>
							<Wand2 className="w-4 h-4" />
						</button>
					</div>

					{/* Main Canvas */}
					<Canvas />

					{/* Empty State Overlay (only shows if 0 collections) */}
					{collections.length === 0 && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="text-center">
								<h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-[#ededed]' : 'text-[#171717]'}`}>
									Empty Canvas
								</h3>
								<p className={`text-sm ${isDark ? 'text-[#737373]' : 'text-[#a3a3a3]'}`}>
									Right-click anywhere to add a {entityLabel.toLowerCase()}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
