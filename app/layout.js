import { Providers } from "@shared/providers/providers";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
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

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        
        {/* Google Translate Global Script */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="google-translate-init">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
      </body>
    </html>
  );
}
