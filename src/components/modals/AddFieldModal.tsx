'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useSchemaStore } from '@/store/schemaStore';
import { getFieldTypes, getEntityLabel } from '@/types';
import { X, Plus, AlertTriangle } from 'lucide-react';
import type { AddFieldModalProps } from '@/types';

export default function AddFieldModal({
	isOpen,
	collectionName,
	position,
	onClose,
	onAddField,
}: AddFieldModalProps) {
	const { isDark } = useThemeContext();
	const dbType = useSchemaStore((s) => s.dbType);
	const fieldTypes = getFieldTypes(dbType);

	const [fieldName, setFieldName] = useState('');
	const [fieldType, setFieldType] = useState<string>(
		dbType === 'postgresql' ? 'varchar' : 'string'
	);
	const [isRequired, setIsRequired] = useState(false);
	const [nameError, setNameError] = useState('');

	const validateFieldName = (name: string) => {
		if (name.includes(' ')) {
			setNameError('Field name cannot contain spaces');
			return false;
		}
		if (name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
			setNameError(
				'Field name must start with a letter or underscore'
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

	const getModalStyle = () => {
		if (position) {
			const modalWidth = 320;
			const modalHeight = 400;
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
		const trimmedName = fieldName.trim();
		if (!trimmedName || !validateFieldName(trimmedName)) return;

		onAddField({
			name: trimmedName,
			type: fieldType,
			required: isRequired,
		});

		setFieldName('');
		setFieldType(dbType === 'postgresql' ? 'varchar' : 'string');
		setIsRequired(false);
		setNameError('');
		onClose();
	};

	const handleClose = () => {
		setFieldName('');
		setFieldType(dbType === 'postgresql' ? 'varchar' : 'string');
		setIsRequired(false);
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
						<h2 className="font-semibold text-sm">Add Field</h2>
						<p
							className={`text-xs ${isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'}`}
						>
							to {collectionName}
						</p>
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
								htmlFor="fieldName"
								className="text-xs font-medium"
							>
								Field Name
							</Label>
							<Input
								id="fieldName"
								value={fieldName}
								onChange={handleNameChange}
								placeholder="e.g. email, price, count"
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

						<div className="space-y-1.5">
							<Label className="text-xs font-medium">Type</Label>
							<Select
								value={fieldType}
								onValueChange={setFieldType}
							>
								<SelectTrigger className="h-9 text-sm rounded-lg border">
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
									Must have a value
								</p>
							</div>
							<Switch
								checked={isRequired}
								onCheckedChange={setIsRequired}
							/>
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
								disabled={!fieldName.trim() || !!nameError}
								className="flex-1 h-9 text-xs rounded-lg bg-foreground text-background hover:opacity-90"
							>
								Add Field
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
