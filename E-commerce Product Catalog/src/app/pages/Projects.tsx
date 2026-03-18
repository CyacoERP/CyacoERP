import React, { useState } from "react";
import { Link } from "react-router";
import { FolderOpen, Search, ChevronRight, Users, Calendar, TrendingUp } from "lucide-react";
import { projects } from "../data/mockData";

const STATUS_STYLES: Record<string, string> = {
  "En Proceso": "bg-blue-100 text-blue-700 border border-blue-200",
  Completado: "bg-green-100 text-green-700 border border-green-200",
  Pendiente: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Cancelado: "bg-red-100 text-red-700 border border-red-200",
};

export default function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (v: number) =>
    v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Proyectos de Implementación</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Proyectos de Implementación</h1>
              <p className="text-[#94a3b8] text-sm mt-1">
                {projects.length} proyectos activos y completados
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Proyectos", value: projects.length.toString() },
              { label: "En Proceso", value: projects.filter((p) => p.status === "En Proceso").length.toString() },
              { label: "Completados", value: projects.filter((p) => p.status === "Completado").length.toString() },
              { label: "Presupuesto Total", value: fmt(projects.reduce((s, p) => s + p.budget, 0)) },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-white" style={{ fontWeight: 700, fontSize: "1.3rem" }}>{stat.value}</div>
                <div className="text-[#94a3b8] text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por proyecto o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Todos", "En Proceso", "Completado", "Pendiente"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-[#0f2044] text-white border-[#0f2044]"
                    : "text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards / Table */}
        <div className="space-y-4">
          {filtered.map((project) => (
            <Link
              key={project.id}
              to={`/proyectos/${project.id}`}
              className="group block bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-[#dc2626]/20 transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#94a3b8]" style={{ fontWeight: 600 }}>{project.id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[project.status]}`} style={{ fontWeight: 600 }}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-[#0f2044] group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.manager}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.startDate} → {project.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      <span>{fmt(project.budget)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="sm:text-right min-w-[140px]">
                  <div className="flex items-center justify-between sm:justify-end gap-2 mb-2">
                    <span className="text-xs text-gray-500">Avance</span>
                    <span className="text-sm text-[#0f2044]" style={{ fontWeight: 700 }}>{project.progress}%</span>
                  </div>
                  <div className="w-full sm:w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        project.progress >= 100
                          ? "bg-green-500"
                          : project.progress >= 60
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {project.milestones.filter((m) => m.status === "Completado").length}/{project.milestones.length} hitos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No se encontraron proyectos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
