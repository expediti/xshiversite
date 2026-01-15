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
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.13 8.46c-.2 2.14-.9 6.02-1.26 8.3-.15.93-.53 1.24-.87 1.27-.71.07-1.25-.46-1.94-.91-1.09-.7-1.7-1.14-2.76-1.83-1.22-.79-.43-1.22.27-1.92.19-.18 3.34-3.06 3.4-3.32.01-.04.02-.16-.06-.23s-.18-.04-.26-.02c-.11.02-1.85 1.17-5.22 3.41-.5.34-.95.51-1.35.5-.44-.01-1.29-.25-1.92-.45-.78-.26-1.4-.78-1.33-1.97.07-.67.77-1.58 2.12-2.6 3.85-2.94 6.43-4.87 7.74-5.78.63-.44 1.2-.82 1.69-.59.29.13.45.38.47.7z" />
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
                  <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.88a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26z" />
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
