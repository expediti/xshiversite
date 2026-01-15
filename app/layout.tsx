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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

              {/* TELEGRAM */}
              <a
                href="https://t.me/Xshiverr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50 text-lg font-semibold text-slate-200 hover:text-blue-400 transition-all duration-300 hover:scale-105"
              >
                <svg
                  className="w-7 h-7 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0z" />
                </svg>
                Join Telegram
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/xshiverr?igsh=MWhmemZ1OHhteWN4Zw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50 text-lg font-semibold text-slate-200 hover:text-pink-400 transition-all duration-300 hover:scale-105"
              >
                <svg
                  className="w-7 h-7 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2z" />
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
