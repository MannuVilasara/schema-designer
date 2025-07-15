'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	Heart,
	Mail,
	Github,
	Twitter,
	MessageSquare,
	Send,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function ContactPage() {
	const [scrollY, setScrollY] = useState(0);
	const { isDark } = useThemeContext();

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const fadeUp = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const staggerContainer = {
		hidden: {},
		show: { transition: { staggerChildren: 0.2 } },
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
				isDark
					? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white'
					: 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900'
			}`}
		>
			<Navbar scrollY={scrollY} />

			{/* Main Content */}
			<main className="pt-20 relative z-10">
				{/* Hero Section */}
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					animate="show"
					className="max-w-4xl mx-auto text-center py-24 px-4"
				>
					<motion.div variants={fadeUp} className="mb-16">
						<div
							className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border backdrop-blur-sm transition-colors ${
								isDark
									? 'border-white/10 bg-white/5 text-gray-300'
									: 'border-gray-200 bg-white/80 text-gray-600'
							}`}
						>
							<Heart className="w-4 h-4" />
							<span>Get In Touch</span>
						</div>
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Let's Connect
						</h1>
						<p
							className={`text-xl max-w-2xl mx-auto ${
								isDark ? 'text-gray-400' : 'text-gray-600'
							}`}
						>
							Have questions about SchemaDesigner? Want to
							contribute or report a bug? We'd love to hear from
							you!
						</p>
					</motion.div>
				</motion.section>

				{/* Contact Methods */}
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="max-w-6xl mx-auto py-12 px-4 relative z-10"
				>
					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: Github,
								title: 'GitHub Issues',
								description:
									'Report bugs, request features, or contribute to the project',
								action: 'Visit Repository',
								color: 'blue',
							},
							{
								icon: Mail,
								title: 'Email Support',
								description:
									'Get in touch for general inquiries and business partnerships',
								action: 'Send Email',
								color: 'green',
							},
							{
								icon: MessageSquare,
								title: 'Community Forum',
								description:
									'Join discussions, share schemas, and get help from the community',
								action: 'Join Discussion',
								color: 'purple',
							},
						].map((contact, index) => (
							<motion.div
								key={contact.title}
								variants={fadeUp}
								className={`border backdrop-blur-sm p-8 rounded-2xl text-center transition-all duration-300 ${
									isDark
										? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white hover:shadow-lg'
								}`}
								whileHover={{ scale: 1.02, y: -5 }}
								transition={{ duration: 0.2 }}
							>
								<motion.div
									className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
										contact.color === 'blue'
											? isDark
												? 'bg-blue-500/20 text-blue-400'
												: 'bg-blue-100 text-blue-600'
											: contact.color === 'green'
												? isDark
													? 'bg-green-500/20 text-green-400'
													: 'bg-green-100 text-green-600'
												: isDark
													? 'bg-purple-500/20 text-purple-400'
													: 'bg-purple-100 text-purple-600'
									}`}
									whileHover={{ rotate: [0, -10, 10, 0] }}
									transition={{ duration: 0.5 }}
								>
									<contact.icon className="w-8 h-8" />
								</motion.div>
								<h3 className="text-2xl font-bold mb-4">
									{contact.title}
								</h3>
								<p
									className={`mb-6 ${
										isDark
											? 'text-gray-400'
											: 'text-gray-600'
									}`}
								>
									{contact.description}
								</p>
								<motion.button
									className={`px-6 py-2 rounded-lg border transition-colors ${
										isDark
											? 'border-white/20 hover:bg-white/10 text-white'
											: 'border-gray-300 hover:bg-gray-100 text-gray-900'
									}`}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									{contact.action}
								</motion.button>
							</motion.div>
						))}
					</div>
				</motion.section>

				{/* Contact Form */}
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="max-w-2xl mx-auto py-24 px-4"
				>
					<motion.div variants={fadeUp} className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">
							Send us a Message
						</h2>
						<p
							className={`${
								isDark ? 'text-gray-400' : 'text-gray-600'
							}`}
						>
							Fill out the form below and we'll get back to you as
							soon as possible.
						</p>
					</motion.div>

					<motion.form
						variants={fadeUp}
						className={`border backdrop-blur-sm p-8 rounded-2xl ${
							isDark
								? 'border-white/10 bg-white/5'
								: 'border-gray-200 bg-white/80'
						}`}
					>
						<div className="grid md:grid-cols-2 gap-6 mb-6">
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDark
											? 'text-gray-300'
											: 'text-gray-700'
									}`}
								>
									First Name
								</label>
								<input
									type="text"
									className={`w-full px-4 py-3 rounded-lg border transition-colors ${
										isDark
											? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500'
											: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
									}`}
									placeholder="Your first name"
								/>
							</div>
							<div>
								<label
									className={`block text-sm font-medium mb-2 ${
										isDark
											? 'text-gray-300'
											: 'text-gray-700'
									}`}
								>
									Last Name
								</label>
								<input
									type="text"
									className={`w-full px-4 py-3 rounded-lg border transition-colors ${
										isDark
											? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500'
											: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
									}`}
									placeholder="Your last name"
								/>
							</div>
						</div>

						<div className="mb-6">
							<label
								className={`block text-sm font-medium mb-2 ${
									isDark ? 'text-gray-300' : 'text-gray-700'
								}`}
							>
								Email
							</label>
							<input
								type="email"
								className={`w-full px-4 py-3 rounded-lg border transition-colors ${
									isDark
										? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500'
										: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
								}`}
								placeholder="your.email@example.com"
							/>
						</div>

						<div className="mb-6">
							<label
								className={`block text-sm font-medium mb-2 ${
									isDark ? 'text-gray-300' : 'text-gray-700'
								}`}
							>
								Subject
							</label>
							<input
								type="text"
								className={`w-full px-4 py-3 rounded-lg border transition-colors ${
									isDark
										? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500'
										: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
								}`}
								placeholder="What's this about?"
							/>
						</div>

						<div className="mb-8">
							<label
								className={`block text-sm font-medium mb-2 ${
									isDark ? 'text-gray-300' : 'text-gray-700'
								}`}
							>
								Message
							</label>
							<textarea
								rows={6}
								className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
									isDark
										? 'border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500'
										: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
								}`}
								placeholder="Tell us more about your inquiry..."
							/>
						</div>

						<motion.button
							type="submit"
							className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition text-white flex items-center justify-center"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Send className="w-5 h-5 mr-2" />
							Send Message
						</motion.button>
					</motion.form>
				</motion.section>

				{/* Social Links */}
				<motion.section
					variants={staggerContainer}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="max-w-4xl mx-auto py-12 px-4 text-center"
				>
					<motion.div variants={fadeUp}>
						<h3 className="text-2xl font-bold mb-6">Follow Us</h3>
						<div className="flex justify-center space-x-6">
							{[
								{ icon: Github, label: 'GitHub' },
								{ icon: Twitter, label: 'Twitter' },
								{ icon: Mail, label: 'Email' },
							].map((social) => (
								<motion.button
									key={social.label}
									className={`p-4 rounded-full border transition-colors ${
										isDark
											? 'border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
											: 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
									}`}
									whileHover={{ scale: 1.1, y: -2 }}
									whileTap={{ scale: 0.95 }}
								>
									<social.icon className="w-6 h-6" />
								</motion.button>
							))}
						</div>
					</motion.div>
				</motion.section>
			</main>

			<Footer />
		</div>
	);
}
