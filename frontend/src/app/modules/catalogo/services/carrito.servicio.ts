import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../../../shared/models/producto.modelo';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoServicio {
  private items = signal<ItemCarrito[]>([]);

  readonly itemsCarrito = this.items.asReadonly();

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  readonly totalPrecio = computed(() =>
    this.items().reduce((acc, item) => acc + item.producto.price * item.cantidad, 0)
  );

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

  generarReciboXml(): string {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0];
    const folio = `REC-${Date.now()}`;

    const lineas = this.items()
      .map((item) => {
        const subtotal = (item.producto.price * item.cantidad).toFixed(2);
        return `    <item>
      <id>${item.producto.id}</id>
      <nombre>${this.escaparXml(item.producto.name)}</nombre>
      <categoria>${this.escaparXml(item.producto.category)}</categoria>
      <precioUnitario>${item.producto.price.toFixed(2)}</precioUnitario>
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
