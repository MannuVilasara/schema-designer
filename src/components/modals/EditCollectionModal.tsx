'use client';

import { useState, useEffect } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import { getEntityLabel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, AlertTriangle } from 'lucide-react';
import type { EditCollectionModalProps } from '@/types';

export default function EditCollectionModal({
	isOpen,
	collection,
	position,
	onClose,
	onSave,
}: EditCollectionModalProps) {
	const { isDark } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const entityLabel = getEntityLabel(dbType);
	
	const [collectionName, setCollectionName] = useState('');
	const [nameError, setNameError] = useState('');

	useEffect(() => {
		if (collection) {
			setCollectionName(collection.name);
			setNameError('');
		}
	}, [collection]);

	const validateCollectionName = (name: string) => {
		if (name.includes(' ')) {
			setNameError(`${entityLabel} name cannot contain spaces`);
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError(`${entityLabel} name must start with a letter or underscore`);
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
		if (!position) return {};

		const modalWidth = 320;
		const modalHeight = 250;
		const padding = 20;

		let finalX = position.x - modalWidth / 2;
		let finalY = position.y - modalHeight / 2;

		if (finalX < padding) finalX = padding;
		if (finalX + modalWidth > window.innerWidth - padding) {
			finalX = window.innerWidth - modalWidth - padding;
		}
		if (finalY < padding) finalY = padding;
		if (finalY + modalHeight > window.innerHeight - padding) {
			finalY = window.innerHeight - modalHeight - padding;
		}

		return {
			left: `${finalX}px`,
			top: `${finalY}px`,
			position: 'fixed' as const,
		};
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = collectionName.trim();
		if (trimmedName && collection && validateCollectionName(trimmedName)) {
			onSave(collection.id, trimmedName);
		}
	};

	if (!isOpen || !collection) return null;

	const hasTimestampFields = collection.fields.some(
		(field) => field.name === 'createdAt' || field.name === 'updatedAt'
	);

	return (
		<>
			<div
				className="fixed inset-0 bg-black/40 z-40"
				onClick={onClose}
			/>

			<div
				className={`w-80 rounded-xl border shadow-xl z-50 ${
					isDark
						? 'bg-[#141414] border-[#262626] text-white'
						: 'bg-white border-[#e5e5e5] text-black'
				}`}
				style={position ? getModalStyle() : {}}
			>
				<div
					className={`px-4 py-3 border-b flex items-center justify-between ${
						isDark ? 'border-[#262626]' : 'border-[#e5e5e5]'
					}`}
				>
					<h2 className="font-semibold text-sm">Edit {entityLabel}</h2>
					<button
						onClick={onClose}
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
								placeholder="Name"
								className={`h-9 text-sm rounded-lg border ${
									nameError ? 'border-red-500 focus-visible:ring-red-500' : ''
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
							<div className="space-y-2 text-xs">
								<div className="flex justify-between">
									<span className={isDark ? 'text-[#737373]' : 'text-[#a3a3a3]'}>
										Total Fields:
									</span>
									<span className="font-medium">
										{collection.fields.length}
									</span>
								</div>
								<div className="flex justify-between">
									<span className={isDark ? 'text-[#737373]' : 'text-[#a3a3a3]'}>
										Has Timestamps:
									</span>
									<span className="font-medium">
										{hasTimestampFields ? 'Yes' : 'No'}
									</span>
								</div>
							</div>
						</div>

						<div className="pt-2 flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="flex-1 h-9 text-xs rounded-lg border"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!collectionName.trim() || !!nameError}
								className="flex-1 h-9 text-xs rounded-lg bg-foreground text-background hover:opacity-90"
							>
								Save
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
