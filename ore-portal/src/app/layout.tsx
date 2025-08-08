import type { Metadata } from "next";
import "../styles/globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ore Portal",
  description: "Market data, prices, news, and reports for Manganese, Copper, Iron, Tin, and Chrome ores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-3 flex gap-6 items-center">
            <Link href="/" className="font-semibold text-lg">Ore Portal</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/commodities">Commodities</Link>
              <Link href="/articles">Articles</Link>
              <Link href="/reports">Reports</Link>
              <Link href="/widget">Widget</Link>
              <Link href="/agent">AI Agent</Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
        <footer className="border-t bg-white mt-8">
          <div className="container mx-auto px-4 py-6 text-sm text-gray-500">© {new Date().getFullYear()} Ore Portal</div>
        </footer>
      </body>
    </html>
  );
}
