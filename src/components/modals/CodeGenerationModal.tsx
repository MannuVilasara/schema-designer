'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Download, X, Code2, FileCode, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { generateCode, ORM, ORM_LABELS, CODE_GENERATORS } from '@/generators';
import { useSchemaStore } from '@/store/schemaStore';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import { useThemeContext } from '@/contexts/ThemeContext';

interface CodeGenerationModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedCollectionId: string | null;
}

export default function CodeGenerationModal({
	isOpen,
	onClose,
	selectedCollectionId,
}: CodeGenerationModalProps) {
	const [selectedORM, setSelectedORM] = useState<ORM>('mongoose');
	const { collections, connections } = useSchemaStore();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const { isDark } = useThemeContext();

	const selectedCollection = useMemo(() => {
		return collections.find((col) => col.id === selectedCollectionId);
	}, [collections, selectedCollectionId]);

	const generatedCode = useMemo(() => {
		if (!selectedCollection) return '';
		try {
			return generateCode(
				selectedORM,
				selectedCollection,
				collections,
				connections
			);
		} catch (error) {
			return `// Error generating code: ${error}`;
		}
	}, [selectedCollection, selectedORM, collections, connections]);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(generatedCode);
			toast.success('Code copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			toast.error('Failed to copy code');
		}
	};

	const downloadFile = () => {
		if (!selectedCollection) return;

		const generator = CODE_GENERATORS[selectedORM];
		const filename = `${selectedCollection.name}${generator.fileExtension}`;
		const blob = new Blob([generatedCode], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
		toast.success(`Downloaded ${filename}`);
	};

	if (!selectedCollection) {
		return null;
	}

	const modalVariants = {
		hidden: {
			opacity: 0,
			scale: 0.95,
			y: 20,
		},
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: 20,
		},
	};

	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						variants={backdropVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={onClose}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
						transition={{ duration: 0.2 }}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							variants={modalVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							onClick={(e) => e.stopPropagation()}
							className={`relative w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border ${
								isDark
									? 'bg-gray-900/98 border-gray-700'
									: 'bg-white/98 border-gray-300'
							} backdrop-blur-sm overflow-hidden flex flex-col`}
							transition={{
								type: 'spring',
								damping: 25,
								stiffness: 200,
							}}
						>
							{/* Header */}
							<div
								className={`px-6 py-4 border-b relative overflow-hidden ${
									isDark
										? 'border-gray-700'
										: 'border-gray-300'
								}`}
							>
								{/* Header Background Gradient */}
								<div
									className={`absolute inset-0 ${
										isDark
											? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10'
											: 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5'
									} opacity-50`}
								></div>

								<div className="relative flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`p-2 rounded-lg ${
												isDark
													? 'bg-blue-500/20 text-blue-400'
													: 'bg-blue-500/10 text-blue-600'
											}`}
										>
											<Code2 className="w-5 h-5" />
										</div>
										<div>
											<h2
												className={`text-xl font-semibold ${
													isDark
														? 'text-white'
														: 'text-gray-900'
												}`}
											>
												Code Generator
											</h2>
											<p
												className={`text-sm ${
													isDark
														? 'text-gray-400'
														: 'text-gray-600'
												}`}
											>
												Generate{' '}
												{ORM_LABELS[selectedORM]} schema
												for {selectedCollection.name}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={copyToClipboard}
											className={`${
												isDark
													? 'text-gray-400 hover:text-white hover:bg-gray-700'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
											}`}
											title="Copy to clipboard"
										>
											<Copy className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={downloadFile}
											className={`${
												isDark
													? 'text-gray-400 hover:text-white hover:bg-gray-700'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
											}`}
											title="Download file"
										>
											<Download className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={onClose}
											className={`${
												isDark
													? 'text-gray-400 hover:text-white hover:bg-gray-700'
													: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
											}`}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>

							{/* Configuration Section */}
							<div
								className={`px-6 py-4 border-b ${
									isDark
										? 'border-gray-700 bg-gray-800/30'
										: 'border-gray-300 bg-gray-50/30'
								}`}
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											className={`text-sm font-medium flex items-center gap-2 mb-2 ${
												isDark
													? 'text-gray-300'
													: 'text-gray-700'
											}`}
										>
											<FileCode className="w-4 h-4" />
											Collection
										</label>
										<div
											className={`px-3 py-2 rounded-lg border ${
												isDark
													? 'bg-gray-800 border-gray-600 text-gray-200'
													: 'bg-gray-100 border-gray-300 text-gray-800'
											}`}
										>
											{selectedCollection.name}
										</div>
									</div>

									<div>
										<label
											className={`text-sm font-medium flex items-center gap-2 mb-2 ${
												isDark
													? 'text-gray-300'
													: 'text-gray-700'
											}`}
										>
											<Sparkles className="w-4 h-4" />
											ORM Framework
										</label>
										<select
											value={selectedORM}
											onChange={(e) =>
												setSelectedORM(
													e.target.value as ORM
												)
											}
											className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
												isDark
													? 'bg-gray-800 border-gray-600 text-gray-200 focus:bg-gray-700'
													: 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50'
											}`}
										>
											{Object.entries(ORM_LABELS).map(
												([value, label]) => (
													<option
														key={value}
														value={value}
														className={
															isDark
																? 'bg-gray-800'
																: 'bg-white'
														}
													>
														{label}
													</option>
												)
											)}
										</select>
									</div>
								</div>
							</div>

							{/* Code Display */}
							<div className="flex-1 overflow-hidden">
								<div
									className={`h-full ${
										isDark ? 'bg-gray-900' : 'bg-gray-50'
									}`}
								>
									<SyntaxHighlighter
										language={
											CODE_GENERATORS[selectedORM]
												.language
										}
										style={vscDarkPlus}
										customStyle={{
											margin: 0,
											padding: '1.5rem',
											background: 'transparent',
											fontSize: '13px',
											lineHeight: '1.5',
											height: '100%',
											overflow: 'auto',
										}}
										showLineNumbers
										wrapLines
									>
										{generatedCode}
									</SyntaxHighlighter>
								</div>
							</div>

							{/* Footer */}
							<div
								className={`px-6 py-3 border-t ${
									isDark
										? 'border-gray-700 bg-gray-800/30'
										: 'border-gray-300 bg-gray-50/30'
								}`}
							>
								<div className="flex items-center justify-between">
									<p
										className={`text-xs ${
											isDark
												? 'text-gray-400'
												: 'text-gray-600'
										}`}
									>
										Generated schema for{' '}
										<span
											className={`font-medium ${
												isDark
													? 'text-gray-300'
													: 'text-gray-700'
											}`}
										>
											{selectedCollection.name}
										</span>{' '}
										collection
									</p>
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<span>
											{generatedCode.split('\n').length}{' '}
											lines
										</span>
										<span>•</span>
										<span>
											{Math.round(
												generatedCode.length / 1024
											)}
											KB
										</span>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
