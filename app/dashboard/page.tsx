"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "@/services/api";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import { TrendingUp, Landmark } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const savedUserId = localStorage.getItem("userId");

      if (!token || !savedUserId) {
        router.push("/login");
        return;
      }

      try {
        const result = await getDashboardData(parseInt(savedUserId));
        setData(result);
      } catch (error: any) {
        console.error("Error al cargar el dashboard:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          document.cookie =
            "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003366]"></div>
          <p className="text-[#003366] font-black text-xs uppercase tracking-widest">
            Sincronizando con el servidor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* 1. Header con Nombre Completo */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
            Bienvenido,{" "}
            <span className="text-blue-600">
              {data?.nombreUsuario ||
                localStorage.getItem("nombreCompleto") ||
                "Usuario"}
            </span>
          </h1>
          <p className="text-gray-600 font-medium italic">
            Estado actual de su patrimonio y cuentas
          </p>
        </div>

        <div className="bg-white px-6 py-3 rounded-none border-l-8 border-[#003366] shadow-md">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            Fecha de Operación
          </p>
          <p className="text-sm text-[#003366] font-black">
            {new Date()
              .toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-none border-t-4 border-[#003366] shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <Landmark size={20} className="text-[#003366]" />
              <h2 className="text-lg font-bold text-[#003366] uppercase tracking-wider">
                Detalle de Productos
              </h2>
            </div>
            <div className="p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-black uppercase border-b">
                    <th className="pb-3">Referencia de Cuenta</th>
                    <th className="pb-3 text-center">Último Movimiento</th>
                    <th className="pb-3 text-center">Divisa</th>
                    <th className="pb-3 text-right">Saldo Disponible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.cuentas.map((cuenta: any) => (
                    <tr
                      key={cuenta.numeroCuenta}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 font-bold text-gray-700 font-mono tracking-tight">
                        {cuenta.numeroCuenta}
                      </td>

                      {/* CELDA DE FECHA */}
                      <td className="py-4 text-center">
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-sm uppercase">
                          {cuenta.fechaUltimaTransferencia
                            ? new Date(
                                cuenta.fechaUltimaTransferencia,
                              ).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              })
                            : "Sin movimientos"}
                        </span>
                      </td>

                      <td className="py-4 text-center">
                        <span className="px-3 py-1 bg-[#003366] text-white rounded-none text-[10px] font-black">
                          {cuenta.moneda}
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-[#003366] text-xl">
                        $
                        {cuenta.saldo.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-none border-t-4 border-gray-800 shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-8 border-b pb-2 flex items-center gap-2">
            <TrendingUp size={18} /> Balance Mensual
          </h2>
          <div className="w-full flex justify-center">
            <ExpenseChart dataMap={data?.historialGrafico || {}} />
          </div>
          <div className="mt-10 p-4 bg-gray-50 border-l-4 border-gray-800 text-[10px] text-gray-500 uppercase font-black leading-relaxed tracking-widest">
            Información auditada. Los valores reflejan transacciones confirmadas
            en tiempo real.
          </div>
        </section>
      </div>
    </main>
  );
}
