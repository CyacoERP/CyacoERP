import React from "react";
import { Link } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc]">
      <div className="text-center max-w-md">
        <div className="text-[8rem] leading-none text-[#0f2044]" style={{ fontWeight: 700, opacity: 0.08 }}>
          404
        </div>
        <div className="-mt-8">
          <h1 className="text-[#0f2044]" style={{ fontWeight: 700, fontSize: "1.8rem" }}>
            Página no encontrada
          </h1>
          <p className="text-gray-500 mt-3 mb-8">
            La página que buscas no existe o ha sido movida.
            Verifica la URL o navega a otra sección.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-[#0f2044] text-white px-6 py-3 rounded-xl text-sm hover:bg-[#1e3a8a] transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Home className="w-4 h-4" /> Ir al inicio
            </Link>
            <Link
              to="/catalogo"
              className="flex items-center justify-center gap-2 border-2 border-[#0f2044] text-[#0f2044] px-6 py-3 rounded-xl text-sm hover:bg-[#0f2044] hover:text-white transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Search className="w-4 h-4" /> Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
