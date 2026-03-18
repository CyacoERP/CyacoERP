import React, { useState } from "react";
import { Link } from "react-router";
import { FileText, Search, Download, Eye, Filter, ChevronRight } from "lucide-react";
import { quotes } from "../data/mockData";

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Atendido: "bg-green-100 text-green-700 border border-green-200",
  Rechazado: "bg-red-100 text-red-700 border border-red-200",
  "En Proceso": "bg-blue-100 text-blue-700 border border-blue-200",
};

export default function QuoteHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filtered = quotes.filter((q) => {
    const matchSearch =
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || q.status === statusFilter;
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
            <span className="text-white">Historial de Cotizaciones</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>Mis Cotizaciones</h1>
              <p className="text-[#94a3b8] text-sm mt-1">{quotes.length} cotizaciones en total</p>
            </div>
            <Link
              to="/cotizaciones/nueva"
              className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              <FileText className="w-4 h-4" />
              Nueva Cotización
            </Link>
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
              placeholder="Buscar por número o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              {["Todos", "Pendiente", "En Proceso", "Atendido", "Rechazado"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === status
                      ? "bg-[#0f2044] text-white border-[#0f2044]"
                      : "text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    N° Cotización
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Ítems
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[#1e40af]" style={{ fontWeight: 600 }}>{quote.id}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(quote.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900" style={{ fontWeight: 500 }}>{quote.client}</div>
                        <div className="text-xs text-gray-400">{quote.contact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{quote.items.length} productos</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900" style={{ fontWeight: 600 }}>{fmt(quote.total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[quote.status] || "bg-gray-100 text-gray-600"}`} style={{ fontWeight: 600 }}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/cotizaciones/${quote.id}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </Link>
                        <a
                          href={quote.pdfUrl}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((quote) => (
              <div key={quote.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[#1e40af] text-sm" style={{ fontWeight: 700 }}>{quote.id}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(quote.date).toLocaleDateString("es-MX")}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[quote.status]}`} style={{ fontWeight: 600 }}>
                    {quote.status}
                  </span>
                </div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{quote.client}</p>
                <p className="text-xs text-gray-500">{quote.items.length} ítems · {fmt(quote.total)}</p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/cotizaciones/${quote.id}`}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 border border-blue-200 py-2 rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver detalle
                  </Link>
                  <a href="#" className="flex items-center justify-center gap-1 text-xs text-gray-600 border border-gray-200 px-3 py-2 rounded-lg">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No se encontraron cotizaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
