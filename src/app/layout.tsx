import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { DataProvider } from '@/context/data-context';

export const metadata: Metadata = {
  title: 'CleanSheet',
  description: 'Clean, analyze, and transform your data with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
         <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DataProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
