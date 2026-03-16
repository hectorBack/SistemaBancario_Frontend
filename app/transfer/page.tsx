"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData, postTransferencia, getStats } from "@/services/api";
import {
  ArrowRightLeft,
  Trash2,
  PieChart as PieIcon,
  Table as TableIcon,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import Swal from "sweetalert2";

// --- INTERFACES ---
interface GrupoDestino {
  cuentaDestino: string;
  totalMonto: number;
}
interface GrupoOrigen {
  numeroCuentaOrigen: string;
  totalEgresos: number;
  cantidadOperaciones: number;
  ultimaCuentaDestino: string;
}
interface DashboardStats {
  transaccionesPorDestino: GrupoDestino[];
  transaccionesPorOrigen: GrupoOrigen[];
}
interface Cuenta {
  id: number;
  numeroCuenta: string;
  saldo: number;
  moneda: string;
}

const COLORS = ["#003366", "#005599", "#2563eb", "#60a5fa", "#93c5fd"];

export default function TransferPage() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    transaccionesPorDestino: [],
    transaccionesPorOrigen: [],
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cuentaOrigenId: "",
    cuentaDestino: "",
    monto: "",
    concepto: "",
  });

  // --- LÓGICA DE VALIDACIÓN ---
  const cuentaSeleccionada = cuentas.find(
    (c) => c.id.toString() === formData.cuentaOrigenId,
  );
  const montoNum = parseFloat(formData.monto);

  const errores = {
    montoInvalido: montoNum <= 0 || !formData.monto,
    saldoInsuficiente: cuentaSeleccionada
      ? montoNum > cuentaSeleccionada.saldo
      : false,
    montoExcedido: montoNum >= 100000,
    cuentaDestinoInvalida:
      formData.cuentaDestino.length !== 8 ||
      !/^\d+$/.test(formData.cuentaDestino),
    faltaConcepto: formData.concepto.trim().length < 3,
  };

  const esInvalido =
    !formData.cuentaOrigenId ||
    errores.montoInvalido ||
    errores.saldoInsuficiente ||
    errores.montoExcedido ||
    errores.cuentaDestinoInvalida ||
    errores.faltaConcepto;

  useEffect(() => {
    async function loadAllData() {
      const savedUserId = localStorage.getItem("userId");
      if (!savedUserId) return;

      try {
        setLoading(true);
        // Usamos el ID recuperado del login en lugar de 1
        const id = parseInt(savedUserId);
        const [data, statsData] = await Promise.all([
          getDashboardData(id),
          getStats(id),
        ]);
        setCuentas(data.cuentas);
        setStats(statsData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleReset = () => {
    setFormData({
      cuentaOrigenId: "",
      cuentaDestino: "",
      monto: "",
      concepto: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esInvalido) return;

    const confirmacion = await Swal.fire({
      title: "¿Confirmar Envío?",
      html: `
        <div class="text-left space-y-2 p-4 bg-gray-50 rounded-lg border">
          <p><b>Monto:</b> <span class="text-[#003366]">$${montoNum.toLocaleString()}</span></p>
          <p><b>Destino:</b> ${formData.cuentaDestino}</p>
          <p><b>Concepto:</b> ${formData.concepto}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "SÍ, TRANSFERIR",
      cancelButtonText: "CORREGIR",
      confirmButtonColor: "#003366",
      reverseButtons: true,
    });

    if (confirmacion.isConfirmed) {
      setLoading(true);
      try {
        await postTransferencia({ ...formData, monto: montoNum });
        await Swal.fire(
          "¡Completado!",
          "La transferencia se aplicó con éxito.",
          "success",
        );
        router.push("/dashboard");
      } catch (error) {
        Swal.fire("Error", "No se pudo procesar el movimiento.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
          Transferencias
        </h1>
        <p className="text-gray-600 font-medium">
          Gestiona tus movimientos bancarios con seguridad
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: Formulario */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-none border-t-4 border-[#003366] shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <ArrowRightLeft size={20} className="text-[#003366]" />
              <h2 className="text-lg font-bold text-[#003366] uppercase tracking-wider">
                Nueva Operación
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* CUENTA ORIGEN */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Cuenta de Retiro
                </label>
                <select
                  required
                  className="w-full p-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[#003366] outline-none font-bold text-gray-900 transition-colors"
                  value={formData.cuentaOrigenId}
                  onChange={(e) =>
                    setFormData({ ...formData, cuentaOrigenId: e.target.value })
                  }
                >
                  <option value="">Selecciona cuenta...</option>
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.numeroCuenta} (Saldo: ${c.saldo.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* CUENTA DESTINO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Cuenta Destino
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="8 dígitos numéricos"
                  className={`w-full p-3 border-b-2 outline-none text-gray-900 font-medium transition-all ${
                    formData.cuentaDestino && errores.cuentaDestinoInvalida
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-[#003366] bg-white"
                  }`}
                  value={formData.cuentaDestino}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cuentaDestino: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>

              {/* CONCEPTO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Concepto del Pago
                </label>
                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-3.5 text-gray-300"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pago de servicios, Nómina..."
                    className="w-full p-3 pl-10 border-b-2 border-gray-200 focus:border-[#003366] outline-none text-gray-900 text-sm bg-white"
                    value={formData.concepto}
                    onChange={(e) =>
                      setFormData({ ...formData, concepto: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* MONTO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Monto
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full p-3 border-b-2 outline-none font-black text-2xl transition-all ${
                    errores.saldoInsuficiente
                      ? "text-red-600 border-red-500 bg-red-50"
                      : "text-[#003366] border-gray-200 focus:border-[#003366] bg-white"
                  }`}
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: e.target.value })
                  }
                />
                {errores.saldoInsuficiente && (
                  <p className="text-[10px] text-red-500 font-bold italic">
                    Límite de fondos excedido
                  </p>
                )}
                {/* Mensaje para Límite de 100,000 (Especificación 5.b) */}
                {errores.montoExcedido && (
                  <p className="text-[10px] text-orange-600 font-bold italic">
                    El monto máximo permitido es $99,999.99
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 border-2 border-gray-200 text-gray-400 py-3 font-bold uppercase text-[10px] hover:bg-gray-50 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" /> Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || esInvalido}
                  className={`flex-[2] py-4 font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                    esInvalido
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#003366] text-white hover:bg-blue-900 active:scale-95"
                  }`}
                >
                  {loading ? "Procesando..." : "Confirmar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* COLUMNA DERECHA: Gráfico y Tabla */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-none border-t-4 border-gray-800 shadow-md p-6">
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">
              <PieIcon size={18} /> Resumen de Egresos por Destino
            </h2>

            <div className="h-72">
              {" "}
              {/* Aumentamos la altura para acomodar la leyenda sin apretar el gráfico */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.transaccionesPorDestino}
                    dataKey="totalMonto"
                    // Ahora nameKey usa la etiqueta combinada (Concepto + Cuenta) que viene del backend
                    nameKey="cuentaDestino"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {stats.transaccionesPorDestino.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  {/* TOOLTIP: Solución al error de tipos de TypeScript */}
                  <Tooltip
                    formatter={(value: any) => {
                      const numericValue =
                        typeof value === "number" ? value : Number(value);
                      return [
                        `$${numericValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
                        "Monto Total",
                      ];
                    }}
                    contentStyle={{
                      borderRadius: "0px",
                      border: "2px solid #003366",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "12px",
                    }}
                  />

                  {/* LEYENDA: Para identificar los conceptos debajo del gráfico */}
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-[10px] font-black text-gray-600 uppercase ml-2">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <TableIcon size={14} /> Registro Consolidado
            </h2>
            {stats.transaccionesPorOrigen.map((grupo, idx) => (
              <div
                key={idx}
                className="bg-white border-t-2 border-[#003366] shadow-sm overflow-hidden"
              >
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-[9px] font-black text-gray-400 uppercase">
                      <th className="p-3 text-left">Origen (Últ. 4)</th>
                      <th className="p-3 text-left">Destino</th>
                      <th className="p-3 text-center">Últ. Fecha</th>
                      <th className="p-3 text-right">Egresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-bold text-gray-700 italic text-sm">
                        ****{grupo.numeroCuentaOrigen.slice(-4)}
                      </td>
                      <td className="p-4 text-gray-400 font-medium text-[10px] uppercase">
                        CTA: {grupo.ultimaCuentaDestino}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold uppercase">
                          <Calendar size={10} />{" "}
                          {new Date().toLocaleDateString("es-MX")}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-[#003366] text-lg">
                        $
                        {grupo.totalEgresos.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
