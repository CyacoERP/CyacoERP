import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoServicio, ItemCarrito } from '../../services/carrito.servicio';
import { ModalStateServicio } from '../../services/modal-state.servicio';

@Component({
  selector: 'app-carrito-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="isOpen()" class="drawer-overlay" (click)="cerrar()"></div>
    
    <div class="drawer" [class.open]="isOpen()">
      <div class="drawer-header">
        <h2>Cotización</h2>
        <button class="close-btn" (click)="cerrar()">✕</button>
      </div>

      <div class="drawer-content">
        @if (items().length === 0) {
          <div class="empty-cart">
            <div class="empty-icon">🛒</div>
            <p>Tu cotización está vacía</p>
            <a routerLink="/catalogo" (click)="cerrar()" class="link-catalog">
              ir al catálogo →
            </a>
          </div>
        } @else {
          <div class="cart-items">
            @for (item of items(); track item.producto.id) {
              <div class="cart-item">
                <img [src]="item.producto.imageUrl" [alt]="item.producto.name" class="item-image">
                <div class="item-details">
                  <h4>{{ item.producto.name }}</h4>
                  <p class="item-price">{{ formatPrice(item.producto.price) }}</p>
                  <div class="quantity-control">
                    <button (click)="decrementarCantidad(item.producto.id)">−</button>
                    <span>{{ item.cantidad }}</span>
                    <button (click)="incrementarCantidad(item.producto.id)">+</button>
                  </div>
                </div>
                <button class="remove-btn" (click)="removerProducto(item.producto.id)">🗑</button>
              </div>
            }
          </div>

          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatPrice(totalPrecio()) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formatPrice(totalPrecio()) }}</span>
            </div>
          </div>

          <button class="btn-cotizar-final">
            Cotizar Ahora
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      --drawer-width: 400px;
      --primary-red: #E74C3C;
      --dark-bg: #0F1729;
      --light-text: #FFFFFF;
      --secondary-text: #8A9BB4;
      --card-bg: #1A2940;
      --border-color: #2A3F5F;
    }

    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 998;
      cursor: pointer;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: var(--drawer-width);
      height: 100vh;
      background: var(--dark-bg);
      border-left: 1px solid var(--border-color);
      z-index: 999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
    }

    .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-header h2 {
      margin: 0;
      color: var(--light-text);
      font-size: 1.3rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--light-text);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--primary-red);
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .empty-cart p {
      color: var(--secondary-text);
      font-size: 1rem;
      margin: 0 0 20px 0;
    }

    .link-catalog {
      color: var(--primary-red);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .link-catalog:hover {
      color: #C0392B;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .cart-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      position: relative;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      margin: 0 0 4px 0;
      color: var(--light-text);
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .item-price {
      color: var(--primary-red);
      font-weight: 600;
      margin: 4px 0 8px 0;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
    }

    .quantity-control button {
      width: 24px;
      height: 24px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--light-text);
      cursor: pointer;
      border-radius: 2px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .quantity-control button:hover {
      background: var(--primary-red);
      border-color: var(--primary-red);
    }

    .quantity-control span {
      min-width: 24px;
      text-align: center;
      color: var(--light-text);
      font-size: 0.9rem;
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: var(--secondary-text);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      transition: color 0.2s;
    }

    .remove-btn:hover {
      color: var(--primary-red);
    }

    .cart-summary {
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      margin-bottom: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      color: var(--secondary-text);
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .summary-row.total {
      border-top: 1px solid var(--border-color);
      padding-top: 8px;
      margin-top: 8px;
      color: var(--light-text);
      font-weight: 600;
      font-size: 1rem;
    }

    .btn-cotizar-final {
      width: 100%;
      padding: 12px;
      background: var(--primary-red);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-cotizar-final:hover {
      background: #C0392B;
    }

    @media (max-width: 768px) {
      :host {
        --drawer-width: 100%;
      }

      .drawer {
        width: 100%;
      }
    }
  `]
})
export class CarritoPreviewComponent {
  constructor(
    private carritoServicio: CarritoServicio,
    private modalState: ModalStateServicio
  ) {}

  get items() {
    return this.carritoServicio.itemsCarrito;
  }

  get totalPrecio() {
    return this.carritoServicio.totalPrecio;
  }

  get isOpen() {
    return this.modalState.isCarritoDrawerOpen;
  }

  cerrar(): void {
    this.modalState.cerrarCarritoDrawer();
  }

  incrementarCantidad(productoId: number): void {
    // Buscar el producto y agregarlo (aumenta cantidad)
    const item = this.items().find((i: ItemCarrito) => i.producto.id === productoId);
    if (item) {
      this.carritoServicio.agregarProducto(item.producto);
    }
  }

  decrementarCantidad(productoId: number): void {
    const item = this.items().find((i: ItemCarrito) => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      this.carritoServicio.actualizarCantidad(productoId, item.cantidad - 1);
    }
  }

  removerProducto(productoId: number): void {
    this.carritoServicio.quitarProducto(productoId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
}
