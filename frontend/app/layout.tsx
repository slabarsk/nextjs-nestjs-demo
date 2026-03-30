import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Next.js + Nest.js — Live Demo",
  description: "Next.js & Nest.js mimarisini gösteren interaktif demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
