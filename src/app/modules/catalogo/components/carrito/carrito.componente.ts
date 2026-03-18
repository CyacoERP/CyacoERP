import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoServicio, ItemCarrito } from '../../services/carrito.servicio';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './carrito.componente.html',
  styleUrl: './carrito.componente.css',
})
export class CarritoComponente {
  constructor(private carritoServicio: CarritoServicio) {}

  get items(): ItemCarrito[] {
    return this.carritoServicio.itemsCarrito();
  }

  get totalItems(): number {
    return this.carritoServicio.totalItems();
  }

  get totalPrecio(): number {
    return this.carritoServicio.totalPrecio();
  }

  get totalFormateado(): string {
    return `$${this.totalPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
  }

  onQuitarProducto(productoId: number): void {
    this.carritoServicio.quitarProducto(productoId);
  }

  onActualizarCantidad(productoId: number, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).valueAsNumber;
    this.carritoServicio.actualizarCantidad(productoId, valor);
  }

  onVaciarCarrito(): void {
    this.carritoServicio.vaciarCarrito();
  }

  onGenerarRecibo(): void {
    if (this.items.length === 0) return;
    this.carritoServicio.descargarReciboXml();
  }

  subtotalFormateado(precio: number, cantidad: number): string {
    const subtotal = precio * cantidad;
    return `$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
  }
}
