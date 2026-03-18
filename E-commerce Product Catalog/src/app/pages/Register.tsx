import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Cpu, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", position: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      login(form.email, form.password);
      navigate("/");
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a35] via-[#0f2044] to-[#1e3a8a] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-[#0f2044]" style={{ fontWeight: 700 }}>¡Registro exitoso!</h2>
          <p className="text-gray-500 text-sm mt-2">Tu cuenta ha sido creada. Serás redirigido en un momento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a35] via-[#0f2044] to-[#1e3a8a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#dc2626] rounded-xl flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl" style={{ fontWeight: 700 }}>
              Cy<span className="text-[#dc2626]">aco</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-[#0f2044] mb-1" style={{ fontWeight: 700, fontSize: "1.4rem" }}>Crear Cuenta</h2>
          <p className="text-gray-400 text-sm mb-6">Accede al catálogo completo, cotizaciones y seguimiento de proyectos</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Nombre completo <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ing. Juan Pérez"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Empresa / Organización <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="PEMEX Refinación"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Correo electrónico <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@empresa.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+52 81 0000 0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Cargo / Puesto
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Gerente de Compras"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Contraseña <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#dc2626] bg-gray-50"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>
                  Confirmar contraseña <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none bg-gray-50 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-[#dc2626]"
                  }`}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="mt-1 rounded border-gray-300 text-[#dc2626]" />
              <span className="text-xs text-gray-600">
                Acepto los{" "}
                <a href="#" className="text-[#dc2626] hover:underline">Términos de Uso</a> y el{" "}
                <a href="#" className="text-[#dc2626] hover:underline">Aviso de Privacidad</a> de Cyaco.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || (form.password !== form.confirmPassword && !!form.confirmPassword)}
              className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-300 text-white py-3.5 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-[#dc2626] hover:underline" style={{ fontWeight: 600 }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}