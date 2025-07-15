import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css'; // Ensure this path is correct
import { ThemeProvider } from '@/components';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'MongoDB Schema Designer',
	description: 'A tool for designing MongoDB schemas visually',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} antialiased`}>
				<CustomThemeProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						// disableTransitionOnChange
					>
						{children}
						<Toaster
							position="top-right"
							toastOptions={{
								duration: 3000,
								style: {
									background: 'var(--background)',
									color: 'var(--foreground)',
									border: '1px solid var(--border)',
								},
							}}
						/>
					</ThemeProvider>
				</CustomThemeProvider>
			</body>
		</html>
	);
}
