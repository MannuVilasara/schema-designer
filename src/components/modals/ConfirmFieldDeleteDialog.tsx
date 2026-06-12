'use client';

import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { ConfirmFieldDeleteDialogProps } from '@/types';

export default function ConfirmFieldDeleteDialog({
	isOpen,
	fieldName,
	position,
	onConfirm,
	onCancel,
}: ConfirmFieldDeleteDialogProps) {
	const { isDark } = useThemeContext();

	const getModalStyle = () => {
		if (!position) return {};

		const modalWidth = 320;
		const modalHeight = 200;
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

	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-black/40"
				onClick={onCancel}
			/>

			<div
				className={`w-80 rounded-xl border shadow-xl z-50 ${
					isDark
						? 'bg-[#141414] border-[#262626] text-white'
						: 'bg-white border-[#e5e5e5] text-black'
				}`}
				style={
					position
						? getModalStyle()
						: {
								position: 'fixed',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}
				}
			>
				<div className="p-5 text-center">
					<div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-500">
						<AlertTriangle className="w-6 h-6" />
					</div>
					<h2 className="text-lg font-semibold mb-2 tracking-tight">
						Delete Field
					</h2>
					<p
						className={`text-sm mb-6 ${
							isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'
						}`}
					>
						Are you sure you want to delete the field{' '}
						<span className="font-semibold text-foreground">
							{fieldName}
						</span>
						? This action cannot be undone.
					</p>

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={onCancel}
							className="flex-1 h-10 border"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={onConfirm}
							className="flex-1 h-10"
						>
							Delete
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
