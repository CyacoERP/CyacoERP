import React, { useState } from "react";
import { Link } from "react-router";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Download, DollarSign, FileText, Users, Target, ChevronRight } from "lucide-react";
import { salesData, categoryData, quotes } from "../data/mockData";

const COLORS = ["#1e40af", "#dc2626", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"];

const fmt = (v: number) =>
  v >= 1000000
    ? `$${(v / 1000000).toFixed(1)}M`
    : `$${(v / 1000).toFixed(0)}K`;

export default function DashboardSales() {
  const [period, setPeriod] = useState("year");

  const totalSales = salesData.reduce((s, m) => s + m.ventas, 0);
  const totalQuotes = salesData.reduce((s, m) => s + m.cotizaciones, 0);
  const conversionRate = ((totalSales / totalQuotes) * 100).toFixed(1);

  const kpis = [
    {
      label: "Ventas Totales",
      value: `$${(totalSales / 1000000).toFixed(2)}M`,
      change: "+18.4%",
      positive: true,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Cotizaciones",
      value: quotes.length.toString(),
      change: "+12.1%",
      positive: true,
      icon: FileText,
      color: "bg-red-50 text-[#dc2626]",
    },
    {
      label: "Tasa de Conversión",
      value: `${conversionRate}%`,
      change: "+2.3pp",
      positive: true,
      icon: Target,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Clientes Activos",
      value: "142",
      change: "-3.2%",
      positive: false,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Dashboard de Ventas</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Dashboard de Ventas</h1>
              <p className="text-[#94a3b8] text-sm mt-1">Indicadores clave de rendimiento comercial</p>
            </div>
            <div className="flex gap-2">
              {["month", "quarter", "year"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-4 py-2 rounded-lg transition-colors ${
                    period === p ? "bg-[#dc2626] text-white" : "bg-white/10 text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {p === "month" ? "Mes" : p === "quarter" ? "Trimestre" : "Año"}
                </button>
              ))}
              <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${kpi.positive ? "text-green-600" : "text-red-500"}`} style={{ fontWeight: 600 }}>
                  {kpi.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-[#0f2044]" style={{ fontWeight: 700, fontSize: "1.6rem" }}>{kpi.value}</div>
              <div className="text-gray-500 text-sm mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Sales Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Ventas vs Cotizaciones 2024</h3>
              <p className="text-gray-400 text-sm">Evolución mensual de ventas y cotizaciones generadas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e40af" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="quotesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-MX")}`} />
              <Legend />
              <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#1e40af" fill="url(#salesGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="cotizaciones" name="Cotizaciones" stroke="#dc2626" fill="url(#quotesGrad)" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="meta" name="Meta" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[#0f2044] mb-1" style={{ fontWeight: 700 }}>Ventas por Trimestre</h3>
            <p className="text-gray-400 text-sm mb-5">Comparativo trimestral vs meta</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { q: "Q1", ventas: salesData.slice(0, 3).reduce((s, m) => s + m.ventas, 0), meta: 1500000 },
                  { q: "Q2", ventas: salesData.slice(3, 6).reduce((s, m) => s + m.ventas, 0), meta: 1750000 },
                  { q: "Q3", ventas: salesData.slice(6, 9).reduce((s, m) => s + m.ventas, 0), meta: 2100000 },
                  { q: "Q4", ventas: salesData.slice(9, 12).reduce((s, m) => s + m.ventas, 0), meta: 2450000 },
                ]}
                margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="q" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-MX")}`} />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#1e40af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[#0f2044] mb-1" style={{ fontWeight: 700 }}>Ventas por Categoría</h3>
            <p className="text-gray-400 text-sm mb-5">Distribución porcentual del portafolio</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                    {categoryData.map((entry, i) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 flex-1">{cat.name}</span>
                    <span className="text-xs" style={{ fontWeight: 600 }}>{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quotes Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Cotizaciones Recientes</h3>
            <Link to="/cotizaciones/historial" className="text-sm text-[#dc2626] hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["N° Cotización", "Cliente", "Total", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-[#1e40af]" style={{ fontWeight: 600 }}>{q.id}</td>
                    <td className="px-5 py-3 text-gray-700">{q.client}</td>
                    <td className="px-5 py-3 text-gray-900" style={{ fontWeight: 600 }}>
                      {q.total.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        q.status === "Atendido" ? "bg-green-100 text-green-700" :
                        q.status === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                        q.status === "Rechazado" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`} style={{ fontWeight: 600 }}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}