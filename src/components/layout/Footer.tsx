import React from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function Footer() {
	const { isDark } = useThemeContext();
	return (
		<footer
			className={`text-center py-8 border-t transition-colors relative z-10 ${
				isDark
					? 'border-white/10 text-gray-500'
					: 'border-gray-200 text-gray-600'
			}`}
		>
			© 2025 Manpreet Singh – Built with Next.js and Framer Motion.
		</footer>
	);
}
