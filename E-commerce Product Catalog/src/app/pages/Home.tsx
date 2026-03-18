import React from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  Award,
  Headphones,
  TrendingUp,
  CheckCircle,
  Play,
  ChevronRight,
} from "lucide-react";
import { products, categories } from "../data/mockData";

const HERO_BG = "https://images.unsplash.com/photo-1763296479464-fe8bee23eb65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbiUyMGNvbnRyb2wlMjBwYW5lbCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzczODA1MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const TECH_IMG = "https://images.unsplash.com/photo-1717386255773-a456c611dc4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwdGVjaG5vbG9neSUyMGRpZ2l0YWwlMjBzZW5zb3JzJTIwZmFjdG9yeXxlbnwxfHx8fDE3NzM4MDUzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080";

const stats = [
  { value: "20+", label: "Años de experiencia" },
  { value: "900+", label: "Clientes activos" },
  { value: "6,000+", label: "Productos en catálogo" },
  { value: "97%", label: "Satisfacción del cliente" },
];

const features = [
  {
    icon: Shield,
    title: "Garantía de Fabricante",
    desc: "Servicio de garantía local sin envíos internacionales. Respuesta en 24 horas.",
  },
  {
    icon: Award,
    title: "Certificaciones Internacionales",
    desc: "Laboratorio de calibración acreditado ante EMA con trazabilidad NIST.",
  },
  {
    icon: Headphones,
    title: "Soporte Técnico 24/7",
    desc: "Ingenieros especializados disponibles para emergencias y asistencia remota.",
  },
  {
    icon: TrendingUp,
    title: "Proyectos Llave en Mano",
    desc: "Desde ingeniería hasta puesta en marcha. Integramos sistemas completos.",
  },
];

const categoryIcons = ["⚡", "🌊", "🌡️", "📡", "🔧", "🧪", "📏", "🎛️"];

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[550px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2044]/90 via-[#0f2044]/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#dc2626] text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Tecnología Industrial
              </span>
            </div>
            <h1 className="text-white mb-4" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, lineHeight: 1.1 }}>
              Soluciones Digitales para la{" "}
              <span className="text-[#dc2626]">Industria Moderna</span>
            </h1>
            <p className="text-[#cbd5e1] text-lg mb-8 leading-relaxed">
              Distribuidores autorizados de las principales marcas mundiales. Instrumentación de precisión,
              automatización y servicios técnicos especializados para la industria latinoamericana.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalogo"
                className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-red-900/30"
                style={{ fontWeight: 600 }}
              >
                Explorar Catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cotizaciones/nueva"
                className="flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                Solicitar Cotización
              </Link>
            </div>

            {/* Brands */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 items-center">
              <span className="text-[#64748b] text-xs uppercase tracking-wider">Marcas autorizadas:</span>
              {["Endress+Hauser", "Yokogawa", "Emerson", "ABB", "Vega"].map((b) => (
                <span key={b} className="text-[#94a3b8] text-sm" style={{ fontWeight: 500 }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-white text-2xl" style={{ fontWeight: 700 }}>{s.value}</div>
                <div className="text-[#94a3b8] text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Familias de Productos</h2>
              <p className="text-gray-500 text-sm mt-1">Más de 6,000 referencias disponibles</p>
            </div>
            <Link to="/catalogo" className="flex items-center gap-1 text-[#dc2626] text-sm hover:underline" style={{ fontWeight: 500 }}>
              Ver todo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-[#dc2626] hover:bg-red-50 transition-all text-center"
              >
                <span className="text-3xl">{categoryIcons[idx] || "⚙️"}</span>
                <div>
                  <div className="text-sm text-gray-800 group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                    {cat.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{cat.count} productos</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[#f1f5f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>Productos Destacados</h2>
              <p className="text-gray-500 text-sm mt-1">Los más solicitados por nuestros clientes</p>
            </div>
            <Link to="/catalogo" className="flex items-center gap-1 text-[#dc2626] text-sm hover:underline" style={{ fontWeight: 500 }}>
              Ver catálogo completo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/catalogo/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#0f2044] text-white text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  {!product.inStock && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        Bajo pedido
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{product.manufacturer} · {product.sku}</p>
                  <h3 className="text-sm text-gray-900 leading-tight line-clamp-2 group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400 text-xs">{"★".repeat(Math.round(product.rating))}</span>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#0f2044] text-sm" style={{ fontWeight: 700 }}>
                      ${product.price.toLocaleString("es-MX")} MXN
                    </span>
                    <span className="text-[#dc2626] text-xs" style={{ fontWeight: 500 }}>
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#dc2626] text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Recursos Técnicos
              </span>
              <h2 className="text-[#0f2044] mt-2 mb-4" style={{ fontWeight: 700 }}>
                Videos Técnicos y Capacitación
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Accede a nuestra biblioteca de videos técnicos, tutoriales de instalación, configuración
                y resolución de problemas. Aprende de nuestros ingenieros especializados en tecnología industrial.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Videos de instalación paso a paso",
                  "Configuración de parámetros avanzados",
                  "Resolución de fallas comunes",
                  "Webinars y seminarios en línea",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-[#0f2044] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                Ver todos los recursos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={TECH_IMG} alt="Laboratorio técnico" className="w-full h-72 object-cover" />
              <div className="absolute inset-0 bg-[#0f2044]/50 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/30 transition-colors group">
                  <Play className="w-7 h-7 text-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 bg-[#0f2044]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-white" style={{ fontWeight: 700 }}>¿Por qué elegir Cyaco?</h2>
            <p className="text-[#94a3b8] mt-2">Más de dos décadas impulsando la tecnología industrial en Latinoamérica</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-[#dc2626] rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-[#0f2044] mb-3" style={{ fontWeight: 700 }}>¿Listo para comenzar tu proyecto?</h2>
          <p className="text-gray-500 mb-8">
            Nuestro equipo de ingenieros especializados está listo para asesorarte. Obtén tu cotización en menos de 24 horas.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/cotizaciones/nueva"
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-3.5 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              Solicitar Cotización →
            </Link>
            <Link
              to="/contacto"
              className="border-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044] hover:text-white px-8 py-3.5 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              Hablar con un Ingeniero
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}