import "./globals.css";
import { Suspense } from "react";
import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeGateMenOnly from "@/components/AgeGateMenOnly";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import ComplianceBar from "@/components/ComplianceBar";
import ConciergeWidget from "@/components/ConciergeWidget";
import Link from "next/link";
import { LayoutModeProvider } from "@/components/LayoutModeProvider";
import { ToastProvider } from "@/components/Toast"; // HOTMESS ADD

export const metadata: Metadata = {
  metadataBase: new URL("https://hotmess.london"),
  title: "HOTMESS London",
  description:
    "Men-only queer ecosystem — care-first, bold, responsible. HNH MESS / Radio / Records / Care / Community / About / Legal.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HOTMESS London",
    description:
      "Care-first queer ecosystem: Radio · Records · Shop · Care · Community.",
    url: "https://hotmess.london",
    siteName: "HOTMESS London",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "HOTMESS London — Radio, Records, Shop, Care, Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOTMESS London",
    description: "Care-first queer ecosystem: Radio · Records · Shop · Care · Community.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const cspNonce = hdrs.get('x-hm-csp-nonce') || undefined;
  if (process.env.NEXT_SAFE_MODE) {
    return (
      <html lang="en">
        <body className="bg-black text-white font-sans">
          <div className="p-6 text-sm space-y-4">
            <h1 className="text-2xl font-semibold">HOTMESS (Safe Mode)</h1>
            <p>Dev server running in SAFE MODE. Heavy components disabled. Set NEXT_SAFE_MODE=0 or run <code>npm run dev</code> for full experience.</p>
            <nav className="space-x-4 text-red-400 underline">
              <Link href="/">Home</Link>
              <Link href="/qr">QR</Link>
              <Link href="/marketplace">Marketplace</Link>
            </nav>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="font-sans scroll-smooth">
        {/* Expose CSP nonce for client-injected scripts */}
        <meta name="csp-nonce" content={cspNonce} />
        {/* HOTMESS ADD: signed_out toast on redirect (must render outside client components to avoid hydration nonce mismatch) */}
        <script
          nonce={cspNonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var u=new URL(window.location.href);if(u.searchParams.get('signed_out')==='1'){window.dispatchEvent(new CustomEvent('hm:toast',{detail:{text:'Signed out'}}));u.searchParams.delete('signed_out');history.replaceState(null,'',u.toString())}}catch(e){}})();",
          }}
        />
        <LayoutModeProvider>
          <ToastProvider>{/* HOTMESS ADD: global toasts */}
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-red-600 text-white px-3 py-2 rounded">
            Skip to content
          </a>
          <AgeGateMenOnly />
          <Navbar />
          <ComplianceBar />
          <CookieBanner />
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          {/* Add top padding to avoid content hidden behind fixed Navbar */}
          <main id="main" className="min-h-screen pt-20 md:pt-24">
            {children}
          </main>
          <div className="mt-24 border-t border-neutral-800 text-center py-4 text-xs text-gray-500">
            18+ men-only • Consent required • Aftercare = information/services (not medical advice) • GDPR compliant
          </div>
          <Footer />
          <ConciergeWidget />
          </ToastProvider>
        </LayoutModeProvider>
        <script
          type="application/ld+json"
          nonce={cspNonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'HOTMESS London',
              url: 'https://hotmess.london'
            })
          }}
        />
      </body>
    </html>
  );
}
