import React from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Users, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { projects } from "../data/mockData";

const STATUS_STYLES: Record<string, string> = {
  "En Proceso": "bg-blue-100 text-blue-700",
  Completado: "bg-green-100 text-green-700",
  Pendiente: "bg-gray-100 text-gray-500",
};

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  Completado: <CheckCircle className="w-5 h-5 text-green-500" />,
  "En Proceso": <Clock className="w-5 h-5 text-blue-500" />,
  Pendiente: <AlertCircle className="w-5 h-5 text-gray-400" />,
};

const PROJECT_STATUS_STYLES: Record<string, string> = {
  "En Proceso": "bg-blue-100 text-blue-700 border border-blue-200",
  Completado: "bg-green-100 text-green-700 border border-green-200",
  Pendiente: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  const fmt = (v: number) =>
    v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-20">
        <p className="text-gray-500">Proyecto no encontrado.</p>
        <Link to="/proyectos" className="text-[#dc2626] hover:underline text-sm mt-2">← Volver a proyectos</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/proyectos" className="flex items-center gap-2 text-[#94a3b8] text-sm hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver a proyectos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#94a3b8] text-xs" style={{ fontWeight: 600 }}>{project.id}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${PROJECT_STATUS_STYLES[project.status]}`} style={{ fontWeight: 600 }}>
                  {project.status}
                </span>
              </div>
              <h1 className="text-white leading-tight" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
                {project.name}
              </h1>
              <p className="text-[#94a3b8] text-sm mt-2 max-w-2xl">{project.description}</p>
            </div>
            {/* Progress Circle */}
            <div className="text-center bg-white/10 rounded-2xl p-5 min-w-[120px]">
              <div className="text-white text-3xl" style={{ fontWeight: 700 }}>{project.progress}%</div>
              <div className="text-[#94a3b8] text-xs mt-1">Avance General</div>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#dc2626] rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Milestones */}
          <div className="lg:col-span-2 space-y-5">
            {/* Milestones */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-[#0f2044] text-sm" style={{ fontWeight: 700 }}>Plan de Hitos</h2>
              </div>
              <div className="p-5 space-y-4">
                {project.milestones.map((m, i) => (
                  <div key={m.id} className="relative">
                    {i < project.milestones.length - 1 && (
                      <div className="absolute left-[10px] top-7 bottom-0 w-0.5 bg-gray-100 -mb-4" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {MILESTONE_ICONS[m.status]}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{m.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(m.date).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[m.status]}`} style={{ fontWeight: 600 }}>
                            {m.status}
                          </span>
                        </div>
                        {m.status !== "Pendiente" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progreso</span>
                              <span style={{ fontWeight: 600 }}>{m.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  m.progress === 100 ? "bg-green-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${m.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div className="space-y-5">
            {/* Project Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm text-[#0f2044]" style={{ fontWeight: 700 }}>Información del Proyecto</h3>
              {[
                { icon: Users, label: "Cliente", value: project.client },
                { icon: Users, label: "Gerente de Proyecto", value: project.manager },
                { icon: Calendar, label: "Inicio", value: new Date(project.startDate).toLocaleDateString("es-MX") },
                { icon: Calendar, label: "Fin Estimado", value: new Date(project.endDate).toLocaleDateString("es-MX") },
                { icon: TrendingUp, label: "Presupuesto", value: fmt(project.budget) },
              ].map((info) => (
                <div key={info.label} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-4 h-4 text-[#dc2626]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{info.label}</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Team */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm text-[#0f2044] mb-4" style={{ fontWeight: 700 }}>Equipo del Proyecto</h3>
              <div className="space-y-3">
                {project.team.map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0f2044] flex items-center justify-center text-white text-sm flex-shrink-0" style={{ fontWeight: 700 }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{member.name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-br from-[#0f2044] to-[#1e3a8a] rounded-2xl p-5 text-white">
              <h3 className="text-sm mb-4" style={{ fontWeight: 700 }}>Resumen de Hitos</h3>
              {[
                { label: "Completados", value: project.milestones.filter((m) => m.status === "Completado").length, color: "text-green-400" },
                { label: "En Proceso", value: project.milestones.filter((m) => m.status === "En Proceso").length, color: "text-blue-300" },
                { label: "Pendientes", value: project.milestones.filter((m) => m.status === "Pendiente").length, color: "text-gray-400" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                  <span className="text-blue-200 text-sm">{s.label}</span>
                  <span className={`text-lg ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
