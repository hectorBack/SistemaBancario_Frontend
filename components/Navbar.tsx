// components/Navbar.tsx
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Send, LogOut, Landmark } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // No mostramos el navbar si estamos en el login o raíz
  if (pathname === '/login' || pathname === '/') return null;

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Se finalizará su conexión segura.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // 1. Limpiar localStorage
      localStorage.clear();

      // 2. Borrar la Cookie para el Middleware
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // 3. Redirigir al login
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
    { name: 'Transferencias', href: '/transfer', icon: <Send size={18} /> },
  ];

  return (
    <nav className="bg-[#003366] text-white shadow-xl border-b-4 border-[#FFD700] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-sm shadow-md">
              <Landmark className="text-[#003366]" size={24} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl tracking-tighter">APP BANCARIA</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-200">Banco en Linea</span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex space-x-1 h-full items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  pathname === item.href 
                    ? 'bg-[#002244] text-white border-b-4 border-[#FFD700]' 
                    : 'text-blue-100 hover:bg-[#004080] hover:text-white border-b-4 border-transparent'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Botón Salir */}
          <div className="flex items-center">
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-600 text-white rounded-none border border-red-500/50 transition-all text-[10px] font-black uppercase tracking-tighter"
            >
              <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
              <span>Finalizar Sesión</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}