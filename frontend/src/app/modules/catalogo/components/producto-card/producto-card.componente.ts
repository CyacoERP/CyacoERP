import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../../../shared/models/producto.modelo';

@Component({
  selector: 'app-producto-card',
  imports: [],
  standalone: true,
  templateUrl: './producto-card.componente.html',
  styleUrl: './producto-card.componente.css',
})
export class ProductoCardComponente {
  @Input() producto!: Producto;
  @Output() agregarAlCarrito = new EventEmitter<Producto>();

  get precioFormateado(): string {
    return `$${this.producto.precio.toLocaleString('es-MX')} MXN`;
  }

  get imagenUrl(): string {
    return this.producto.imagenUrl || '/assets/default-product.png';
  }

  onAgregarAlCarrito(): void {
    if (this.producto.stock > 0) {
      this.agregarAlCarrito.emit(this.producto);
    }
  }
}

