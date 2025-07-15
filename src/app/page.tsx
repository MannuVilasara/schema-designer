'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	Github,
	Play,
	Database,
	Zap,
	Users,
	Sparkles,
	Link2,
	Download,
	Shield,
	Globe,
	Cpu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function LandingPage() {
	const [scrollY, setScrollY] = useState(0);
	const { isDark, toggleTheme } = useThemeContext();
	const router = useRouter();

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleStartDesigning = () => {
		router.push('/designer');
	};

	const fadeUp = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const staggerContainer = {
		hidden: {},
		show: { transition: { staggerChildren: 0.2 } },
	};

	// Simplified animated background particles (reduced from 6 to 2)
	const particles = Array.from({ length: 2 }, (_, i) => ({
		id: i,
		size: 60 + i * 20,
		x: 20 + i * 60,
		y: 30 + i * 40,
		duration: 12 + i * 6,
		delay: i * 2,
	}));

	const counters = {
		users: 1200,
		schemas: 300,
		downloads: 500,
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
				isDark
					? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white'
					: 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900'
			}`}
		>
			{/* Lightweight Animated Background */}
			<div className="fixed inset-0 pointer-events-none z-0">
				{/* Single gradient orb - simplified */}
				<motion.div
					className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${
						isDark ? 'bg-blue-500' : 'bg-blue-300'
					}`}
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 30, 0],
						y: [0, -20, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>

				{/* Minimal floating particles */}
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						className={`absolute rounded-full opacity-5 ${
							isDark ? 'bg-white' : 'bg-gray-400'
						}`}
						style={{
							width: particle.size,
							height: particle.size,
							left: `${particle.x}%`,
							top: `${particle.y}%`,
						}}
						animate={{
							y: [0, -30, 0],
							opacity: [0.05, 0.08, 0.05],
						}}
						transition={{
							duration: particle.duration,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: particle.delay,
						}}
					/>
				))}
			</div>

			{/* Navigation */}
			<Navbar scrollY={scrollY} />

			{/* Hero */}
			<main className="pt-20 relative z-10">
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					animate="show"
					className="max-w-4xl mx-auto text-center py-24 px-4 relative"
				>
					{/* Simplified hero floating elements */}
					<motion.div
						className={`absolute -top-10 -right-10 w-16 h-16 rounded-full opacity-10 ${
							isDark
								? 'bg-gradient-to-r from-blue-400 to-purple-400'
								: 'bg-gradient-to-r from-blue-300 to-purple-300'
						}`}
						animate={{
							rotate: [0, 360],
							scale: [1, 1.1, 1],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: 'linear',
						}}
					/>
					<motion.div
						variants={fadeUp}
						className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border backdrop-blur-sm transition-colors ${
							isDark
								? 'border-white/10 bg-white/5 text-gray-300'
								: 'border-gray-200 bg-white/80 text-gray-600'
						}`}
					>
						<Sparkles className="w-4 h-4" />
						<span>Free & Open Source</span>
					</motion.div>
					<motion.h1
						variants={fadeUp}
						className="text-5xl md:text-7xl font-bold mb-6"
					>
						Visual MongoDB
						<span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
							Schema Designer
						</span>
					</motion.h1>
					<motion.p
						variants={fadeUp}
						className={`text-xl max-w-2xl mx-auto mb-8 transition-colors ${
							isDark ? 'text-gray-400' : 'text-gray-600'
						}`}
					>
						Create, visualize, and manage your MongoDB schemas with
						a clean drag-and-drop interface.
					</motion.p>
					<motion.div
						variants={fadeUp}
						className="flex flex-col sm:flex-row justify-center gap-4"
					>
						<motion.button
							onClick={handleStartDesigning}
							className="px-8 py-3 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition text-white flex items-center justify-center relative overflow-hidden group"
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
						>
							<motion.div
								className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
								initial={{ x: '-100%' }}
								whileHover={{ x: '100%' }}
								transition={{ duration: 0.6 }}
							/>
							<Play className="w-5 h-5 mr-2 relative z-10" />
							<span className="relative z-10">
								Start Designing
							</span>
						</motion.button>
						<Link
							href="https://github.com/MannuVilasara/schema-designer"
							target="_blank"
							rel="noopener noreferrer"
						>
							<motion.button
								className={`px-8 py-3 rounded border transition flex items-center justify-center relative overflow-hidden group ${
									isDark
										? 'border-white/20 hover:bg-white/10 text-white'
										: 'border-gray-300 hover:bg-gray-100 text-gray-900'
								}`}
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
							>
								<Github className="w-5 h-5 mr-2" />
								View on GitHub
							</motion.button>
						</Link>
					</motion.div>
				</motion.section>

				{/* Stats */}
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto py-12 px-4 relative z-10"
				>
					{[
						{
							icon: Users,
							label: 'Active Users',
							value: counters.users,
							color: 'blue',
						},
						{
							icon: Database,
							label: 'Schemas Created',
							value: counters.schemas,
							color: 'purple',
						},
						{
							icon: Download,
							label: 'Downloads',
							value: counters.downloads,
							color: 'cyan',
						},
					].map((stat, index) => (
						<motion.div
							key={stat.label}
							variants={fadeUp}
							className={`rounded-2xl border backdrop-blur-sm p-6 text-center transition-all duration-300 group cursor-pointer ${
								isDark
									? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
									: 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white hover:shadow-lg'
							}`}
							whileHover={{
								scale: 1.05,
								y: -5,
								transition: { duration: 0.2 },
							}}
						>
							<motion.div
								className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
									stat.color === 'blue'
										? isDark
											? 'bg-blue-500/20'
											: 'bg-blue-100'
										: stat.color === 'purple'
											? isDark
												? 'bg-purple-500/20'
												: 'bg-purple-100'
											: isDark
												? 'bg-cyan-500/20'
												: 'bg-cyan-100'
								}`}
								whileHover={{ rotate: [0, -10, 10, 0] }}
								transition={{ duration: 0.5 }}
							>
								<stat.icon
									className={`w-6 h-6 ${
										stat.color === 'blue'
											? isDark
												? 'text-blue-400'
												: 'text-blue-600'
											: stat.color === 'purple'
												? isDark
													? 'text-purple-400'
													: 'text-purple-600'
												: isDark
													? 'text-cyan-400'
													: 'text-cyan-600'
									}`}
								/>
							</motion.div>
							<div className="text-3xl font-bold">
								{stat.value}+
							</div>
							<div
								className={`transition-colors group-hover:scale-105 ${
									isDark
										? 'text-gray-400 group-hover:text-gray-300'
										: 'text-gray-600 group-hover:text-gray-500'
								}`}
							>
								{stat.label}
							</div>
						</motion.div>
					))}
				</motion.section>

				{/* Features */}
				<motion.section
					id="features"
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="max-w-6xl mx-auto py-24 px-4 relative z-10"
				>
					<motion.div variants={fadeUp} className="text-center mb-16">
						<div
							className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border backdrop-blur-sm transition-colors ${
								isDark
									? 'border-white/10 bg-white/5 text-gray-300'
									: 'border-gray-200 bg-white/80 text-gray-600'
							}`}
						>
							<Zap className="w-4 h-4" />
							<span>Features</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold">
							Everything You Need
						</h2>
					</motion.div>
					<div className="grid md:grid-cols-3 gap-6">
						{[
							{ icon: Database, title: 'Visual Design' },
							{ icon: Link2, title: 'Relationships' },
							{ icon: Download, title: 'Export & Import' },
							{ icon: Shield, title: 'Type Safety' },
							{ icon: Cpu, title: 'Performance' },
							{ icon: Globe, title: 'Cross-Platform' },
						].map((f) => (
							<motion.div
								key={f.title}
								variants={fadeUp}
								whileHover={{
									scale: 1.05,
									y: -8,
									transition: { duration: 0.2 },
								}}
								className={`border backdrop-blur-sm p-6 rounded-2xl transition-colors cursor-pointer ${
									isDark
										? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white hover:shadow-lg'
								}`}
							>
								<f.icon
									className={`w-6 h-6 mb-4 transition-colors ${
										isDark
											? 'text-purple-400'
											: 'text-purple-600'
									}`}
								/>
								<h3
									className={`text-xl font-semibold transition-colors ${
										isDark ? 'text-white' : 'text-gray-900'
									}`}
								>
									{f.title}
								</h3>
							</motion.div>
						))}
					</div>
				</motion.section>
			</main>

			<Footer />
		</div>
	);
}
