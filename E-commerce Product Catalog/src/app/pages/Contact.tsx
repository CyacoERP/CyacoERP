import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, Phone, MapPin, Send, ChevronRight, ChevronDown, Play } from "lucide-react";
import { faqs } from "../data/mockData";

const TUTORIALS = [
  { title: "Instalación de transmisores de presión", duration: "12 min" },
  { title: "Configuración de medidores de flujo", duration: "18 min" },
  { title: "Calibración en campo: paso a paso", duration: "22 min" },
  { title: "Integración HART con sistemas SCADA", duration: "15 min" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Contacto / Soporte</span>
          </div>
          <h1 className="text-white" style={{ fontWeight: 700 }}>Contacto y Soporte Técnico</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Nuestro equipo de ingenieros está disponible para ayudarte</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-[#0f2044] mb-6" style={{ fontWeight: 700 }}>Envíanos un Mensaje</h2>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-[#0f2044] mb-2" style={{ fontWeight: 700 }}>¡Mensaje enviado!</h3>
                  <p className="text-gray-500 text-sm">Nos pondremos en contacto contigo en máximo 24 horas hábiles.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "" }); }}
                    className="mt-5 text-sm text-[#dc2626] hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Nombre completo", type: "text", required: true },
                      { key: "email", label: "Correo electrónico", type: "email", required: true },
                      { key: "phone", label: "Teléfono", type: "tel", required: false },
                      { key: "company", label: "Empresa", type: "text", required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                          {field.label} {field.required && <span className="text-[#dc2626]">*</span>}
                        </label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Asunto <span className="text-[#dc2626]">*</span>
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option>Soporte Técnico</option>
                      <option>Solicitar Cotización</option>
                      <option>Garantías y Devoluciones</option>
                      <option>Información de Productos</option>
                      <option>Proyectos de Implementación</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                      Mensaje <span className="text-[#dc2626]">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe tu consulta, requerimiento o problema con el mayor detalle posible..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3.5 rounded-xl text-sm transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-[#0f2044] mb-5" style={{ fontWeight: 700 }}>Información de Contacto</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: Phone,
                    label: "Teléfono principal",
                    value: "+52 (81) 8000-1234",
                    sub: "Lun–Vie 8:00–18:00 CST",
                    href: "tel:+5281800012345",
                  },
                  {
                    icon: Phone,
                    label: "Soporte técnico 24/7",
                    value: "+52 (81) 8000-5678",
                    sub: "Emergencias industriales",
                    href: "tel:+5281800056789",
                  },
                  {
                    icon: Mail,
                    label: "Ventas",
                    value: "ventas@cyaco.mx",
                    sub: "Respuesta en 24h hábiles",
                    href: "mailto:ventas@cyaco.mx",
                  },
                  {
                    icon: Mail,
                    label: "Soporte técnico",
                    value: "soporte@cyaco.mx",
                    sub: "Asistencia técnica especializada",
                    href: "mailto:soporte@cyaco.mx",
                  },
                  {
                    icon: MapPin,
                    label: "Oficinas corporativas",
                    value: "Av. Insurgentes Sur 1602",
                    sub: "Crédito Constructor, CDMX",
                    href: "#",
                  },
                ].map((info) => (
                  <a key={info.label} href={info.href} className="flex gap-3 group">
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#dc2626] transition-colors">
                      <info.icon className="w-4 h-4 text-[#dc2626] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{info.label}</p>
                      <p className="text-sm text-gray-800 group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 500 }}>
                        {info.value}
                      </p>
                      <p className="text-xs text-gray-400">{info.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f2044] to-[#1e3a8a] rounded-2xl p-5 text-white">
              <h3 className="text-sm mb-2" style={{ fontWeight: 700 }}>Soporte Remoto</h3>
              <p className="text-blue-200 text-xs mb-4 leading-relaxed">
                Nuestros ingenieros pueden asistirte de forma remota usando TeamViewer o AnyDesk.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-xl text-xs transition-colors" style={{ fontWeight: 600 }}>
                Iniciar Sesión Remota
              </button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-[#0f2044] mb-6" style={{ fontWeight: 700 }}>Preguntas Frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm text-gray-800 pr-4" style={{ fontWeight: 500 }}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Tutorials */}
          <div>
            <h2 className="text-[#0f2044] mb-6" style={{ fontWeight: 700 }}>Videos Tutoriales</h2>
            <div className="space-y-3">
              {TUTORIALS.map((tut) => (
                <div
                  key={tut.title}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-[#0f2044] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#dc2626] transition-colors">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 500 }}>
                      {tut.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Duración: {tut.duration}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#dc2626] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="relative h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-[#dc2626]" />
              <p className="text-sm" style={{ fontWeight: 500 }}>Av. Insurgentes Sur 1602, Crédito Constructor</p>
              <p className="text-xs">Benito Juárez, CDMX. C.P. 03940</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-[#dc2626] hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}