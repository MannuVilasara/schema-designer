'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { X, Clock } from 'lucide-react';
import type { CreateCollectionModalProps } from '@/types';

export default function CreateCollectionModal({
	isOpen,
	position,
	onClose,
	onCreateCollection,
}: CreateCollectionModalProps) {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

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
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/30 z-40"
				onClick={handleClose}
			/>

			{/* Modal Card */}
			<div
				className={`w-80 max-w-sm rounded-xl shadow-2xl border backdrop-blur-sm z-50 ${
					isDark
						? 'bg-gray-800/95 border-gray-600 text-white'
						: 'bg-white/95 border-gray-200 text-gray-900'
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
				{/* Card Header */}
				<div
					className={`p-4 border-b ${
						isDark ? 'border-gray-600' : 'border-gray-200'
					}`}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div
								className={`w-8 h-8 rounded-lg flex items-center justify-center ${
									isDark
										? 'bg-blue-500/20 text-blue-400'
										: 'bg-blue-50 text-blue-600'
								}`}
							>
								📦
							</div>
							<h2 className="text-lg font-semibold">
								New Collection
							</h2>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className={`h-8 w-8 rounded-lg ${
								isDark
									? 'hover:bg-gray-700'
									: 'hover:bg-gray-100'
							}`}
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Card Content */}
				<div className="p-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label
								htmlFor="collectionName"
								className="text-sm font-medium"
							>
								Collection Name
							</Label>
							<Input
								id="collectionName"
								type="text"
								value={collectionName}
								onChange={handleNameChange}
								placeholder="Enter collection name (no spaces)"
								className={`${isDark ? 'bg-gray-700 border-gray-600' : ''} ${
									nameError ? 'border-red-500' : ''
								}`}
								autoFocus
							/>
							{nameError && (
								<p className="text-red-500 text-xs mt-1">
									{nameError}
								</p>
							)}
						</div>

						{/* Timestamp Options */}
						<div
							className={`p-3 rounded-lg border ${
								isDark
									? 'border-gray-600 bg-gray-700/30'
									: 'border-gray-200 bg-gray-50'
							}`}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4" />
									<Label
										htmlFor="includeTimestamps"
										className="text-sm font-medium"
									>
										Include Timestamps
									</Label>
								</div>
								<Switch
									id="includeTimestamps"
									checked={includeTimestamps}
									onCheckedChange={setIncludeTimestamps}
								/>
							</div>

							{includeTimestamps && (
								<div className="space-y-2 ml-6">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="includeCreatedAt"
											className="text-sm"
										>
											createdAt field
										</Label>
										<Switch
											id="includeCreatedAt"
											checked={includeCreatedAt}
											onCheckedChange={
												setIncludeCreatedAt
											}
										/>
									</div>
									<div className="flex items-center justify-between">
										<Label
											htmlFor="includeUpdatedAt"
											className="text-sm"
										>
											updatedAt field
										</Label>
										<Switch
											id="includeUpdatedAt"
											checked={includeUpdatedAt}
											onCheckedChange={
												setIncludeUpdatedAt
											}
										/>
									</div>
								</div>
							)}

							{/* Info about automatic _id field */}
							<div
								className={`mt-3 pt-3 border-t text-xs ${
									isDark
										? 'border-gray-600 text-gray-400'
										: 'border-gray-200 text-gray-500'
								}`}
							>
								💡 An{' '}
								<code className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
									_id
								</code>{' '}
								field (ObjectId) will be automatically added
							</div>
						</div>

						<div className="flex gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="flex-1"
								disabled={!collectionName.trim() || !!nameError}
							>
								Create
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
