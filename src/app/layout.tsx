import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Metadata } from 'next';
import Head from 'next/head';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Inventario piedras',
  description:
    'Aplicativo interno para manejo de inventario de piedras y metales',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='notranslate' translate='no'>
      <Head>
        <meta name='google' content='notranslate' />
        <meta name='robots' content='notranslate'></meta>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
