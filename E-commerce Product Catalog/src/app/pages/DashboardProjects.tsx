import React from "react";
import { Link } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { ChevronRight, FolderOpen, CheckCircle, Clock, Download } from "lucide-react";
import { projects } from "../data/mockData";

const progressData = projects.map((p) => ({
  name: p.id,
  avance: p.progress,
  hitos: p.milestones.length,
  completados: p.milestones.filter((m) => m.status === "Completado").length,
}));

const timelineData = [
  { month: "Sep", abiertos: 1, cerrados: 0 },
  { month: "Oct", abiertos: 3, cerrados: 0 },
  { month: "Nov", abiertos: 3, cerrados: 0 },
  { month: "Dic", abiertos: 3, cerrados: 1 },
  { month: "Ene", abiertos: 4, cerrados: 1 },
  { month: "Feb", abiertos: 3, cerrados: 2 },
];

export default function DashboardProjects() {
  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === "En Proceso").length;
  const completed = projects.filter((p) => p.status === "Completado").length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / total);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/dashboards/ventas" className="hover:text-white">Dashboards</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Proyectos</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Dashboard de Proyectos</h1>
              <p className="text-[#94a3b8] text-sm mt-1">Estado general de implementaciones</p>
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
                    tab.href === "/dashboards/proyectos"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FolderOpen, label: "Total Proyectos", value: total.toString(), color: "bg-blue-50 text-blue-600" },
            { icon: Clock, label: "En Proceso", value: inProgress.toString(), color: "bg-orange-50 text-orange-600" },
            { icon: CheckCircle, label: "Completados", value: completed.toString(), color: "bg-green-50 text-green-600" },
            { icon: Download, label: "Presupuesto Total", value: `$${(totalBudget / 1000000).toFixed(1)}M`, color: "bg-purple-50 text-purple-600" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="text-[#0f2044]" style={{ fontWeight: 700, fontSize: "1.6rem" }}>{kpi.value}</div>
              <div className="text-gray-500 text-sm">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Avg Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Avance Promedio del Portafolio</h3>
            <span className="text-2xl text-[#dc2626]" style={{ fontWeight: 700 }}>{avgProgress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1e40af] to-[#dc2626] rounded-full transition-all"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Promedio de avance de todos los proyectos activos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress by project */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[#0f2044] mb-5" style={{ fontWeight: 700 }}>Avance por Proyecto</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="avance" name="Avance" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[#0f2044] mb-5" style={{ fontWeight: 700 }}>Proyectos Abiertos vs Cerrados</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="abiertos" name="Abiertos" stroke="#1e40af" strokeWidth={2} dot={{ fill: "#1e40af" }} />
                <Line type="monotone" dataKey="cerrados" name="Cerrados" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Estado de Proyectos</h3>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Proyecto", "Cliente", "Avance", "Hitos", "Presupuesto", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <Link to={`/proyectos/${p.id}`} className="text-[#1e40af] hover:underline text-xs" style={{ fontWeight: 600 }}>
                        {p.id}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{p.name}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 text-xs">{p.client}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.progress >= 100 ? "bg-green-500" : p.progress >= 60 ? "bg-blue-500" : "bg-yellow-500"}`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-xs" style={{ fontWeight: 600 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {p.milestones.filter((m) => m.status === "Completado").length}/{p.milestones.length}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ fontWeight: 600 }}>
                      {p.budget.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        p.status === "En Proceso" ? "bg-blue-100 text-blue-700" :
                        p.status === "Completado" ? "bg-green-100 text-green-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`} style={{ fontWeight: 600 }}>
                        {p.status}
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
