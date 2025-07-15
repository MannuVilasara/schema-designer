'use client';

import { useState } from 'react';
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
import { 
	X, 
	Plus, 
	Type, 
	Hash, 
	ToggleLeft, 
	Calendar, 
	List, 
	Braces, 
	ExternalLink,
	Sparkles,
	CheckCircle,
	AlertTriangle
} from 'lucide-react';
import type { AddFieldModalProps } from '@/types';

const fieldTypes = [
	{ value: 'string', label: 'String', icon: Type, description: 'Text data' },
	{ value: 'number', label: 'Number', icon: Hash, description: 'Numeric values' },
	{ value: 'boolean', label: 'Boolean', icon: ToggleLeft, description: 'True/false values' },
	{ value: 'date', label: 'Date', icon: Calendar, description: 'Date and time' },
	{ value: 'array', label: 'Array', icon: List, description: 'List of values' },
	{ value: 'object', label: 'Object', icon: Braces, description: 'Nested document' },
	{ value: 'objectId', label: 'ObjectId', icon: ExternalLink, description: 'Reference to another collection' },
];

export default function AddFieldModal({
	isOpen,
	collectionName,
	position,
	onClose,
	onAddField,
}: AddFieldModalProps) {
	const { isDark } = useThemeContext();

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

	// Calculate modal position near the collection
	const getModalStyle = () => {
		if (position) {
			const modalWidth = 320; // w-80 = 320px
			const modalHeight = 400; // Estimated height for form

			// Calculate position with bounds checking
			let left = position.x + 20; // Small offset from collection
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
		const trimmedName = fieldName.trim();
		if (!trimmedName || !validateFieldName(trimmedName)) return;

		onAddField({
			name: trimmedName,
			type: fieldType,
			required: isRequired,
		});

		// Reset form
		setFieldName('');
		setFieldType('string');
		setIsRequired(false);
		setNameError('');
		onClose();
	};

	const handleClose = () => {
		setFieldName('');
		setFieldType('string');
		setIsRequired(false);
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
						: 'bg-white/98 border-gray-300/60 text-gray-900 shadow-gray-600/25'
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
				<div className={`relative p-6 border-b overflow-hidden ${
					isDark ? 'border-gray-700/50' : 'border-gray-300/50'
				}`}>
					{/* Header Background Gradient */}
					<div className={`absolute inset-0 ${
						isDark 
							? 'bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-50'
							: 'bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-80'
					}`}></div>
					
					<div className="relative z-10 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
								isDark
									? 'bg-gradient-to-r from-green-500/20 to-blue-600/20 border border-green-400/30'
									: 'bg-gradient-to-r from-green-100 to-blue-100 border border-green-300'
							}`}>
								<Plus className="w-6 h-6 text-green-500" />
							</div>
							<div>
								<h2 className="text-xl font-bold tracking-tight">
									Add New Field
								</h2>
								<p className={`text-sm ${
									isDark ? 'text-gray-400' : 'text-gray-600'
								}`}>
									To collection: <span className="font-medium text-blue-500">{collectionName}</span>
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
									: 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
							}`}
						>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Enhanced Content */}
				<div className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Field Name Section */}
						<div className="space-y-3">
							<Label
								htmlFor="fieldName"
								className="text-sm font-semibold flex items-center gap-2"
							>
								<Sparkles className="w-4 h-4 text-blue-500" />
								Field Name
							</Label>
							<div className="space-y-2">
								<Input
									id="fieldName"
									type="text"
									value={fieldName}
									onChange={handleNameChange}
									placeholder="e.g., email, userName, price"
									className={`h-12 rounded-xl border-2 transition-all duration-200 font-medium ${
										nameError
											? isDark
												? 'border-red-500 focus:border-red-400 bg-red-900/10'
												: 'border-red-400 focus:border-red-500 bg-red-50'
											: isDark
												? 'border-gray-700 focus:border-blue-500 hover:border-gray-600 bg-gray-800/50'
												: 'border-gray-300 focus:border-blue-500 hover:border-gray-400 bg-gray-50/70'
									} ${
										isDark
											? 'text-white placeholder-gray-400'
											: 'text-gray-900 placeholder-gray-500'
									}`}
									autoFocus
									required
								/>
								{nameError && (
									<p className={`text-sm flex items-center gap-1 ${
										isDark ? 'text-red-400' : 'text-red-600'
									}`}>
										<AlertTriangle className="w-3 h-3" />
										{nameError}
									</p>
								)}
								{fieldName && !nameError && (
									<p className={`text-sm flex items-center gap-1 ${
										isDark ? 'text-green-400' : 'text-green-600'
									}`}>
										<CheckCircle className="w-3 h-3" />
										Valid field name
									</p>
								)}
							</div>
						</div>

						{/* Field Type Section */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold flex items-center gap-2">
								<Type className="w-4 h-4 text-purple-500" />
								Field Type
							</Label>
							<Select value={fieldType} onValueChange={setFieldType}>
								<SelectTrigger className={`h-12 rounded-xl border-2 transition-all duration-200 ${
									isDark
										? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 focus:border-purple-500'
										: 'bg-gray-50/70 border-gray-300 hover:border-gray-400 focus:border-purple-500'
								}`}>
									<SelectValue placeholder="Select field type" />
								</SelectTrigger>
								<SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}>
									{fieldTypes.map((type) => {
										const IconComponent = type.icon;
										return (
											<SelectItem key={type.value} value={type.value} 
												className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}>
												<div className="flex items-center gap-2">
													<IconComponent className="w-4 h-4" />
													<div>
														<div className="font-medium">{type.label}</div>
														<div className={`text-xs ${
															isDark ? 'text-gray-400' : 'text-gray-500'
														}`}>
															{type.description}
														</div>
													</div>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>

						{/* Field Options Section */}
						<div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
							isDark 
								? 'border-gray-700 bg-gray-800/30 hover:border-gray-600' 
								: 'border-gray-300 bg-gray-50/70 hover:border-gray-400'
						}`}>
							<div className="flex items-center gap-2 mb-4">
								<ToggleLeft className="w-4 h-4 text-orange-500" />
								<Label className="text-sm font-semibold">
									Field Options
								</Label>
							</div>
							
							<div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
								isDark 
									? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700' 
									: 'bg-white/80 border-gray-200/80 hover:bg-white'
							}`}>
								<div>
									<div className="font-medium text-sm">Required Field</div>
									<div className={`text-xs ${
										isDark ? 'text-gray-400' : 'text-gray-500'
									}`}>
										Field must have a value
									</div>
								</div>
								<Switch
									checked={isRequired}
									onCheckedChange={setIsRequired}
									className="data-[state=checked]:bg-orange-500"
								/>
							</div>

							{/* Field Type Info */}
							{fieldType === 'objectId' && (
								<div className={`mt-4 pt-4 border-t text-xs rounded-lg p-3 ${
									isDark
										? 'border-gray-600 bg-purple-900/20 text-purple-300'
										: 'border-gray-300 bg-purple-50/80 text-purple-700'
								}`}>
									<div className="flex items-center gap-2">
										<ExternalLink className="w-3 h-3" />
										<span className="font-medium">Reference field:</span>
									</div>
									<div className="mt-1">
										This field will store references to documents in other collections
									</div>
								</div>
							)}
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
										: 'border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-500'
								}`}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!fieldName.trim() || !!nameError}
								className="flex-1 h-12 rounded-xl font-medium bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Field
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
