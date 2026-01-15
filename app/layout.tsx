import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xshiver - Video Explorer",
  description: "Minimal video discovery site with search and categories."
};

export default function RootLayout({
  children
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
        
        {/* XSHIVER TELEGRAM FOOTER */}
        <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50 sticky bottom-0 z-50 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <svg className="w-7 h-7 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.248-1.349-.745-1.285-1.89.065-.643.746-1.515 2.055-2.484 1.057-.79 1.824-1.435 2.5-2.53.3-.463.225-.934.003-1.137l-2.1-.886a7.49 7.49 0 0 0-3.208-.24c-1.313.24-2.282.894-2.952 1.92-.135.18-.27.373-.421.572-.344.452-.66.91-1.054 1.289-.134.132-.283.243-.428.36-.552.443-.958.873-1.101 1.439-.143.566-.112 1.219.498 1.72 1.646 1.35 5.726 4.022 11.309 6.7 1.957 0 3.42-.732 4.46-2.276 2.16-3.17 3.043-6.526 3.641-9.355.065-.37.016-.762-.174-1.083a1.216 1.216 0 0 0-.882-.4c-.233.02-.461.054-.668.14-.603.17-1.24.715-1.127 1.359.16.838-.288 1.612-.829 2.12-.538.505-.989.838-1.703.938-.147.02-.29.03-.433.03-.828.004-1.61-.525-1.945-.835-.18-.17-.255-.383-.225-.584.1-.658.717-1.127 1.591-1.476.204-.08.41-.147.619-.205.12-.033.242-.064.366-.092z"/>
                </svg>
                <a 
                  href="https://t.me/Xshiverr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-slate-200 hover:text-blue-400 transition-all duration-300 hover:underline"
                >
                  Join XShiver on Telegram 🚀
                </a>
              </div>
            </div>
            <div className="border-t border-slate-700/50 pt-4">
              <p className="text-slate-500 text-sm">
                © 2026 XShiver. All rights reserved. | 
                <a href="https://t.me/Xshiverr" className="ml-2 text-blue-400 hover:text-blue-300 font-medium">t.me/Xshiverr</a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
