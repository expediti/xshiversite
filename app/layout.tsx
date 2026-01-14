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
      </body>
    </html>
  );
}





























// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "Xshiver – Video Explorer",
//   description: "Minimal video discovery site with search and categories."
// };

// export default function RootLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
//         {children}
//       </body>
//     </html>
//   );
// }
