'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import { getEntityLabel, getIdFieldConfig } from '@/types';
import { X, AlertTriangle } from 'lucide-react';
import type { CreateCollectionModalProps } from '@/types';

export default function CreateCollectionModal({
	isOpen,
	position,
	onClose,
	onCreateCollection,
}: CreateCollectionModalProps) {
	const { isDark } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const entityLabel = getEntityLabel(dbType);
	const idConfig = getIdFieldConfig(dbType);

	const [collectionName, setCollectionName] = useState('');
	const [includeTimestamps, setIncludeTimestamps] = useState(true);
	const [includeCreatedAt, setIncludeCreatedAt] = useState(true);
	const [includeUpdatedAt, setIncludeUpdatedAt] = useState(true);
	const [nameError, setNameError] = useState('');

	const validateCollectionName = (name: string) => {
		if (name.includes(' ')) {
			setNameError(`${entityLabel} name cannot contain spaces`);
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError(
				`${entityLabel} name must start with a letter or underscore`
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

	const getModalStyle = () => {
		if (position) {
			const modalWidth = 320;
			const modalHeight = 350;
			let left = position.x + 20;
			let top = position.y + 20;

			if (left + modalWidth > window.innerWidth) {
				left = position.x - modalWidth - 20;
			}
			if (top + modalHeight > window.innerHeight) {
				top = position.y - modalHeight - 20;
			}

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
		return {};
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
			<div
				className="fixed inset-0 bg-black/40 z-40"
				onClick={handleClose}
			/>

			<div
				className={`w-80 rounded-xl border shadow-xl z-50 ${
					isDark
						? 'bg-[#141414] border-[#262626] text-white'
						: 'bg-white border-[#e5e5e5] text-black'
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
				<div
					className={`px-4 py-3 border-b flex items-center justify-between ${
						isDark ? 'border-[#262626]' : 'border-[#e5e5e5]'
					}`}
				>
					<div>
						<h2 className="font-semibold text-sm">
							New {entityLabel}
						</h2>
					</div>
					<button
						onClick={handleClose}
						className={`p-1.5 rounded-lg transition-colors ${
							isDark
								? 'hover:bg-[#262626] text-[#a3a3a3] hover:text-white'
								: 'hover:bg-[#f0f0f0] text-[#737373] hover:text-black'
						}`}
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="p-4">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label
								htmlFor="collectionName"
								className="text-xs font-medium"
							>
								{entityLabel} Name
							</Label>
							<Input
								id="collectionName"
								value={collectionName}
								onChange={handleNameChange}
								placeholder={`e.g. ${dbType === 'postgresql' ? 'users' : 'Users'}`}
								className={`h-9 text-sm rounded-lg border ${
									nameError
										? 'border-red-500 focus-visible:ring-red-500'
										: ''
								}`}
								autoFocus
								required
							/>
							{nameError && (
								<p className="text-[10px] text-red-500 flex items-center gap-1">
									<AlertTriangle className="w-3 h-3" />
									{nameError}
								</p>
							)}
						</div>

						<div
							className={`p-3 rounded-lg border ${
								isDark
									? 'bg-[#1a1a1a] border-[#262626]'
									: 'bg-[#fafafa] border-[#e5e5e5]'
							}`}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="space-y-0.5">
									<Label className="text-xs font-medium">
										Timestamps
									</Label>
									<p
										className={`text-[10px] ${
											isDark
												? 'text-[#737373]'
												: 'text-[#a3a3a3]'
										}`}
									>
										Auto-manage created/updated fields
									</p>
								</div>
								<Switch
									checked={includeTimestamps}
									onCheckedChange={setIncludeTimestamps}
								/>
							</div>

							{includeTimestamps && (
								<div
									className={`pl-3 border-l space-y-2 mt-2 pt-2 ${
										isDark
											? 'border-[#333]'
											: 'border-[#e5e5e5]'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-mono">
											createdAt
										</span>
										<Switch
											checked={includeCreatedAt}
											onCheckedChange={
												setIncludeCreatedAt
											}
										/>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-mono">
											updatedAt
										</span>
										<Switch
											checked={includeUpdatedAt}
											onCheckedChange={
												setIncludeUpdatedAt
											}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							className={`text-[10px] rounded p-2 ${
								isDark
									? 'bg-[#1a1a1a] text-[#a3a3a3]'
									: 'bg-[#f5f5f5] text-[#737373]'
							}`}
						>
							Auto-generated field:{' '}
							<span className="font-mono">{idConfig.name}</span> (
							{idConfig.type})
						</div>

						<div className="pt-2 flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className="flex-1 h-9 text-xs rounded-lg border"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									!collectionName.trim() || !!nameError
								}
								className="flex-1 h-9 text-xs rounded-lg bg-foreground text-background hover:opacity-90"
							>
								Create {entityLabel}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
