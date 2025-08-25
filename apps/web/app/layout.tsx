import './globals.css';

export const metadata = { title: 'woo-chatbot' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-white text-neutral-900">{children}</body>
    </html>
  );
}
