import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Phone, Building2, Edit3, Save, LogOut, FileText, FolderOpen, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { quotes, projects } from "../data/mockData";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 text-center">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Acceso requerido</h2>
        <p className="text-gray-500 mt-2 mb-6">Debes iniciar sesión para ver tu perfil.</p>
        <Link to="/login" className="bg-[#dc2626] text-white px-6 py-3 rounded-xl text-sm" style={{ fontWeight: 600 }}>
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const userQuotes = quotes.slice(0, 3);
  const userProjects = projects.slice(0, 2);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Mi Perfil</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#1e40af] flex items-center justify-center text-white text-3xl" style={{ fontWeight: 700 }}>
              {user?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>{user?.name}</h1>
              <p className="text-[#94a3b8] text-sm">{user?.company}</p>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full ${user?.role === "admin" ? "bg-[#dc2626] text-white" : "bg-blue-500/20 text-blue-300 border border-blue-400/30"}`} style={{ fontWeight: 600 }}>
                {user?.role === "admin" ? "Administrador" : "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Datos Personales</h2>
                {editing ? (
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 bg-[#0f2044] text-white px-4 py-2 rounded-xl text-sm transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-[#dc2626] hover:text-[#dc2626] px-4 py-2 rounded-xl text-sm transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Editar
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { icon: User, label: "Nombre completo", key: "name" },
                  { icon: Mail, label: "Correo electrónico", key: "email" },
                  { icon: Phone, label: "Teléfono", key: "phone" },
                  { icon: Building2, label: "Empresa", key: "company" },
                ].map((field) => (
                  <div key={field.key} className="flex gap-4 items-start">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <field.icon className="w-4 h-4 text-[#dc2626]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                      {editing ? (
                        <input
                          type="text"
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                        />
                      ) : (
                        <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                          {form[field.key as keyof typeof form] || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-5">
              <h3 className="text-[#0f2044] mb-4" style={{ fontWeight: 700 }}>Seguridad</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>Cambiar contraseña</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>Autenticación de dos factores</span>
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Desactivado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm text-[#0f2044] mb-4" style={{ fontWeight: 700 }}>Resumen de Actividad</h3>
              <div className="space-y-3">
                {[
                  { label: "Cotizaciones enviadas", value: "5", href: "/cotizaciones/historial" },
                  { label: "Proyectos activos", value: "2", href: "/proyectos" },
                  { label: "Productos en favoritos", value: "8", href: "/catalogo" },
                ].map((stat) => (
                  <Link key={stat.label} to={stat.href} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-[#dc2626] transition-colors group">
                    <span className="text-sm text-gray-600 group-hover:text-[#dc2626]">{stat.label}</span>
                    <span className="text-lg text-[#0f2044]" style={{ fontWeight: 700 }}>{stat.value}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Quotes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-[#0f2044]" style={{ fontWeight: 700 }}>Cotizaciones Recientes</h3>
                <Link to="/cotizaciones/historial" className="text-xs text-[#dc2626] hover:underline">Ver todas</Link>
              </div>
              <div className="space-y-2">
                {userQuotes.map((q) => (
                  <Link key={q.id} to={`/cotizaciones/${q.id}`} className="flex items-center justify-between py-2 text-xs hover:text-[#dc2626] transition-colors">
                    <div>
                      <span className="text-[#1e40af]" style={{ fontWeight: 600 }}>{q.id}</span>
                      <span className="text-gray-400 ml-2">{new Date(q.date).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${
                      q.status === "Atendido" ? "bg-green-100 text-green-700" :
                      q.status === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                      q.status === "Rechazado" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`} style={{ fontWeight: 600 }}>
                      {q.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-[#dc2626] hover:bg-red-50 py-3 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}