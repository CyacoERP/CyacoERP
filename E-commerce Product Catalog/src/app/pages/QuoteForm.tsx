import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { FileText, Trash2, Plus, Minus, Send, ChevronRight } from "lucide-react";
import { useQuote } from "../context/QuoteContext";

export default function QuoteForm() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useQuote();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    project: "",
    deliveryDate: "",
    notes: "",
    termsAccepted: false,
  });
  const [sending, setSending] = useState(false);

  const fmt = (v: number) =>
    v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.termsAccepted) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    navigate("/cotizaciones/gracias");
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Solicitar Cotización</span>
          </div>
          <h1 className="text-white" style={{ fontWeight: 700 }}>Solicitar Cotización Formal</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Recibirás una propuesta en menos de 24 horas hábiles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Data */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-[#0f2044] mb-5" style={{ fontWeight: 600 }}>Datos de Contacto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Nombre completo", type: "text", required: true, placeholder: "Ing. Juan Pérez" },
                    { key: "email", label: "Correo electrónico", type: "email", required: true, placeholder: "juan@empresa.com" },
                    { key: "phone", label: "Teléfono / WhatsApp", type: "tel", required: true, placeholder: "+52 81 0000 0000" },
                    { key: "position", label: "Cargo / Puesto", type: "text", required: false, placeholder: "Gerente de Compras" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                        {field.label} {field.required && <span className="text-[#dc2626]">*</span>}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={form[field.key as keyof typeof form] as string}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Empresa / Organización <span className="text-[#dc2626]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="PEMEX Refinación S.A. de C.V."
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-[#0f2044] mb-5" style={{ fontWeight: 600 }}>Información del Proyecto</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Nombre del proyecto / aplicación
                    </label>
                    <input
                      type="text"
                      placeholder="Sistema de medición fiscal - Refinería Norte"
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Fecha requerida de entrega
                    </label>
                    <input
                      type="date"
                      value={form.deliveryDate}
                      onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Notas adicionales / requerimientos especiales
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describa las condiciones de proceso, requisitos especiales de certificación, condiciones ambientales, etc."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    className="mt-1 rounded border-gray-300 text-[#dc2626] focus:ring-[#dc2626]"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    Acepto el{" "}
                    <a href="#" className="text-[#dc2626] hover:underline">Aviso de Privacidad</a>{" "}
                    y autorizo a Cyaco a contactarme para dar seguimiento a mi solicitud de cotización.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={sending || items.length === 0 || !form.termsAccepted}
                className="w-full flex items-center justify-center gap-3 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-300 text-white py-4 rounded-xl text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando cotización...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Solicitud de Cotización
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 sticky top-20">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f2044]" />
                <h3 className="text-[#0f2044] text-sm" style={{ fontWeight: 600 }}>
                  Resumen de Cotización
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No hay productos en la cotización.</p>
                    <Link to="/catalogo" className="text-[#dc2626] text-sm hover:underline mt-2 block">
                      Ir al catálogo →
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.productId} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-2 leading-tight" style={{ fontWeight: 500 }}>
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs w-5 text-center" style={{ fontWeight: 600 }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {items.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Total referencial:</span>
                    <span style={{ fontWeight: 700 }}>
                      {(totalPrice).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">El precio final se confirmará en la cotización formal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}