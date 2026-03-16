"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api";
import { Lock, User, Landmark } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(formData.username, formData.password);
      
      // Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("nombreCompleto", data.nombreCompleto);
      localStorage.setItem("userId", data.id.toString());

      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      await Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Sesión iniciada como ${data.username}`,
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/dashboard");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error de acceso",
        text: error.response?.data?.message || "Credenciales inválidas",
        confirmButtonColor: "#003366",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* LOGO / HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-[#003366] text-white rounded-none shadow-xl mb-4">
            <Landmark size={40} />
          </div>
          <h1 className="text-4xl font-black text-[#003366] uppercase tracking-tighter">
            APP<span className="text-gray-400">BANCARIA</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">
            Sistema de Gestión Bancaria
          </p>
        </div>

        {/* CARD DE LOGIN */}
        <div className="bg-white rounded-none border-t-8 border-[#003366] shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* USUARIO */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="text"
                  required
                  placeholder="USUARIO123"
                  className="w-full p-3 pl-10 bg-gray-50 border-b-2 border-gray-200 focus:border-[#003366] outline-none font-bold text-gray-700 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-3 pl-10 bg-gray-50 border-b-2 border-gray-200 focus:border-[#003366] outline-none font-bold text-gray-700 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* BOTÓN ENTRAR */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 font-black uppercase tracking-[0.2em] text-sm shadow-lg transition-all ${
                loading 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-[#003366] text-white hover:bg-blue-900 active:scale-95"
              }`}
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Protección de datos mediante cifrado AES-256
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}