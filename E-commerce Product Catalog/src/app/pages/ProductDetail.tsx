import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  Download,
  Share2,
  ChevronRight,
  Check,
  Play,
  ArrowLeft,
  Package,
  Zap,
  Shield,
  Star,
  GitCompare,
} from "lucide-react";
import { products } from "../data/mockData";
import { useQuote } from "../context/QuoteContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "compat" | "accessories">("specs");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useQuote();

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 py-20">
        <p className="text-gray-500 mb-4">Producto no encontrado.</p>
        <Link to="/catalogo" className="text-[#dc2626] hover:underline">← Volver al catálogo</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAddToQuote = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.price,
        image: product.image,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-[#dc2626]">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/catalogo" className="hover:text-[#dc2626]">Catálogo</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0f2044] line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-96">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {!product.inStock && (
                <div className="absolute top-4 left-4 bg-gray-500 text-white text-sm px-3 py-1 rounded-full">
                  Bajo pedido
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-[#dc2626]" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Category & SKU */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-50 text-[#1e40af] text-xs px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>
                {product.category}
              </span>
              <span className="text-gray-400 text-sm">SKU: {product.sku}</span>
            </div>

            {/* Name */}
            <h1 className="text-[#0f2044] mb-3 leading-tight" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reseñas)
              </span>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-500">{product.manufacturer}</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

            {/* Compatibility badges */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Protocolos compatibles
              </p>
              <div className="flex flex-wrap gap-2">
                {product.compatibility.map((c) => (
                  <span key={c} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-100">
                    <Zap className="w-3 h-3" /> {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-[#0f2044] to-[#1e3a8a] rounded-2xl p-5 mb-5 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-blue-200 text-xs mb-1">Precio de referencia</p>
                  <p style={{ fontWeight: 700, fontSize: "2rem" }}>
                    ${product.price.toLocaleString("es-MX")}
                    <span className="text-lg text-blue-200 ml-1">MXN</span>
                  </p>
                  <p className="text-blue-200 text-xs mt-1">Precio final en cotización formal</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm px-3 py-1 rounded-full ${product.inStock ? "bg-green-500" : "bg-gray-500"}`}>
                    {product.inStock ? "En Stock" : "Bajo Pedido"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity + Add to Quote */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-gray-100 text-gray-600 transition-colors">
                  −
                </button>
                <span className="px-4 py-2.5 text-center min-w-[3rem]" style={{ fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-gray-100 text-gray-600 transition-colors">
                  +
                </button>
              </div>
              <button
                onClick={handleAddToQuote}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm transition-all ${
                  added ? "bg-green-600" : "bg-[#dc2626] hover:bg-[#b91c1c]"
                }`}
                style={{ fontWeight: 600 }}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {added ? "¡Agregado!" : "Agregar a Cotización"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href={product.pdfUrl}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-[#0f2044] hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Download className="w-4 h-4" />
                Ficha Técnica PDF
              </a>
              <button className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-400 text-blue-600 px-4 py-2.5 rounded-xl text-sm transition-colors">
                <GitCompare className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: Shield, text: "Garantía fabricante" },
                { icon: Package, text: "Envío a toda la República" },
                { icon: Check, text: "Certificación original" },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center">
                  <badge.icon className="w-5 h-5 text-[#0f2044]" />
                  <span className="text-xs text-gray-500">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-gray-100">
            {(["specs", "compat", "accessories"] as const).map((tab) => {
              const labels = { specs: "Especificaciones", compat: "Compatibilidad", accessories: "Accesorios" };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-[#dc2626] text-[#dc2626]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                  style={{ fontWeight: activeTab === tab ? 600 : 400 }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
                {Object.entries(product.specs).map(([key, val], i) => (
                  <div
                    key={key}
                    className={`flex items-start justify-between py-3 px-0 sm:px-4 ${
                      i % 2 === 0 ? "sm:border-r sm:border-gray-100" : ""
                    } border-b border-gray-50`}
                  >
                    <span className="text-sm text-gray-500 flex-1">{key}</span>
                    <span className="text-sm text-gray-900 ml-4 text-right" style={{ fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "compat" && (
              <div>
                <p className="text-sm text-gray-500 mb-4">Protocolos y estándares de comunicación compatibles:</p>
                <div className="flex flex-wrap gap-3">
                  {product.compatibility.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-4 py-2 rounded-xl">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-sm" style={{ fontWeight: 500 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "accessories" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.accessories.map((acc) => (
                  <div key={acc} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <Package className="w-5 h-5 text-[#0f2044] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{acc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Play className="w-5 h-5 text-[#dc2626]" />
            <h3 className="text-[#0f2044]" style={{ fontWeight: 600 }}>Video Técnico</h3>
          </div>
          <div className="p-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
              <iframe
                src={product.videoUrl}
                title="Video técnico"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-[#0f2044] mb-5" style={{ fontWeight: 700 }}>Productos Relacionados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/catalogo/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                >
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{p.manufacturer}</p>
                    <p className="text-sm text-gray-800 line-clamp-2 group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                      {p.name}
                    </p>
                    <p className="text-sm text-[#0f2044] mt-2" style={{ fontWeight: 700 }}>
                      ${p.price.toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
