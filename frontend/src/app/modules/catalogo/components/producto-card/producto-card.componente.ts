import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../../../shared/models/producto.modelo';
import { AuthServicio } from '../../../auth/services/auth.servicio';

@Component({
  selector: 'app-producto-card',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './producto-card.componente.html',
  styleUrl: './producto-card.componente.css',
})
export class ProductoCardComponente {
  private readonly http = inject(HttpClient);
  private readonly authServicio = inject(AuthServicio);

  @Input() producto!: Producto;
  @Output() agregarAlCarrito = new EventEmitter<Producto>();
  @Output() documentoSubido = new EventEmitter<Producto>();

  readonly subiendo = signal(false);
  readonly errorSubida = signal('');

  get precioFormateado(): string {
    return `$${this.producto.precio.toLocaleString('es-MX')} MXN`;
  }

  get imagenUrl(): string {
    return this.producto.imagenUrl || '/assets/default-product.png';
  }

  get esAdmin(): boolean {
    return this.authServicio.tieneRol('admin');
  }

  get urlDocumento(): string | null {
    return this.producto.urlDocumento ?? null;
  }

  onAgregarAlCarrito(): void {
    if (this.producto.stock > 0) {
      this.agregarAlCarrito.emit(this.producto);
    }
  }

  abrirDocumento(): void {
    if (this.urlDocumento) {
      window.open(this.urlDocumento, '_blank', 'noopener,noreferrer');
    }
  }

  onSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (archivo.type !== 'application/pdf') {
      this.errorSubida.set('Solo se aceptan archivos PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);

    this.subiendo.set(true);
    this.errorSubida.set('');

    this.http.post<Producto>(`/api/productos/${this.producto.id}/documento`, formData).subscribe({
      next: (productoActualizado) => {
        this.subiendo.set(false);
        this.producto = { ...this.producto, urlDocumento: productoActualizado.urlDocumento };
        this.documentoSubido.emit(this.producto);
      },
      error: () => {
        this.subiendo.set(false);
        this.errorSubida.set('Error al subir el documento.');
      },
    });

    // Reset input so same file can be reselected
    input.value = '';
  }
}

