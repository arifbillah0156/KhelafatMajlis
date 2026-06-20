import Head from 'next/head'

import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html>
      <Head>
        <meta name="viewport" content="width=1024" />
      </Head>
      <body>{children}</body>
    </html>
  );
}