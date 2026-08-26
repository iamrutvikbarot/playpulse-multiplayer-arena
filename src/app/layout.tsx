import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PlayPulse — Multiplayer Mini-Games Arena',
  description: 'Play instant real-time multiplayer games with friends! Tic-Tac-Toe, RPS Battle, Ludo, Card Battle, and Mini Racing.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-[#080A12] text-[#F5F7FF] font-sans antialiased select-none overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
