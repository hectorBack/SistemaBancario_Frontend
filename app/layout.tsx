// app/layout.tsx
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RSG Online Banking',
  description: 'Examen Técnico Red Sinergia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        {/* El Navbar vive aquí, arriba del contenido principal */}
        <Navbar />
        
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
