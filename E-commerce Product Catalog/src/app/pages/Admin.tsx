import React, { useState } from "react";
import { Link } from "react-router";
import {
  Package, Tag, Users, FileText, FolderOpen, Plus, Edit3, Trash2, Search, ChevronRight, Settings,
} from "lucide-react";
import { products, categories, quotes, projects } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

type AdminTab = "products" | "categories" | "clients" | "quotes" | "projects";

const TABS = [
  { key: "products" as AdminTab, label: "Productos", icon: Package, count: products.length },
  { key: "categories" as AdminTab, label: "Categorías", icon: Tag, count: categories.length },
  { key: "clients" as AdminTab, label: "Clientes", icon: Users, count: 142 },
  { key: "quotes" as AdminTab, label: "Cotizaciones", icon: FileText, count: quotes.length },
  { key: "projects" as AdminTab, label: "Proyectos", icon: FolderOpen, count: projects.length },
];

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  Atendido: "bg-green-100 text-green-700",
  Rechazado: "bg-red-100 text-red-700",
  "En Proceso": "bg-blue-100 text-blue-700",
  Completado: "bg-green-100 text-green-700",
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [search, setSearch] = useState("");
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 text-center">
        <Settings className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Acceso Restringido</h2>
        <p className="text-gray-500 mt-2 mb-6">Esta sección es solo para administradores del sistema.</p>
        <div className="flex gap-3">
          <Link to="/login" className="bg-[#dc2626] text-white px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>
            Iniciar Sesión como Admin
          </Link>
          <Link to="/" className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm" style={{ fontWeight: 600 }}>
            Volver al Inicio
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Demo: usa admin@cyaco.mx para acceder</p>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const filteredQuotes = quotes.filter(
    (q) => q.client.toLowerCase().includes(search.toLowerCase()) || q.id.includes(search)
  );
  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="text-white">Administración</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Panel de Administración</h1>
              <p className="text-[#94a3b8] text-sm mt-1">Gestión completa del sistema Cyaco</p>
            </div>
            <button className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo {TABS.find((t) => t.key === activeTab)?.label.slice(0, -1)}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors border-l-4 ${
                    activeTab === tab.key
                      ? "border-[#dc2626] bg-red-50 text-[#dc2626]"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    <span style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}>{tab.label}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Actions */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-white"
                />
              </div>
            </div>

            {/* PRODUCTS */}
            {activeTab === "products" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["", "SKU", "Producto", "Categoría", "Precio", "Stock", "Acciones"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400" style={{ fontWeight: 500 }}>{p.sku}</td>
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <p className="text-gray-900 text-xs leading-tight truncate" style={{ fontWeight: 500 }}>{p.name}</p>
                            <p className="text-xs text-gray-400">{p.manufacturer}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{p.category}</td>
                        <td className="px-4 py-3 text-xs" style={{ fontWeight: 600 }}>
                          {p.price.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {p.inStock ? "Disponible" : "Bajo pedido"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CATEGORIES */}
            {activeTab === "categories" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["ID", "Nombre", "Productos", "Acciones"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-xs text-gray-400">#{cat.id}</td>
                        <td className="px-5 py-4" style={{ fontWeight: 500 }}>{cat.name}</td>
                        <td className="px-5 py-4 text-gray-600">{cat.count}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CLIENTS */}
            {activeTab === "clients" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["PEMEX Refinación", "CFE Generación", "BASF México", "CEMEX", "Grupo ALFA", "Bachoco"].map((c) => (
                    <div key={c} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0f2044] rounded-full flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>
                          {c.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{c}</p>
                          <p className="text-xs text-gray-400">Cliente activo</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUOTES */}
            {activeTab === "quotes" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["N° Cot.", "Cliente", "Total", "Estado", "Fecha", "Acciones"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-[#1e40af] text-xs" style={{ fontWeight: 600 }}>{q.id}</td>
                        <td className="px-5 py-4 text-gray-700 text-xs">{q.client}</td>
                        <td className="px-5 py-4 text-xs" style={{ fontWeight: 600 }}>{fmt(q.total)}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[q.status]}`} style={{ fontWeight: 600 }}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{q.date}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <Link to={`/cotizaciones/${q.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></Link>
                            <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["ID", "Proyecto", "Cliente", "Avance", "Estado", "Acciones"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-xs text-gray-400" style={{ fontWeight: 500 }}>{p.id}</td>
                        <td className="px-5 py-4 text-xs text-gray-800 max-w-[200px] truncate" style={{ fontWeight: 500 }}>{p.name}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{p.client}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1e40af] rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-xs">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`} style={{ fontWeight: 600 }}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <Link to={`/proyectos/${p.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></Link>
                            <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}