import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeContext';

export const metadata: Metadata = {
  title: 'Life RPG — Gamified Real-World Productivity Platform',
  description:
    'Transform everyday productivity into an immersive 3D virtual progression system. Non-linear level equations, strict server-side validation, 3D WebGL assets, and multi-theme aesthetic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-cyber-dark text-slate-100 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
