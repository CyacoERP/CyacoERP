import React from "react";
import { useParams, Link } from "react-router";
import { Download, ArrowLeft, FileText, User, Calendar, Package } from "lucide-react";
import { quotes } from "../data/mockData";

const STATUS_STYLES: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Atendido: "bg-green-100 text-green-700 border border-green-200",
  Rechazado: "bg-red-100 text-red-700 border border-red-200",
  "En Proceso": "bg-blue-100 text-blue-700 border border-blue-200",
};

const STATUS_STEPS = ["Recibida", "En Revisión", "En Proceso", "Atendido"];

export default function QuoteDetail() {
  const { id } = useParams();
  const quote = quotes.find((q) => q.id === id);

  const fmt = (v: number) =>
    v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-20">
        <FileText className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">Cotización no encontrada.</p>
        <Link to="/cotizaciones/historial" className="text-[#dc2626] hover:underline mt-2 text-sm">
          ← Volver al historial
        </Link>
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(
    quote.status === "Pendiente" ? "En Revisión" : quote.status === "Atendido" ? "Atendido" : "En Proceso"
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/cotizaciones/historial" className="flex items-center gap-2 text-[#94a3b8] text-sm hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al historial
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white" style={{ fontWeight: 700 }}>{quote.id}</h1>
              <p className="text-[#94a3b8] text-sm mt-1">{quote.notes}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm px-4 py-1.5 rounded-full ${STATUS_STYLES[quote.status]}`} style={{ fontWeight: 600 }}>
                {quote.status}
              </span>
              <a
                href={quote.pdfUrl}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Descargar PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Status Progress */}
        {quote.status !== "Rechazado" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-[#0f2044] mb-4" style={{ fontWeight: 600 }}>Estado del Proceso</h3>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-colors ${
                        i <= stepIdx
                          ? "bg-[#0f2044] border-[#0f2044] text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center hidden sm:block ${i <= stepIdx ? "text-[#0f2044]" : "text-gray-400"}`} style={{ fontWeight: i <= stepIdx ? 600 : 400 }}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${i < stepIdx ? "bg-[#0f2044]" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#dc2626]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>Cliente</span>
              </div>
              <p className="text-gray-900" style={{ fontWeight: 600 }}>{quote.client}</p>
              <p className="text-sm text-gray-500">{quote.contact}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#dc2626]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>Fecha</span>
              </div>
              <p className="text-gray-900">
                {new Date(quote.date).toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-[#dc2626]" />
                <span className="text-sm" style={{ fontWeight: 600 }}>Notas</span>
              </div>
              <p className="text-sm text-gray-600">{quote.notes || "Sin notas adicionales."}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm text-[#0f2044]" style={{ fontWeight: 600 }}>
                  Productos Cotizados ({quote.items.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Producto</th>
                    <th className="px-5 py-3 text-center text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Cant.</th>
                    <th className="px-5 py-3 text-right text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Precio U.</th>
                    <th className="px-5 py-3 text-right text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quote.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <Link
                          to={`/catalogo/${item.productId}`}
                          className="text-[#1e40af] hover:underline"
                          style={{ fontWeight: 500 }}
                        >
                          {item.productName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">{item.qty}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                      <td className="px-5 py-4 text-right" style={{ fontWeight: 600 }}>
                        {fmt(item.qty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#0f2044]">
                  <tr>
                    <td colSpan={3} className="px-5 py-4 text-white text-right" style={{ fontWeight: 600 }}>
                      Total Estimado:
                    </td>
                    <td className="px-5 py-4 text-white text-right" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {fmt(quote.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <div className="p-4 bg-yellow-50 border-t border-yellow-100">
                <p className="text-xs text-yellow-700">
                  * Los precios mostrados son referenciales. El precio final, condiciones de entrega y garantías
                  serán confirmados en la propuesta formal del equipo de ventas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
