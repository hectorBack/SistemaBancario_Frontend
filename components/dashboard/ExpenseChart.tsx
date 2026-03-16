"use client";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({
  dataMap,
}: {
  dataMap: Record<string, number>;
}) {
  // 1. Preparamos los datos usando directamente las llaves del mapa (que ya son los conceptos)
  const data = {
    labels: Object.keys(dataMap),
    datasets: [
      {
        label: "Monto Total",
        data: Object.values(dataMap),
        backgroundColor: [
          "#003366", // Azul (Primario)
          "#2563eb", // Azul brillante
          "#60a5fa", // Azul claro
          "#94a3b8", // Gris azulado
          "#1e293b", // Azul noche
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 10, // Efecto visual al pasar el mouse
      },
    ],
  };

  // 2. Configuramos las opciones para una lectura clara
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 9, // Reducimos un poco de 11 a 9 porque el texto es más largo
            weight: "bold" as any,
          },
          padding: 10,
          usePointStyle: true,
          // Eliminamos el toUpperCase() de aquí si ya lo haces en el Backend
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label: string, i: number) => ({
              text: label,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].borderColor,
              lineWidth: datasets[0].borderWidth,
              hidden: !chart.getDataVisibility(i),
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 13, weight: "bold" as any },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 4,
        callbacks: {
          // Formato de moneda profesional
          label: function (context: any) {
            let label = context.label || "";
            const value = context.parsed || 0;
            const formattedValue = new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(value);

            return `Total: ${formattedValue}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64 flex flex-col items-center">
      <Pie data={data} options={options} />
    </div>
  );
}
