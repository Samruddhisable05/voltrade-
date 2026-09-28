import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../lib/context';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'VoltTrade — Peer-to-Peer Renewable Energy Trading Platform',
  description: 'Connect IoT smart meters, INA219 sensors, AI dynamic pricing, and blockchain transaction verification for renewable microgrids.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AppProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>VoltTrade Microgrid Platform • ESP32 + INA219 + SSD1306 + Relay + EVM Blockchain</p>
                <p className="text-emerald-400 font-mono">Hackathon MVP Edition</p>
              </div>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
