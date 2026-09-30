import type { Metadata } from 'next';
import { IBM_Plex_Mono, Outfit } from 'next/font/google';
import AppShell from '@/components/AppShell';
import { themeInitScript } from '@/libs/theme';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'AssetFlow',
  description: 'Employee Asset & Inventory Management System',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: the theme script may add "dark" before React loads
    <html lang="en" className={`${outfit.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
