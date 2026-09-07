import "./globals.css";

export const metadata = {
  title: "Luwes Dekorasi — Admin",
  description: "Panel admin pemesanan dekorasi pelaminan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
