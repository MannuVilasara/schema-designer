'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useThemeContext } from '@/contexts/ThemeContext';

interface NavbarProps {
	scrollY?: number;
}

export default function Navbar({ scrollY = 0 }: NavbarProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { isDark, toggleTheme } = useThemeContext();

	const navItems = [
		{ name: 'Features', href: '/#features' },
		{ name: 'How It Works', href: '/how-it-works' },
		{ name: 'Contact', href: '/contact' },
	];

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.6 }}
			className={`fixed top-0 w-full z-50 transition-all duration-300 ${
				scrollY > 50
					? isDark
						? 'bg-gray-950/90 backdrop-blur-md border-b border-white/10'
						: 'bg-white/90 backdrop-blur-md border-b border-gray-200'
					: 'bg-transparent'
			}`}
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2">
					<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
						<Database className="w-5 h-5 text-white" />
					</div>
					<span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
						SchemaDesigner
					</span>
				</Link>

				{/* Desktop Nav */}
				<div className="hidden md:flex items-center space-x-6">
					{navItems.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className={`transition-colors duration-200 ${
								isDark
									? 'text-gray-300 hover:text-white'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							{item.name}
						</Link>
					))}

					{/* Theme Toggle */}
					<motion.button
						onClick={toggleTheme}
						className={`p-2 rounded-lg transition-all duration-200 ${
							isDark
								? 'text-gray-300 hover:text-white hover:bg-white/10'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
						}`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						title={
							isDark
								? 'Switch to light mode'
								: 'Switch to dark mode'
						}
					>
						<AnimatePresence mode="wait">
							{isDark ? (
								<motion.div
									key="sun"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Sun className="w-5 h-5" />
								</motion.div>
							) : (
								<motion.div
									key="moon"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Moon className="w-5 h-5" />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>

					<Link
						href="/designer"
						className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition text-white"
					>
						Get Started
					</Link>
				</div>

				{/* Mobile Button */}
				<div className="md:hidden flex items-center space-x-2">
					{/* Mobile Theme Toggle */}
					<motion.button
						onClick={toggleTheme}
						className={`p-2 rounded-lg transition-all duration-200 ${
							isDark
								? 'text-gray-300 hover:text-white hover:bg-white/10'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
						}`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<AnimatePresence mode="wait">
							{isDark ? (
								<motion.div
									key="sun-mobile"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Sun className="w-5 h-5" />
								</motion.div>
							) : (
								<motion.div
									key="moon-mobile"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Moon className="w-5 h-5" />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className={`p-2 rounded-lg transition-colors ${
							isDark
								? 'text-gray-400 hover:text-white'
								: 'text-gray-600 hover:text-gray-900'
						}`}
					>
						{isMenuOpen ? (
							<X className="w-5 h-5" />
						) : (
							<Menu className="w-5 h-5" />
						)}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className={`md:hidden transition-all duration-300 ${
							isDark
								? 'bg-gray-950/90 border-t border-white/10'
								: 'bg-white/90 border-t border-gray-200'
						}`}
					>
						{navItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => setIsMenuOpen(false)}
								className={`block px-4 py-2 transition-colors ${
									isDark
										? 'text-gray-300 hover:text-white hover:bg-white/5'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}`}
							>
								{item.name}
							</Link>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
}
