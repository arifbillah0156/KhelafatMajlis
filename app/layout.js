import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.khelafatmajliswpr.com"),

  title: {
    default: "খেলাফত মজলিস",
    template: "%s | খেলাফত মজলিস",
  },

  description: "ব্যক্তিগত তৎপরতার রিপোর্ট",

  authors: [
    {
      name: "Arif Billah",
    },
  ],

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
    description: "ব্যক্তিগত তৎপরতার রিপোর্ট",
    url: "https://www.khelafatmajliswpr.com",
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

  twitter: {
    card: "summary_large_image",
    title: "খেলাফত মজলিস",
    description: "ব্যক্তিগত তৎপরতার রিপোর্ট",
    images: ["/Khelafat_Majlis_logo.jpg"],
  },

  alternates: {
    canonical: "https://www.khelafatmajliswpr.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}