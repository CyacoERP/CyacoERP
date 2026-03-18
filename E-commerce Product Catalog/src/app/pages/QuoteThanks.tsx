import React from "react";
import { Link } from "react-router";
import { CheckCircle, FileText, Clock, ArrowRight, Home } from "lucide-react";

export default function QuoteThanks() {
  const quoteId = `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="text-[#0f2044] mb-3" style={{ fontWeight: 700, fontSize: "1.8rem" }}>
          ¡Cotización Enviada!
        </h1>
        <p className="text-gray-500 mb-2">
          Tu solicitud de cotización ha sido recibida exitosamente.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 mb-8">
          <p className="text-xs text-blue-500 uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
            Número de Cotización
          </p>
          <p className="text-[#1e40af] text-2xl" style={{ fontWeight: 700 }}>{quoteId}</p>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-left space-y-4">
          <h3 className="text-[#0f2044] text-sm" style={{ fontWeight: 600 }}>¿Qué sigue?</h3>
          {[
            {
              icon: Clock,
              title: "Revisión del equipo técnico",
              desc: "Nuestros ingenieros analizarán tu solicitud en las próximas horas.",
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: FileText,
              title: "Propuesta formal en 24 horas",
              desc: "Recibirás un PDF con la cotización detallada y condiciones comerciales.",
              color: "bg-orange-100 text-orange-600",
            },
            {
              icon: CheckCircle,
              title: "Seguimiento personalizado",
              desc: "Un ingeniero de ventas te contactará para resolver dudas y definir plazos.",
              color: "bg-green-100 text-green-600",
            },
          ].map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/cotizaciones/historial"
            className="flex-1 flex items-center justify-center gap-2 bg-[#0f2044] text-white py-3 rounded-xl text-sm hover:bg-[#1e3a8a] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <FileText className="w-4 h-4" />
            Ver mis cotizaciones
          </Link>
          <Link
            to="/catalogo"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#0f2044] text-[#0f2044] py-3 rounded-xl text-sm hover:bg-[#0f2044] hover:text-white transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ArrowRight className="w-4 h-4" />
            Seguir explorando
          </Link>
        </div>
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-400 text-sm mt-4 hover:text-gray-600">
          <Home className="w-4 h-4" /> Ir al inicio
        </Link>
      </div>
    </div>
  );
}
