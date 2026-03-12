import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classified President Radar',
  description: 'Track and explore political radar data',
  openGraph: {
    title: 'Classified President Radar',
    description: 'Track and explore political radar data',
    siteName: 'Classified President Radar',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Classified President Radar',
    description: 'Track and explore political radar data',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
