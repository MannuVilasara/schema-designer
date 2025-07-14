'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import type { EditFieldModalProps } from '@/types';

export default function EditFieldModal({
	isOpen,
	field,
	position,
	onClose,
	onSave,
}: EditFieldModalProps) {
	const { theme } = useTheme();
	const isDark = theme === 'dark';
	const [fieldName, setFieldName] = useState('');
	const [fieldType, setFieldType] = useState('string');
	const [isRequired, setIsRequired] = useState(false);
	const [nameError, setNameError] = useState('');

	// Validate field name
	const validateFieldName = (name: string) => {
		if (name.includes(' ')) {
			setNameError('Field name cannot contain spaces');
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError(
				'Field name must start with a letter or underscore and contain only letters, numbers, and underscores'
			);
			return false;
		}
		setNameError('');
		return true;
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFieldName(value);
		if (value.trim()) {
			validateFieldName(value.trim());
		} else {
			setNameError('');
		}
	};

	useEffect(() => {
		if (field) {
			setFieldName(field.name);
			setFieldType(field.type);
			setIsRequired(field.required);
			setNameError(''); // Reset error when field changes
		}
	}, [field]);

	const getModalStyle = () => {
		if (!position) return {};

		const modalWidth = 400;
		const modalHeight = 300;
		const padding = 20;

		let finalX = position.x - modalWidth / 2;
		let finalY = position.y - modalHeight / 2;

		// Adjust for screen edges
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
		const trimmedName = fieldName.trim();
		if (trimmedName && validateFieldName(trimmedName)) {
			onSave({
				name: trimmedName,
				type: fieldType,
				required: isRequired,
			});
			onClose();
		}
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen || !field) return null;

	const isIdField = field.name === '_id';

	return (
		<div
			className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
			onClick={handleOverlayClick}
		>
			<div
				className={`w-96 rounded-lg border shadow-lg ${
					isDark
						? 'bg-gray-800 border-gray-600 text-white'
						: 'bg-white border-gray-200 text-gray-800'
				}`}
				style={position ? getModalStyle() : {}}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
					<h2 className="text-lg font-semibold">Edit Field</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-1 h-8 w-8"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="fieldName">Field Name</Label>
						<Input
							id="fieldName"
							type="text"
							value={fieldName}
							onChange={handleNameChange}
							placeholder="Enter field name (no spaces)"
							required
							disabled={isIdField}
							className={`${isIdField ? 'opacity-50 cursor-not-allowed' : ''} ${
								nameError ? 'border-red-500' : ''
							}`}
						/>
						{isIdField && (
							<p className="text-xs text-gray-500">
								The _id field name cannot be changed
							</p>
						)}
						{nameError && !isIdField && (
							<p className="text-red-500 text-xs">{nameError}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="fieldType">Field Type</Label>
						<Select
							value={fieldType}
							onValueChange={setFieldType}
							disabled={isIdField}
						>
							<SelectTrigger
								className={
									isIdField
										? 'opacity-50 cursor-not-allowed'
										: ''
								}
							>
								<SelectValue placeholder="Select field type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="string">String</SelectItem>
								<SelectItem value="number">Number</SelectItem>
								<SelectItem value="boolean">Boolean</SelectItem>
								<SelectItem value="date">Date</SelectItem>
								<SelectItem value="array">Array</SelectItem>
								<SelectItem value="object">Object</SelectItem>
								<SelectItem value="objectId">
									ObjectId
								</SelectItem>
							</SelectContent>
						</Select>
						{isIdField && (
							<p className="text-xs text-gray-500">
								The _id field type cannot be changed
							</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="required" className="flex-1">
							Required Field
						</Label>
						<Switch
							id="required"
							checked={isRequired}
							onCheckedChange={setIsRequired}
							disabled={isIdField}
							className={isIdField ? 'opacity-50' : ''}
						/>
					</div>
					{isIdField && (
						<p className="text-xs text-gray-500">
							The _id field is always required
						</p>
					)}

					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={
								!fieldName.trim() || (!!nameError && !isIdField)
							}
						>
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
