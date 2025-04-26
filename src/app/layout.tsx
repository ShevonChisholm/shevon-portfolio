import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import MotionProvider from '@/components/MotionProvider';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export const metadata: Metadata = {
  title: 'Shevon - Full Stack Developer',
  description: 'Full-stack developer specializing in React, Next.js, Node.js, and React Native. Creating innovative web and mobile solutions.',
  keywords: ['Full Stack Developer', 'React Developer', 'Next.js', 'Node.js', 'React Native', 'Web Development'],
  authors: [{ name: 'Shevon Chisholm' }],
  creator: 'Shevon Chisholm',
  publisher: 'Shevon Chisholm',
  robots: 'index, follow',
  metadataBase: new URL('https://shevon-portfolio.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: 'https://shevon-portfolio.vercel.app',
    title: 'Shevon - Full Stack Developer',
    description: 'Full-stack developer specializing in React, Next.js, Node.js, and React Native. Creating innovative web and mobile solutions.',
    siteName: 'Shevon Chisholm Portfolio',
    images: [{
      url: '/my-logo.png',
      width: 80,
      height: 80,
      alt: 'Shevon Chisholm - Full Stack Developer'
    }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Shevon - Full Stack Developer',
    description: 'Full-stack developer specializing in React, Next.js, Node.js, and React Native. Creating innovative web and mobile solutions.',
    images: [{
      url: '/my-logo.png',
      width: 80,
      height: 80,
      alt: 'Shevon Chisholm - Full Stack Developer'
    }],
    creator: '@shevonchisholm',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <MotionProvider>
            {children}
            <ScrollToTop />
          </MotionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
