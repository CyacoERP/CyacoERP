import React, { useState } from "react";
import { Link } from "react-router";
import { Play, Clock, Tag, ChevronRight, Search } from "lucide-react";
import { blogPosts } from "../data/mockData";

const ALL_TAGS = Array.from(new Set(blogPosts.flatMap((p) => p.tags)));
const ALL_CATS = Array.from(new Set(blogPosts.map((p) => p.category)));

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const filtered = blogPosts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || p.tags.includes(selectedTag);
    const matchCat = !selectedCat || p.category === selectedCat;
    return matchSearch && matchTag && matchCat;
  });

  const featured = blogPosts[0];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-[#0f2044] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Blog & Noticias</span>
          </div>
          <h1 className="text-white" style={{ fontWeight: 700 }}>Blog Técnico & Noticias</h1>
          <p className="text-[#94a3b8] text-sm mt-1">
            Recursos, tutoriales y tendencias en instrumentación industrial
          </p>
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#dc2626] text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCat("")}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${!selectedCat ? "bg-[#0f2044] text-white border-[#0f2044]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
          >
            Todos
          </button>
          {ALL_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
              className={`text-xs px-4 py-2 rounded-full border transition-colors ${selectedCat === cat ? "bg-[#dc2626] text-white border-[#dc2626]" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {!search && !selectedCat && !selectedTag && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 group hover:shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative overflow-hidden h-64 lg:h-auto">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {featured.videoUrl && (
                  <div className="absolute inset-0 bg-[#0f2044]/40 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#dc2626] text-white text-xs px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>
                    Destacado
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-[#dc2626] text-xs uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                  {featured.category}
                </span>
                <h2 className="text-[#0f2044] mb-3 leading-tight" style={{ fontWeight: 700 }}>
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.summary}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                  <span>{featured.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.readTime} de lectura
                  </span>
                  <span>{new Date(featured.date).toLocaleDateString("es-MX", { day: "2-digit", month: "long" })}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button className="self-start bg-[#0f2044] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-sm transition-colors" style={{ fontWeight: 600 }}>
                  Leer artículo completo →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered
                .filter((p) => !(!search && !selectedCat && !selectedTag) || p.id !== featured.id)
                .map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.videoUrl && (
                        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#dc2626]/90 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#0f2044]/80 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-[#dc2626] transition-colors" style={{ fontWeight: 600 }}>
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{post.summary}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                          <span>·</span>
                          {new Date(post.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                        </div>
                        <button className="text-xs text-[#dc2626] hover:underline" style={{ fontWeight: 500 }}>
                          Leer →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p>No se encontraron artículos.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm text-[#0f2044] mb-4" style={{ fontWeight: 700 }}>
                <Tag className="w-4 h-4 inline mr-1" /> Temas
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTag === tag
                        ? "bg-[#dc2626] text-white border-[#dc2626]"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f2044] to-[#1e3a8a] rounded-2xl p-5 text-white">
              <h3 className="text-sm mb-2" style={{ fontWeight: 700 }}>¿Necesitas asesoría técnica?</h3>
              <p className="text-blue-200 text-xs mb-4 leading-relaxed">
                Nuestros ingenieros están listos para resolver tus dudas sobre instrumentación y control.
              </p>
              <Link
                to="/contacto"
                className="block text-center bg-[#dc2626] hover:bg-[#b91c1c] text-white py-2.5 rounded-xl text-xs transition-colors"
                style={{ fontWeight: 600 }}
              >
                Contactar Especialista
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
