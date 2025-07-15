'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

import { Dock, Navbar } from '@/components';
import { useSchemaStore } from '@/store/schemaStore';
import { useThemeContext } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';
import Canvas from '@/components/canvas/Canvas';

export default function HomePage() {
	const collections = useSchemaStore((state) => state.collections);
	const connections = useSchemaStore((state) => state.connections);
	const exportSchema = useSchemaStore((state) => state.exportSchema);
	const importSchema = useSchemaStore((state) => state.importSchema);
	const clearCanvas = useSchemaStore((state) => state.clearCanvas);

	const { isDark } = useThemeContext();
	const [scrollY, setScrollY] = useState(0);
	const [createCollectionModal, setCreateCollectionModal] = useState<{
		isOpen: boolean;
		position?: { x: number; y: number };
	}>({
		isOpen: false,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);
	// Only run on client side after hydration
	useEffect(() => {}, []);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);
	const handleCreateCollection = useCallback(
		(position?: { x: number; y: number }) => {
			setCreateCollectionModal({ isOpen: true, position });
		},
		[]
	);
	const handleClearCanvas = () => {
		toast.custom(
			(t) => (
				<div
					style={{
						padding: '1rem 1.25rem',
						minWidth: 280,
						background: 'var(--toast-bg, #18181b)',
						color: 'var(--toast-fg, #fff)',
						borderRadius: 12,
						boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
						border: '1px solid #333',
						fontSize: '1rem',
						fontWeight: 500,
						display: 'flex',
						flexDirection: 'column',
						gap: '0.75rem',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<span style={{ fontSize: 22, marginRight: 6 }}>⚠️</span>
						<span>Clear Canvas?</span>
					</div>
					<div
						style={{
							fontSize: '0.95rem',
							color: '#cbd5e1',
							marginBottom: 2,
						}}
					>
						This will remove all collections and fields.
						<br />
						<span style={{ color: '#ef4444', fontWeight: 600 }}>
							This action cannot be undone.
						</span>
					</div>
					<div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
						<button
							style={{
								background:
									'linear-gradient(90deg,#ef4444 60%,#dc2626 100%)',
								color: '#fff',
								border: 'none',
								borderRadius: 8,
								padding: '0.5rem 1.1rem',
								fontWeight: 600,
								fontSize: '0.98rem',
								cursor: 'pointer',
								boxShadow: '0 2px 8px rgba(239,68,68,0.12)',
								transition: 'background 0.2s',
							}}
							onClick={() => {
								clearCanvas();
								toast.dismiss(t.id);
								toast.success('Canvas cleared successfully!');
							}}
						>
							Yes, clear
						</button>
						<button
							style={{
								background:
									'linear-gradient(90deg,#2563eb 60%,#1d4ed8 100%)',
								color: '#fff',
								border: 'none',
								borderRadius: 8,
								padding: '0.5rem 1.1rem',
								fontWeight: 600,
								fontSize: '0.98rem',
								cursor: 'pointer',
								boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
								transition: 'background 0.2s',
							}}
							onClick={() => toast.dismiss(t.id)}
						>
							Cancel
						</button>
					</div>
				</div>
			),
			{ duration: 7000 }
		);
	};

	const handleExport = () => {
		try {
			const schemaData = exportSchema();
			const blob = new Blob([schemaData], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `mongodb-schema-${
				new Date().toISOString().split('T')[0]
			}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success('Schema exported successfully!');
		} catch (error) {
			console.error('Failed to export schema:', error);
			toast.error('Failed to export schema. Please try again.');
		}
	};

	const handleImport = () => {
		fileInputRef.current?.click();
	};

	const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			toast.error('No file selected for import');
			return;
		}

		// Check file type
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
				toast.success('Schema imported successfully!');
			} catch (error) {
				console.error('Failed to import schema:', error);
				toast.error(
					'Failed to import schema. Please check the file format.'
				);
			}
		};

		reader.onerror = () => {
			toast.error('Failed to read the file');
		};

		reader.readAsText(file);

		// Clear the input value so the same file can be imported again
		event.target.value = '';
	};

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300"
			suppressHydrationWarning
		>
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
							<div
								className={`backdrop-blur-sm rounded-lg px-4 py-2 border shadow-sm ${
									isDark
										? 'bg-gray-900/95 border-gray-700/60 text-white'
										: 'bg-white/95 border-gray-300/60 text-gray-900'
								}`}
							>
								<h1
									className={`text-lg font-semibold ${
										isDark ? 'text-white' : 'text-gray-900'
									}`}
								>
									Schema Designer
								</h1>
								<p
									className={`text-sm ${
										isDark
											? 'text-gray-400'
											: 'text-gray-500'
									}`}
								>
									{collections.length} collection
									{collections.length !== 1 ? 's' : ''}
								</p>
							</div>

							{/* Quick Stats */}
							<div className="hidden md:flex items-center space-x-3">
								<div
									className={`backdrop-blur-sm rounded-lg px-3 py-2 border ${
										isDark
											? 'bg-blue-900/40 border-blue-700/60'
											: 'bg-blue-50/90 border-blue-200/60'
									}`}
								>
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
										<span
											className={`text-sm font-medium ${
												isDark
													? 'text-blue-300'
													: 'text-blue-700'
											}`}
										>
											{connections.length} connection
											{connections.length !== 1
												? 's'
												: ''}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Canvas Controls */}
						<div className="flex items-center space-x-2">
							<button
								onClick={handleClearCanvas}
								className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
									isDark ? 'dark:bg-red-400' : ''
								}`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 4v16m8-8H4"
									></path>
								</svg>
								<span>Clear Canvas</span>
							</button>
							<button
								onClick={handleExport}
								className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
									isDark ? 'dark:bg-green-400' : ''
								}`}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8v4m0 0v4m0-4h4m-4 0H8m8 8H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2z"
									></path>
								</svg>
								<span>Export Schema</span>
							</button>

							<button
								onClick={handleImport}
								className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
									isDark ? 'dark:bg-blue-400' : ''
								}`}
							>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileImport}
									className="hidden"
									accept=".json"
								/>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8v4m0 0v4m0-4h4m-4 0H8m8 8H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2z"
									></path>
								</svg>
								<span>Import Schema</span>
							</button>
							<button
								onClick={() => handleCreateCollection()}
								className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 4v16m8-8H4"
									></path>
								</svg>
								<span>Add Collection</span>
							</button>
						</div>
					</div>

					{/* Main Canvas */}
					<Canvas />

					{/* Enhanced Bottom Dock
					<div className="absolute bottom-0 left-0 right-0 z-30">
						<BottomDock />
					</div> */}

					{/* Empty State */}
					{collections.length === 0 && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="text-center max-w-md mx-auto px-6">
								<div className="mb-6">
									<div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
										<svg
											className="w-12 h-12 text-blue-500 dark:text-blue-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="1.5"
												d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
											></path>
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
									Start Building Your Schema
								</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
									Create your first collection to begin
									designing your MongoDB schema. Right-click
									anywhere on the canvas or use the button
									above.
								</p>
								<div className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
										<span>
											Right-click to create collections
										</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
										<span>
											Drag to connect ObjectId fields
										</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
										<span>
											Generate code for your schemas
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
