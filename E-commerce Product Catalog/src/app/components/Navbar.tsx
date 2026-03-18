import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  BarChart2,
  Cpu,
} from "lucide-react";
import { useQuote } from "../context/QuoteContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Catálogo", href: "/catalogo" },
  {
    label: "Cotizaciones",
    href: "/cotizaciones",
    children: [
      { label: "Mis Cotizaciones", href: "/cotizaciones/historial" },
      { label: "Solicitar Cotización", href: "/cotizaciones/nueva" },
    ],
  },
  { label: "Proyectos", href: "/proyectos" },
  {
    label: "Dashboards",
    href: "/dashboards",
    children: [
      { label: "Ventas", href: "/dashboards/ventas" },
      { label: "Clientes", href: "/dashboards/clientes" },
      { label: "Proyectos", href: "/dashboards/proyectos" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useQuote();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f2044] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-[#dc2626] rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white text-xl" style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>
                Cy<span className="text-[#dc2626]">aco</span>
              </span>
              <div className="text-[#94a3b8] text-[9px] uppercase tracking-widest leading-none -mt-0.5">
                Tecnología Industrial
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive(link.href)
                      ? "text-white bg-white/10"
                      : "text-[#cbd5e1] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                {link.children && openDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1e40af] transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Quote Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cotización</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-[#0f2044] text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs" style={{ fontWeight: 700 }}>
                    {user?.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <Link to="/perfil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-4 h-4" /> Mi Perfil
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="w-4 h-4" /> Administración
                      </Link>
                    )}
                    <Link to="/dashboards/ventas" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <BarChart2 className="w-4 h-4" /> Dashboards
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-[#cbd5e1] hover:text-white hover:bg-white/10 text-sm transition-colors"
              >
                <User className="w-4 h-4" />
                Ingresar
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white p-2 rounded-md hover:bg-white/10"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1a35] border-t border-white/10 pb-4">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-6 py-3 text-[#cbd5e1] hover:text-white hover:bg-white/5 text-sm"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4 border-l-2 border-white/10 ml-6">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-[#94a3b8] hover:text-white text-sm"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block mx-4 mt-3 px-4 py-2.5 rounded-lg border border-white/20 text-center text-white text-sm"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}