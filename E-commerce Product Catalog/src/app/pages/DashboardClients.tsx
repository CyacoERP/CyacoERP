import React from "react";
import { Link } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { ChevronRight, Users, TrendingUp, Star, Download } from "lucide-react";
import { clientsData } from "../data/mockData";

const fmt = (v: number) =>
  v >= 1000000
    ? `$${(v / 1000000).toFixed(1)}M`
    : `$${(v / 1000).toFixed(0)}K`;

const radarData = [
  { subject: "Ventas", A: 95 },
  { subject: "Proyectos", A: 80 },
  { subject: "Cotizaciones", A: 88 },
  { subject: "Satisfacción", A: 92 },
  { subject: "Retención", A: 85 },
  { subject: "Crecimiento", A: 72 },
];

export default function DashboardClients() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/dashboards/ventas" className="hover:text-white">Dashboards</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Clientes</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Dashboard de Clientes</h1>
              <p className="text-[#94a3b8] text-sm mt-1">Análisis de portafolio de clientes</p>
            </div>
            <div className="flex gap-2">
              {[
                { label: "Ventas", href: "/dashboards/ventas" },
                { label: "Clientes", href: "/dashboards/clientes" },
                { label: "Proyectos", href: "/dashboards/proyectos" },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`text-xs px-4 py-2 rounded-lg transition-colors ${
                    tab.href === "/dashboards/clientes"
                      ? "bg-[#dc2626] text-white"
                      : "bg-white/10 text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Clientes Totales", value: "142", sub: "+12 nuevos este trimestre", color: "bg-blue-50 text-blue-600" },
            { icon: TrendingUp, label: "Ingreso Promedio / Cliente", value: "$178K", sub: "MXN anuales", color: "bg-green-50 text-green-600" },
            { icon: Star, label: "NPS (Satisfacción)", value: "72", sub: "Puntuación Net Promoter", color: "bg-orange-50 text-orange-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="text-[#0f2044]" style={{ fontWeight: 700, fontSize: "1.8rem" }}>{kpi.value}</div>
              <div className="text-gray-700 text-sm" style={{ fontWeight: 500 }}>{kpi.label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Sales Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Ventas por Cliente Principal</h3>
                <p className="text-gray-400 text-sm">Top 7 clientes por volumen anual</p>
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={clientsData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#4b5563" }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-MX")}`} />
                <Bar dataKey="ventas" name="Ventas" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[#0f2044] mb-1" style={{ fontWeight: 700 }}>Índice de Salud del Portafolio</h3>
            <p className="text-gray-400 text-sm mb-5">Métricas clave de desempeño de clientes</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Radar name="Índice" dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Detalle por Cliente</h3>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
              <Download className="w-3.5 h-3.5" /> Exportar Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Cliente", "Proyectos", "Cotizaciones", "Ventas Anuales", "Participación"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientsData.map((client, i) => {
                  const total = clientsData.reduce((s, c) => s + c.ventas, 0);
                  const pct = ((client.ventas / total) * 100).toFixed(1);
                  return (
                    <tr key={client.name} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0f2044] text-white flex items-center justify-center text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                            {i + 1}
                          </div>
                          <span style={{ fontWeight: 600 }}>{client.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{client.proyectos}</td>
                      <td className="px-5 py-3 text-gray-600">{client.cotizaciones}</td>
                      <td className="px-5 py-3">
                        <span style={{ fontWeight: 700 }}>
                          {client.ventas.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#dc2626] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
