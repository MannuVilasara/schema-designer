'use client';

import { useState, useEffect } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
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
import { getFieldTypes } from '@/types';
import { X, AlertTriangle } from 'lucide-react';
import type { EditFieldModalProps } from '@/types';

export default function EditFieldModal({
	isOpen,
	field,
	position,
	onClose,
	onSave,
}: EditFieldModalProps) {
	const { isDark } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const fieldTypes = getFieldTypes(dbType);

	const [fieldName, setFieldName] = useState('');
	const [fieldType, setFieldType] = useState('string');
	const [isRequired, setIsRequired] = useState(false);
	const [nameError, setNameError] = useState('');

	const validateFieldName = (name: string) => {
		if (name.includes(' ')) {
			setNameError('Field name cannot contain spaces');
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError('Field name must start with a letter or underscore');
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
			setNameError('');
		}
	}, [field]);

	const getModalStyle = () => {
		if (!position) return {};

		const modalWidth = 320;
		const modalHeight = 350;
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
		const trimmedName = fieldName.trim();
		if (trimmedName && validateFieldName(trimmedName)) {
			onSave({
				name: trimmedName,
				type: fieldType,
				required: isRequired,
			});
		}
	};

	if (!isOpen || !field) return null;

	const isIdField = field.name === '_id' || field.name === 'id';

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
					<h2 className="font-semibold text-sm">Edit Field</h2>
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
								htmlFor="fieldName"
								className="text-xs font-medium"
							>
								Field Name
							</Label>
							<Input
								id="fieldName"
								value={fieldName}
								onChange={handleNameChange}
								placeholder="Field name"
								disabled={isIdField}
								className={`h-9 text-sm rounded-lg border ${
									isIdField ? 'opacity-50' : ''
								} ${nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
								autoFocus
								required
							/>
							{isIdField && (
								<p className="text-[10px] text-[#737373]">
									ID field name cannot be changed
								</p>
							)}
							{nameError && !isIdField && (
								<p className="text-[10px] text-red-500 flex items-center gap-1">
									<AlertTriangle className="w-3 h-3" />
									{nameError}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-medium">Type</Label>
							<Select
								value={fieldType}
								onValueChange={setFieldType}
								disabled={isIdField}
							>
								<SelectTrigger
									className={`h-9 text-sm rounded-lg border ${
										isIdField ? 'opacity-50' : ''
									}`}
								>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{fieldTypes.map((type) => (
										<SelectItem key={type} value={type}>
											<span className="font-mono text-xs">
												{type}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{isIdField && (
								<p className="text-[10px] text-[#737373]">
									ID field type cannot be changed
								</p>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-3 rounded-lg border ${
								isDark
									? 'bg-[#1a1a1a] border-[#262626]'
									: 'bg-[#fafafa] border-[#e5e5e5]'
							}`}
						>
							<div className="space-y-0.5">
								<Label className="text-xs font-medium">
									Required
								</Label>
								<p
									className={`text-[10px] ${
										isDark
											? 'text-[#737373]'
											: 'text-[#a3a3a3]'
									}`}
								>
									{isIdField
										? 'ID is always required'
										: 'Must have a value'}
								</p>
							</div>
							<Switch
								checked={isRequired}
								onCheckedChange={setIsRequired}
								disabled={isIdField}
								className={isIdField ? 'opacity-50' : ''}
							/>
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
								disabled={
									!fieldName.trim() ||
									(!!nameError && !isIdField)
								}
								className="flex-1 h-9 text-xs rounded-lg bg-foreground text-background hover:opacity-90"
							>
								Save Changes
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
