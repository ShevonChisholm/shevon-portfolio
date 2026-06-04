import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import MotionProvider from '@/components/MotionProvider';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export const metadata: Metadata = {
  title: "Shevon Chisholm | Full-Stack Engineer",
  description:
    "Full-stack engineer based in Jamaica specializing in React, Next.js, React Native, NestJS, TypeScript, APIs, authentication, payments, and production web and mobile applications.",
  publisher: "Shevon Chisholm",
  authors: [{ name: "Shevon Chisholm" }],
  creator: "Shevon Chisholm",
  robots: "index, follow",
  metadataBase: new URL("https://shevon-portfolio.vercel.app"),
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shevon Chisholm",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shevon Chisholm" />
      </head>
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
