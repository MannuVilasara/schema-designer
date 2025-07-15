'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { ConfirmDialogProps } from '@/types';

export default function ConfirmDialog({
	isOpen,
	title,
	message,
	position,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? resolvedTheme === 'dark' : false;

	if (!isOpen) return null;

	// Calculate dialog position near the collection
	const getDialogStyle = () => {
		if (position) {
			const dialogWidth = 320; // w-80 = 320px
			const dialogHeight = 200; // Estimated height

			// Calculate position with bounds checking
			let left = position.x + 20; // Small offset from collection
			let top = position.y + 20;

			// Ensure dialog doesn't go off-screen
			if (left + dialogWidth > window.innerWidth) {
				left = position.x - dialogWidth - 20; // Show to the left instead
			}
			if (top + dialogHeight > window.innerHeight) {
				top = position.y - dialogHeight - 20; // Show above instead
			}

			// Ensure minimum margins
			left = Math.max(
				10,
				Math.min(left, window.innerWidth - dialogWidth - 10)
			);
			top = Math.max(
				10,
				Math.min(top, window.innerHeight - dialogHeight - 10)
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

	const dialogStyle = getDialogStyle();
	const isPositioned = position && Object.keys(dialogStyle).length > 0;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/30 z-40"
				onClick={onCancel}
			/>

			{/* Dialog Card */}
			<div
				className={`w-80 max-w-sm rounded-xl shadow-2xl border backdrop-blur-sm z-50 ${
					isDark
						? 'bg-gray-800/95 border-gray-600 text-white'
						: 'bg-white/95 border-gray-200 text-gray-900'
				} ${isPositioned ? 'fixed' : 'relative'}`}
				style={
					isPositioned
						? dialogStyle
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
					<div className="flex items-center gap-2">
						<div
							className={`w-8 h-8 rounded-lg flex items-center justify-center ${
								isDark
									? 'bg-red-500/20 text-red-400'
									: 'bg-red-50 text-red-600'
							}`}
						>
							<AlertTriangle className="w-4 h-4" />
						</div>
						<h2 className="text-lg font-semibold">{title}</h2>
					</div>
				</div>

				{/* Card Content */}
				<div className="p-4">
					<p
						className={`mb-4 text-sm leading-relaxed ${
							isDark ? 'text-gray-300' : 'text-gray-600'
						}`}
					>
						{message}
					</p>

					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={onCancel}
							className="px-4"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={onConfirm}
							className="px-4 gap-2"
						>
							<Trash2 className="w-4 h-4" />
							Delete
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
