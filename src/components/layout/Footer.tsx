import React from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function Footer() {
	const { isDark } = useThemeContext();
	return (
		<footer
			className={`text-center py-6 text-xs tracking-wide ${
				isDark ? 'text-[#525252]' : 'text-[#a3a3a3]'
			}`}
		>
			© {new Date().getFullYear()} Manpreet Singh
		</footer>
	);
}
