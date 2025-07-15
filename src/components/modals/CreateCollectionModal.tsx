'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useThemeContext } from '@/contexts/ThemeContext';
import { X, Clock, Database, Sparkles, CheckCircle } from 'lucide-react';
import type { CreateCollectionModalProps } from '@/types';

export default function CreateCollectionModal({
	isOpen,
	position,
	onClose,
	onCreateCollection,
}: CreateCollectionModalProps) {
	const { isDark } = useThemeContext();

	const [collectionName, setCollectionName] = useState('');
	const [includeTimestamps, setIncludeTimestamps] = useState(true);
	const [includeCreatedAt, setIncludeCreatedAt] = useState(true);
	const [includeUpdatedAt, setIncludeUpdatedAt] = useState(true);
	const [nameError, setNameError] = useState('');

	// Validate collection name
	const validateCollectionName = (name: string) => {
		if (name.includes(' ')) {
			setNameError('Collection name cannot contain spaces');
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError(
				'Collection name must start with a letter or underscore and contain only letters, numbers, and underscores'
			);
			return false;
		}
		setNameError('');
		return true;
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCollectionName(value);
		if (value.trim()) {
			validateCollectionName(value.trim());
		} else {
			setNameError('');
		}
	};

	// Calculate modal position on canvas
	const getModalStyle = () => {
		if (position) {
			const modalWidth = 320; // w-80 = 320px
			const modalHeight = 350; // Estimated height with timestamp options

			// Calculate position with bounds checking
			let left = position.x + 20; // Small offset from click
			let top = position.y + 20;

			// Ensure modal doesn't go off-screen
			if (left + modalWidth > window.innerWidth) {
				left = position.x - modalWidth - 20; // Show to the left instead
			}
			if (top + modalHeight > window.innerHeight) {
				top = position.y - modalHeight - 20; // Show above instead
			}

			// Ensure minimum margins
			left = Math.max(
				10,
				Math.min(left, window.innerWidth - modalWidth - 10)
			);
			top = Math.max(
				10,
				Math.min(top, window.innerHeight - modalHeight - 10)
			);

			return {
				position: 'fixed' as const,
				left,
				top,
				zIndex: 50,
			};
		}
		return {}; // Default centering will be handled by CSS
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = collectionName.trim();
		if (!trimmedName || !validateCollectionName(trimmedName)) return;

		onCreateCollection(trimmedName, {
			includeTimestamps,
			includeCreatedAt: includeTimestamps ? includeCreatedAt : false,
			includeUpdatedAt: includeTimestamps ? includeUpdatedAt : false,
		});

		// Reset form
		setCollectionName('');
		setIncludeTimestamps(true);
		setIncludeCreatedAt(true);
		setIncludeUpdatedAt(true);
		setNameError('');
		onClose();
	};

	const handleClose = () => {
		setCollectionName('');
		setIncludeTimestamps(true);
		setIncludeCreatedAt(true);
		setIncludeUpdatedAt(true);
		setNameError('');
		onClose();
	};

	if (!isOpen) return null;

	const modalStyle = getModalStyle();
	const isPositioned = position && Object.keys(modalStyle).length > 0;

	return (
		<>
			{/* Enhanced Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
				onClick={handleClose}
			/>

			{/* Enhanced Modal Card */}
			<div
				className={`w-96 max-w-sm rounded-2xl shadow-2xl border z-50 transform transition-all duration-300 scale-100 backdrop-blur-xl ${
					isDark
						? 'bg-gray-900/95 border-gray-700/50 text-white shadow-gray-900/50'
						: 'bg-white/95 border-gray-200/50 text-gray-900 shadow-gray-500/20'
				} ${isPositioned ? 'fixed' : 'relative'}`}
				style={
					isPositioned
						? modalStyle
						: {
								position: 'fixed',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}
				}
			>
				{/* Enhanced Header with Gradient */}
				<div
					className={`relative p-6 border-b overflow-hidden ${
						isDark ? 'border-gray-700/50' : 'border-gray-200/50'
					}`}
				>
					{/* Header Background Gradient */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-50"></div>

					<div className="relative z-10 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div
								className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
									isDark
										? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-400/30'
										: 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
								}`}
							>
								<Database className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<h2 className="text-xl font-bold tracking-tight">
									Create Collection
								</h2>
								<p
									className={`text-sm ${
										isDark
											? 'text-gray-400'
											: 'text-gray-500'
									}`}
								>
									Define a new MongoDB collection
								</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className={`h-10 w-10 rounded-xl transition-all duration-200 ${
								isDark
									? 'hover:bg-gray-800 text-gray-400 hover:text-white'
									: 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
							}`}
						>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Enhanced Content */}
				<div className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Collection Name Section */}
						<div className="space-y-3">
							<Label
								htmlFor="collectionName"
								className="text-sm font-semibold flex items-center gap-2"
							>
								<Sparkles className="w-4 h-4 text-blue-500" />
								Collection Name
							</Label>
							<div className="space-y-2">
								<Input
									id="collectionName"
									type="text"
									value={collectionName}
									onChange={handleNameChange}
									placeholder="e.g., users, products, orders"
									className={`h-12 rounded-xl border-2 transition-all duration-200 font-medium ${
										nameError
											? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400'
											: 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 hover:border-gray-300 dark:hover:border-gray-600'
									} ${
										isDark
											? 'bg-gray-800/50 text-white placeholder-gray-400'
											: 'bg-gray-50/50 text-gray-900 placeholder-gray-500'
									}`}
									autoFocus
									required
								/>
								{nameError && (
									<p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
										<X className="w-3 h-3" />
										{nameError}
									</p>
								)}
								{collectionName && !nameError && (
									<p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
										<CheckCircle className="w-3 h-3" />
										Valid collection name
									</p>
								)}
							</div>
						</div>

						{/* Timestamp Configuration Section */}
						<div
							className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
								isDark
									? 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
									: 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
							}`}
						>
							<div className="flex items-center gap-2 mb-4">
								<Clock className="w-4 h-4 text-amber-500" />
								<Label className="text-sm font-semibold">
									Timestamp Configuration
								</Label>
							</div>

							<div className="space-y-4">
								<div
									className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
										isDark
											? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
											: 'bg-white/50 border-gray-200/50 hover:bg-white'
									}`}
								>
									<div>
										<div className="font-medium text-sm">
											Auto Timestamps
										</div>
										<div
											className={`text-xs ${
												isDark
													? 'text-gray-400'
													: 'text-gray-500'
											}`}
										>
											Automatically manage createdAt and
											updatedAt
										</div>
									</div>
									<Switch
										checked={includeTimestamps}
										onCheckedChange={setIncludeTimestamps}
										className="data-[state=checked]:bg-blue-500"
									/>
								</div>

								{includeTimestamps && (
									<div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-700 transition-all duration-300">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-green-500"></div>
												<span className="text-sm font-medium">
													createdAt
												</span>
											</div>
											<Switch
												checked={includeCreatedAt}
												onCheckedChange={
													setIncludeCreatedAt
												}
												className="data-[state=checked]:bg-green-500"
											/>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-orange-500"></div>
												<span className="text-sm font-medium">
													updatedAt
												</span>
											</div>
											<Switch
												checked={includeUpdatedAt}
												onCheckedChange={
													setIncludeUpdatedAt
												}
												className="data-[state=checked]:bg-orange-500"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Enhanced Info Section */}
							<div
								className={`mt-4 pt-4 border-t text-xs rounded-lg p-3 ${
									isDark
										? 'border-gray-600 bg-blue-900/20 text-blue-300'
										: 'border-gray-200 bg-blue-50/50 text-blue-600'
								}`}
							>
								<div className="flex items-center gap-2">
									<Sparkles className="w-3 h-3" />
									<span className="font-medium">
										Auto-generated field:
									</span>
								</div>
								<div className="mt-1 flex items-center gap-1">
									<code
										className={`px-2 py-1 rounded font-mono text-xs ${
											isDark
												? 'bg-gray-800 text-blue-400 border border-gray-700'
												: 'bg-white text-blue-700 border border-blue-200'
										}`}
									>
										_id
									</code>
									<span>
										ObjectId field will be automatically
										added
									</span>
								</div>
							</div>
						</div>

						{/* Enhanced Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className={`flex-1 h-12 rounded-xl font-medium transition-all duration-200 ${
									isDark
										? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500'
										: 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400'
								}`}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!collectionName.trim() || !!nameError}
								className="flex-1 h-12 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
							>
								<Database className="w-4 h-4 mr-2" />
								Create Collection
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
