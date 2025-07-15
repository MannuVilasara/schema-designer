'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import type { ConfirmFieldDeleteDialogProps } from '@/types';

export default function ConfirmFieldDeleteDialog({
	isOpen,
	fieldName,
	position,
	onConfirm,
	onCancel,
}: ConfirmFieldDeleteDialogProps) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? resolvedTheme === 'dark' : false;

	const getModalStyle = () => {
		if (!position) return {};

		const modalWidth = 400;
		const modalHeight = 200;
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

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	};

	if (!isOpen) return null;

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
					<div className="flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-red-500" />
						<h2 className="text-lg font-semibold">Delete Field</h2>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onCancel}
						className="p-1 h-8 w-8"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				<div className="p-4">
					<p className="text-sm mb-4">
						Are you sure you want to delete the field{' '}
						<strong>"{fieldName}"</strong>? This action cannot be
						undone and will remove all data associated with this
						field.
					</p>

					<div className="flex gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={onConfirm}
							className="flex-1"
						>
							Delete Field
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
