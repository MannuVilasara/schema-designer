import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Schema Designer — Visual Database Schema Design',
	description:
		'A minimal, visual schema designer for PostgreSQL and MongoDB. Create, edit, and export database schemas with a clean drag-and-drop canvas.',
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
					{children}
					<Toaster
						position="bottom-center"
						toastOptions={{
							duration: 2500,
							style: {
								background: 'var(--card)',
								color: 'var(--foreground)',
								border: '1px solid var(--border)',
								borderRadius: '8px',
								fontSize: '13px',
								padding: '10px 16px',
							},
						}}
					/>
				</CustomThemeProvider>
			</body>
		</html>
	);
}
