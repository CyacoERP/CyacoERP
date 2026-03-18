import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  X,
  ChevronDown,
  Play,
  Filter,
} from "lucide-react";
import { products, categories, manufacturers } from "../data/mockData";
import { useQuote } from "../context/QuoteContext";

const PRICE_RANGES = [
  { label: "Hasta $10,000", min: 0, max: 10000 },
  { label: "$10,000 – $25,000", min: 10000, max: 25000 },
  { label: "$25,000 – $50,000", min: 25000, max: 50000 },
  { label: "Más de $50,000", min: 50000, max: Infinity },
];

const FEATURED_VIDEOS = [
  { title: "Instalación de Transmisor de Presión", thumb: "https://images.unsplash.com/photo-1761758674188-2b8e4c89c5e2?w=400&q=80" },
  { title: "Configuración ProMag 400", thumb: "https://images.unsplash.com/photo-1763889107827-8e7d7960d68a?w=400&q=80" },
  { title: "Calibración en Campo", thumb: "https://images.unsplash.com/photo-1743183988574-e8b4d2e5830a?w=400&q=80" },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("categoria") || "");
  const [selectedMfr, setSelectedMfr] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useQuote();

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    if (selectedCat) list = list.filter((p) => p.category === selectedCat);
    if (selectedMfr.length) list = list.filter((p) => selectedMfr.includes(p.manufacturer));
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }
    if (onlyInStock) list = list.filter((p) => p.inStock);
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, selectedCat, selectedMfr, selectedPriceRange, onlyInStock, sortBy]);

  const toggleMfr = (mfr: string) => {
    setSelectedMfr((prev) =>
      prev.includes(mfr) ? prev.filter((m) => m !== mfr) : [...prev, mfr]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCat("");
    setSelectedMfr([]);
    setSelectedPriceRange(null);
    setOnlyInStock(false);
  };

  const activeFiltersCount = [
    selectedCat,
    ...selectedMfr,
    selectedPriceRange !== null ? "price" : "",
    onlyInStock ? "stock" : "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white mb-1" style={{ fontWeight: 700 }}>Catálogo de Productos</h1>
          <p className="text-[#94a3b8] text-sm">
            {products.length}+ referencias de instrumentación industrial
          </p>
          {/* Search Bar */}
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, especificación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#dc2626] text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Videos Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-4 overflow-x-auto scrollbar-none">
          <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1" style={{ fontWeight: 600 }}>
            <Play className="w-3 h-3" /> Videos destacados:
          </span>
          {FEATURED_VIDEOS.map((v) => (
            <button
              key={v.title}
              className="flex-shrink-0 flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-[#dc2626] rounded-full px-3 py-1.5 text-xs transition-colors"
            >
              <img src={v.thumb} alt="" className="w-5 h-5 rounded-full object-cover" />
              {v.title}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0f2044]" />
                  <span className="text-sm text-[#0f2044]" style={{ fontWeight: 600 }}>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-[#dc2626] text-white text-xs px-1.5 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-[#dc2626] hover:underline">
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categorías */}
              <div className="mb-5">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Categoría</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!selectedCat ? "bg-[#0f2044] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.name === selectedCat ? "" : cat.name)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${selectedCat === cat.name ? "bg-[#dc2626] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs ${selectedCat === cat.name ? "text-red-200" : "text-gray-400"}`}>{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabricante */}
              <div className="mb-5">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Fabricante</h4>
                <div className="space-y-2">
                  {manufacturers.map((mfr) => (
                    <label key={mfr} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedMfr.includes(mfr)}
                        onChange={() => toggleMfr(mfr)}
                        className="rounded border-gray-300 text-[#dc2626] focus:ring-[#dc2626]"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{mfr}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="mb-5">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Precio</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${selectedPriceRange === i ? "bg-[#dc2626] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded border-gray-300 text-[#dc2626] focus:ring-[#dc2626]"
                  />
                  <span className="text-sm text-gray-600">Solo disponibles en stock</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                <span className="text-sm text-gray-500">
                  <span style={{ fontWeight: 600 }}>{filtered.length}</span> productos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#dc2626] bg-white"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Calificados</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1" style={{ fontWeight: 600 }}>Categoría</p>
                    <select
                      value={selectedCat}
                      onChange={(e) => setSelectedCat(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white"
                    >
                      <option value="">Todas</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1" style={{ fontWeight: 600 }}>Precio</p>
                    <select
                      value={selectedPriceRange ?? ""}
                      onChange={(e) => setSelectedPriceRange(e.target.value === "" ? null : Number(e.target.value))}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white"
                    >
                      <option value="">Todos</option>
                      {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                    <span className="text-sm">En stock</span>
                  </label>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="w-12 h-12 mb-3 opacity-20" />
                <p>No se encontraron productos con esos filtros.</p>
                <button onClick={clearFilters} className="mt-3 text-[#dc2626] text-sm hover:underline">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <Link to={`/catalogo/${product.id}`} className="block relative overflow-hidden h-52">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1">
                        <span className="bg-[#0f2044]/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {product.inStock ? (
                          <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">Disponible</span>
                        ) : (
                          <span className="bg-gray-400/90 text-white text-xs px-2 py-1 rounded-full">Bajo pedido</span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-0.5">{product.manufacturer} · {product.sku}</p>
                      <Link to={`/catalogo/${product.id}`}>
                        <h3 className="text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-yellow-400 text-xs">
                          {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
                        </span>
                        <span className="text-xs text-gray-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.compatibility.slice(0, 2).map((c) => (
                          <span key={c} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {c}
                          </span>
                        ))}
                        {product.compatibility.length > 2 && (
                          <span className="text-xs text-gray-400">+{product.compatibility.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-[#0f2044]" style={{ fontWeight: 700, fontSize: "1rem" }}>
                          ${product.price.toLocaleString("es-MX")}
                          <span className="text-xs text-gray-400 ml-0.5">MXN</span>
                        </span>
                        <button
                          onClick={() =>
                            addItem({
                              productId: product.id,
                              productName: product.name,
                              sku: product.sku,
                              unitPrice: product.price,
                              image: product.image,
                            })
                          }
                          className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Cotizar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
