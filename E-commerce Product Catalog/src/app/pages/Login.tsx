import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Cpu, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      navigate("/");
    } else {
      setError("Correo o contraseña incorrectos. Intenta con admin@cyaco.mx o carlos@pemex.com");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a35] via-[#0f2044] to-[#1e3a8a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#dc2626] rounded-2xl mb-4 shadow-lg shadow-red-900/50">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-2xl" style={{ fontWeight: 700 }}>
            Cy<span className="text-[#dc2626]">aco</span>
          </div>
          <p className="text-[#94a3b8] text-sm mt-1">Plataforma de Tecnología Industrial</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-[#0f2044] mb-1" style={{ fontWeight: 700, fontSize: "1.4rem" }}>Iniciar Sesión</h2>
          <p className="text-gray-400 text-sm mb-6">Accede a tu cuenta para gestionar cotizaciones y proyectos</p>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
            <p style={{ fontWeight: 600 }}>🔐 Credenciales de demo:</p>
            <p className="mt-1">Admin: <span style={{ fontWeight: 600 }}>admin@cyaco.mx</span></p>
            <p>Cliente: <span style={{ fontWeight: 600 }}>carlos@pemex.com</span></p>
            <p className="text-blue-500">(cualquier contraseña)</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#dc2626]" />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-[#dc2626] hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-300 text-white py-3.5 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-[#dc2626] hover:underline" style={{ fontWeight: 600 }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#64748b] text-xs mt-6">
          © 2025 Cyaco Tecnología Industrial
        </p>
      </div>
    </div>
  );
}