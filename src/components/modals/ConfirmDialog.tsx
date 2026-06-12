'use client';

import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { ConfirmDialogProps } from '@/types';

export default function ConfirmDialog({
	isOpen,
	title,
	message,
	position,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const { isDark } = useThemeContext();

	if (!isOpen) return null;

	const getDialogStyle = () => {
		if (position) {
			const dialogWidth = 320;
			const dialogHeight = 200;

			let left = position.x + 20;
			let top = position.y + 20;

			if (left + dialogWidth > window.innerWidth) {
				left = position.x - dialogWidth - 20;
			}
			if (top + dialogHeight > window.innerHeight) {
				top = position.y - dialogHeight - 20;
			}

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
		return {};
	};

	const dialogStyle = getDialogStyle();
	const isPositioned = position && Object.keys(dialogStyle).length > 0;

	return (
		<>
			<div
				className="fixed inset-0 bg-black/40 z-40"
				onClick={onCancel}
			/>

			<div
				className={`w-80 rounded-xl shadow-xl border z-50 ${
					isDark
						? 'bg-[#141414] border-[#262626] text-white'
						: 'bg-white border-[#e5e5e5] text-black'
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
				<div className="p-5 text-center">
					<div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-500">
						<AlertTriangle className="w-6 h-6" />
					</div>
					<h2 className="text-lg font-semibold mb-2 tracking-tight">
						{title}
					</h2>
					<p
						className={`text-sm mb-6 ${
							isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'
						}`}
					>
						{message}
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
							Confirm
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
