import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Laporan SI-PAKAT',
  description: 'Laporan Sistem Informasi Pengelolaan Keamanan Aset TIK',
};

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
        {children}
    </div>
  );
}
