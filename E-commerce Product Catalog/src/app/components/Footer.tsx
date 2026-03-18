import React from "react";
import { Link } from "react-router";
import { Cpu, Mail, Phone, MapPin, Linkedin, Youtube, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a1a35] text-[#94a3b8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#dc2626] rounded-lg flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-lg" style={{ fontWeight: 700 }}>
                Cy<span className="text-[#dc2626]">aco</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Especialistas en tecnología industrial, automatización y soluciones de medición para la industria latinoamericana desde 2005.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#dc2626] flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#dc2626] flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#dc2626] flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>Productos</h4>
            <ul className="space-y-2 text-sm">
              {["Sensores de Presión", "Medidores de Flujo", "Temperatura", "Nivel y Radar", "Válvulas de Control", "Calibradores"].map((item) => (
                <li key={item}>
                  <Link to="/catalogo" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>Empresa</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Catálogo", href: "/catalogo" },
                { label: "Proyectos", href: "/proyectos" },
                { label: "Blog / Noticias", href: "/blog" },
                { label: "Contacto", href: "/contacto" },
                { label: "Soporte Técnico", href: "/contacto" },
                { label: "Administración", href: "/admin" },
              ].map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white mb-4" style={{ fontWeight: 600 }}>Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                <span>Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, CDMX. C.P. 03940</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <a href="tel:+525555000100" className="hover:text-white">+52 (55) 5500-0100</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <a href="mailto:ventas@cyaco.mx" className="hover:text-white">ventas@cyaco.mx</a>
              </li>
            </ul>
            <div className="mt-4 text-xs">
              <span className="bg-green-900/40 text-green-400 px-2 py-1 rounded-full">
                Lun–Vie 8:00–18:00 CST
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2025 Cyaco Tecnología Industrial. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}