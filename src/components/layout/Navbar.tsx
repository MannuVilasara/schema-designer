'use client';
import React from 'react';
import { Database, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useThemeContext } from '@/contexts/ThemeContext';

interface NavbarProps {
	scrollY?: number;
}

export default function Navbar({ scrollY = 0 }: NavbarProps) {
	const { isDark, toggleTheme } = useThemeContext();

	return (
		<nav
			className={`fixed top-0 w-full z-50 transition-all duration-200 ${
				scrollY > 50
					? isDark
						? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#262626]'
						: 'bg-white/90 backdrop-blur-md border-b border-[#e5e5e5]'
					: 'bg-transparent'
			}`}
		>
			<div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2">
					<Database
						className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`}
					/>
					<span
						className={`font-semibold text-sm tracking-tight ${isDark ? 'text-white' : 'text-black'}`}
					>
						Schema Designer
					</span>
				</Link>

				{/* Right */}
				<div className="flex items-center gap-3">
					{/* Theme Toggle */}
					<button
						onClick={toggleTheme}
						className={`p-2 rounded-lg transition-colors ${
							isDark
								? 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
								: 'text-[#737373] hover:text-black hover:bg-[#f5f5f5]'
						}`}
						title={
							isDark
								? 'Switch to light mode'
								: 'Switch to dark mode'
						}
					>
						{isDark ? (
							<Sun className="w-4 h-4" />
						) : (
							<Moon className="w-4 h-4" />
						)}
					</button>

					<Link
						href="/designer"
						className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							isDark
								? 'bg-white text-black hover:bg-[#e5e5e5]'
								: 'bg-black text-white hover:bg-[#1a1a1a]'
						}`}
					>
						Open Designer
					</Link>
				</div>
			</div>
		</nav>
	);
}
