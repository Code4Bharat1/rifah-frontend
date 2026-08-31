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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
