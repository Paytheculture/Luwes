import { Playfair_Display, Outfit } from 'next/font/google';
import "./globals.css";

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: "Luwes Dekorasi — Admin",
  description: "Panel admin pemesanan dekorasi pelaminan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${playfair.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
