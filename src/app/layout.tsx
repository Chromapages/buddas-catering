import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/context/auth";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["500", "600"], // PRD explicitly says never bold (700)
  variable: "--font-poppins",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buddas Catering | Premium Hawaiian Corporate Catering in Utah",
  description: "From breakfast meetings to all-hands lunches. Zero stress, reliable delivery, and food your team actually wants to eat. Servicing Utah County.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
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

