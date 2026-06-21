import "./globals.css";

export const metadata = {
  authors: [
    {
      name: "Arif Billah",
    },
  ],

  // ✅ ICONS FIXED (IMPORTANT PART)
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },


  openGraph: {
    title: "খেলাফত মজলিস",
    description:
      "ব্যক্তিগত তৎপরতার রিপোর্ট",
    siteName: "খেলাফত মজলিস",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/Khelafat_Majlis_logo.jpg",
        width: 1200,
        height: 630,
        alt: "খেলাফত মজলিস",
      },
    ],
  },

};


export default function RootLayout({ children }) {

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}