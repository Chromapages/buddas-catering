import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/context/auth";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const SITE_URL = "https://buddascatering.com";
const OG_IMAGE = `${SITE_URL}/images/occasions/staff-lunch.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Buddas Catering | Premium Hawaiian Corporate Catering in Utah",
    template: "%s | Buddas Catering",
  },
  description:
    "From breakfast meetings to all-hands lunches. Zero stress, reliable delivery, and food your team actually wants to eat. Serving Utah County.",
  keywords: [
    "corporate catering Utah",
    "Hawaiian catering Utah County",
    "office lunch delivery Provo",
    "catering Pleasant Grove UT",
    "team lunch catering",
    "breakfast catering Utah",
  ],
  authors: [{ name: "Buddas Hawaiian Bakery & Grill" }],
  creator: "Buddas Hawaiian Bakery & Grill",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Buddas Catering",
    title: "Buddas Catering | Premium Hawaiian Corporate Catering in Utah",
    description:
      "From breakfast meetings to all-hands lunches. Zero stress, reliable delivery, and food your team actually wants to eat. Serving Utah County.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Buddas Catering – Hawaiian corporate catering in Utah County",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buddas Catering | Premium Hawaiian Corporate Catering in Utah",
    description:
      "Zero stress catering for Utah County teams. Hawaiian-inspired menus, reliable delivery.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Buddas Hawaiian Bakery & Grill",
              "image": `${SITE_URL}/images/occasions/staff-lunch.png`,
              "@id": SITE_URL,
              "url": SITE_URL,
              "telephone": "+1-801-404-1234",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Island Way",
                "addressLocality": "Pleasant Grove",
                "addressRegion": "UT",
                "postalCode": "84062",
                "addressCountry": "US"
              },
              "servesCuisine": "Hawaiian",
              "priceRange": "$$",
              "areaServed": "Utah County"
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.indexOf('Failed to load chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  window.location.reload(true);
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.indexOf('Failed to load chunk') !== -1 || e.reason.message.indexOf('ChunkLoadError') !== -1)) {
                  window.location.reload(true);
                }
              });
            `
          }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col font-body bg-cream text-brown selection:bg-teal-base/30"
        suppressHydrationWarning
      >
        <AuthProvider>
          <QueryProvider>
            <Toaster 
              position="top-right" 
              toastOptions={{
                className: "font-body text-sm text-brown",
                style: {
                  background: '#ffffff',
                  border: '1px solid #E5E5E5', 
                }
              }} 
            />
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

