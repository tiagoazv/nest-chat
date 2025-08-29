import '../styles/globals.css';

export const metadata = {
  title: 'Chat App',
  description: 'Chat em tempo real com Tailwind e Socket.io',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body suppressHydrationWarning={true}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
