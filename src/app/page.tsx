'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	Github,
	Play,
	Database,
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
	const { isDark } = useThemeContext();
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
		show: { transition: { staggerChildren: 0.1 } },
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 relative overflow-hidden flex flex-col ${
				isDark
					? 'bg-[#0a0a0a] text-[#ededed]'
					: 'bg-white text-[#171717]'
			}`}
		>
			<Navbar scrollY={scrollY} />

			<main className="flex-1 relative z-10 flex flex-col items-center justify-center pt-32 pb-16">
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					animate="show"
					className="max-w-3xl mx-auto text-center px-4 relative"
				>
					<motion.h1
						variants={fadeUp}
						className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
					>
						Database Schema
						<span className="block mt-2 text-[#737373]">
							Designer
						</span>
					</motion.h1>
					
					<motion.p
						variants={fadeUp}
						className={`text-lg max-w-xl mx-auto mb-10 ${
							isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'
						}`}
					>
						A minimal, Excalidraw-like canvas for designing PostgreSQL and MongoDB schemas visually.
					</motion.p>
					
					<motion.div
						variants={fadeUp}
						className="flex flex-col sm:flex-row justify-center gap-4"
					>
						<button
							onClick={handleStartDesigning}
							className="px-6 py-3 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity flex items-center justify-center"
						>
							<Play className="w-4 h-4 mr-2" />
							Open Designer
						</button>
						<Link
							href="https://github.com/MannuVilasara/schema-designer"
							target="_blank"
							rel="noopener noreferrer"
						>
							<button
								className={`px-6 py-3 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center w-full ${
									isDark
										? 'border-[#262626] hover:bg-[#1a1a1a] text-[#ededed]'
										: 'border-[#e5e5e5] hover:bg-[#f5f5f5] text-[#171717]'
								}`}
							>
								<Github className="w-4 h-4 mr-2" />
								GitHub
							</button>
						</Link>
					</motion.div>
				</motion.section>

				<motion.section
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="max-w-5xl mx-auto mt-32 px-4 w-full"
				>
					<div className="grid md:grid-cols-3 gap-6">
						{[
							{ icon: Database, title: 'Multi-Database', desc: 'Support for Postgres and MongoDB' },
							{ icon: Link2, title: 'Visual Relations', desc: 'Drag to connect entities' },
							{ icon: Download, title: 'Export JSON', desc: 'Save schemas locally' },
							{ icon: Shield, title: 'Type Safety', desc: 'Database-specific types' },
							{ icon: Cpu, title: 'Local First', desc: 'Works offline in browser' },
							{ icon: Globe, title: 'Open Source', desc: 'Free forever' },
						].map((f) => (
							<motion.div
								key={f.title}
								variants={fadeUp}
								className={`border p-6 rounded-xl transition-colors ${
									isDark
										? 'border-[#262626] bg-[#141414]'
										: 'border-[#e5e5e5] bg-[#fafafa]'
								}`}
							>
								<f.icon className="w-5 h-5 mb-4 text-[#737373]" />
								<h3 className="text-base font-semibold mb-2">
									{f.title}
								</h3>
								<p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-[#737373]'}`}>
									{f.desc}
								</p>
							</motion.div>
						))}
					</div>
				</motion.section>
			</main>

			<Footer />
		</div>
	);
}
