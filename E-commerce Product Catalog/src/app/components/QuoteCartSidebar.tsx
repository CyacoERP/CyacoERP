import React from "react";
import { X, Trash2, Plus, Minus, FileText, ShoppingCart } from "lucide-react";
import { useQuote } from "../context/QuoteContext";
import { useNavigate } from "react-router";

export function QuoteCartSidebar() {
  const { items, removeItem, updateQty, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useQuote();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const fmt = (v: number) => v.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f2044] text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg" style={{ fontWeight: 600 }}>Cotización</h2>
            {totalItems > 0 && (
              <span className="bg-[#dc2626] text-white text-xs px-2 py-0.5 rounded-full">
                {totalItems} ítems
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p className="text-sm">Tu cotización está vacía</p>
              <button
                onClick={() => { setIsCartOpen(false); navigate("/catalogo"); }}
                className="text-sm text-blue-600 hover:underline"
              >
                Ir al catálogo →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-tight line-clamp-2" style={{ fontWeight: 500 }}>
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm" style={{ fontWeight: 600 }}>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm text-blue-900" style={{ fontWeight: 600 }}>
                      {fmt(item.qty * item.unitPrice)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 mt-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal estimado:</span>
              <span className="text-gray-900" style={{ fontWeight: 700 }}>{fmt(totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400">
              * El precio final se confirmará en la cotización formal.
            </p>
            <button
              onClick={() => { setIsCartOpen(false); navigate("/cotizaciones/nueva"); }}
              className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3 rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              <FileText className="w-4 h-4" />
              Solicitar Cotización Formal
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
            >
              Continuar explorando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
