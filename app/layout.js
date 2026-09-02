import { Providers } from "@shared/providers/providers";
import "@/app/globals.css";

export const metadata = {
  title: "RIFAH Connect",
  description: "RIFAH Chamber of Commerce & Industries digital networking, membership and lead-generation ecosystem.",
  authors: [{ name: "RIFAH Chamber of Commerce & Industries" }],
  openGraph: {
    title: "RIFAH Connect",
    description: "RIFAH Chamber of Commerce & Industries digital networking, membership and lead-generation ecosystem.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
