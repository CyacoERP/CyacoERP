import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../../shared/models/producto.modelo';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface IncompatibilidadDetectada {
  nombre1: string;
  nombre2: string;
  razon?: string;
}

@Injectable({ providedIn: 'root' })
export class CarritoServicio {
  private readonly http = inject(HttpClient);
  private items = signal<ItemCarrito[]>([]);
  private readonly incompatibilidadesState = signal<IncompatibilidadDetectada[]>([]);

  readonly itemsCarrito = this.items.asReadonly();

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  readonly totalPrecio = computed(() =>
    this.items().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  );

  readonly subtotalPorCategoria = computed(() => {
    const mapa = new Map<string, number>();
    this.items().forEach((item) => {
      const catNombre = item.producto.categoria?.nombre || 'Sin categoría';
      const actual = mapa.get(catNombre) || 0;
      mapa.set(catNombre, actual + item.producto.precio * item.cantidad);
    });
    return Array.from(mapa.entries()).map(([categoria, subtotal]) => ({ categoria, subtotal }));
  });

  readonly incompatibilidades = this.incompatibilidadesState.asReadonly();

  constructor() {
    effect(
      () => {
        const idsUnicos = [...new Set(this.obtenerIdsProductos())];
        if (idsUnicos.length < 2) {
          this.incompatibilidadesState.set([]);
          return;
        }

        this.http
          .post<IncompatibilidadDetectada[]>('/api/productos/incompatibilidades/buscar', {
            productoIds: idsUnicos,
          })
          .subscribe({
            next: (respuesta) => this.incompatibilidadesState.set(respuesta ?? []),
            error: () => this.incompatibilidadesState.set([]),
          });
      },
      { allowSignalWrites: true },
    );
  }

  agregarProducto(producto: Producto): void {
    const actuales = this.items();
    const existente = actuales.find((i) => i.producto.id === producto.id);
    if (existente) {
      this.items.set(
        actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      this.items.set([...actuales, { producto, cantidad: 1 }]);
    }
  }

  quitarProducto(productoId: number): void {
    this.items.set(this.items().filter((i) => i.producto.id !== productoId));
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitarProducto(productoId);
      return;
    }
    this.items.set(
      this.items().map((i) =>
        i.producto.id === productoId ? { ...i, cantidad } : i
      )
    );
  }

  vaciarCarrito(): void {
    this.items.set([]);
  }

  obtenerIdsProductos(): number[] {
    return this.items().map((item) => item.producto.id);
  }

  generarReciboXml(): string {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0];
    const folio = `REC-${Date.now()}`;

    const lineas = this.items()
      .map((item) => {
        const subtotal = (item.producto.precio * item.cantidad).toFixed(2);
        return `    <item>
      <id>${item.producto.id}</id>
      <nombre>${this.escaparXml(item.producto.nombre)}</nombre>
      <categoria>${this.escaparXml(item.producto.categoria?.nombre || 'Sin categoría')}</categoria>
      <precioUnitario>${item.producto.precio.toFixed(2)}</precioUnitario>
      <cantidad>${item.cantidad}</cantidad>
      <subtotal>${subtotal}</subtotal>
    </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <folio>${folio}</folio>
  <fecha>${fecha}</fecha>
  <hora>${hora}</hora>
  <items>
${lineas}
  </items>
  <total>${this.totalPrecio().toFixed(2)}</total>
  <moneda>MXN</moneda>
</recibo>`;
  }

  descargarReciboXml(): void {
    const contenido = this.generarReciboXml();
    const blob = new Blob([contenido], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `recibo-${Date.now()}.xml`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  private escaparXml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
