import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xshiver - Video Explorer",
  description: "Minimal video discovery site with search and categories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-K5PXH0YEB7"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K5PXH0YEB7');
            `,
          }}
        />

        {children}

        {/* SOCIAL FOOTER */}
<footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50 py-6 mt-12">
  <div className="max-w-6xl mx-auto px-4 text-center">

    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">

      {/* TELEGRAM */}
      <a
        href="https://t.me/Xshiverr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-3 bg-slate-800/60 rounded-xl border border-slate-700 text-lg font-semibold text-slate-200 hover:text-blue-400 transition-all duration-300 hover:scale-105"
      >
        {/* Telegram Icon */}
        <svg
          className="w-6 h-6 text-blue-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.8 8.1-1.7 8.1c-.12.57-.45.7-.9.43l-2.5-1.84-1.2 1.15c-.13.13-.24.24-.5.24l.18-2.56 4.65-4.2c.2-.18-.04-.28-.3-.1l-5.75 3.62-2.48-.77c-.54-.17-.55-.54.11-.8l9.7-3.74c.45-.16.85.1.7.76z"/>
        </svg>

        Join Telegram
      </a>

      {/* INSTAGRAM */}
      <a
        href="https://www.instagram.com/xshiverr?igsh=MWhmemZ1OHhteWN4Zw=="
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-3 bg-slate-800/60 rounded-xl border border-slate-700 text-lg font-semibold text-slate-200 hover:text-pink-400 transition-all duration-300 hover:scale-105"
      >
        {/* Instagram Icon */}
        <svg
          className="w-6 h-6 text-pink-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.88a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26z"/>
        </svg>

        Join Instagram
      </a>

    </div>
  </div>
</footer>


      </body>
    </html>
  );
}
