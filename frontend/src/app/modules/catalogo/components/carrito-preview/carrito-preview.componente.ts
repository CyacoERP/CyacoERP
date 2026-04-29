import { Component } from '@angular/core';
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
        <h2>
          Cotización
          @if (items().length > 0) {
            <span class="badge-items">{{ items().length }} items</span>
          }
        </h2>
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
                <img [src]="item.producto.imagenUrl || '/assets/default-product.png'" [alt]="item.producto.nombre" class="item-image">
                <div class="item-details">
                  <h4>{{ item.producto.nombre }}</h4>
                  <p class="item-sku">ID: {{ item.producto.id }}</p>
                  <div class="quantity-control">
                    <button (click)="decrementarCantidad(item.producto.id)" class="qty-btn">−</button>
                    <span class="qty-value">{{ item.cantidad }}</span>
                    <button (click)="incrementarCantidad(item.producto.id)" class="qty-btn">+</button>
                  </div>
                </div>
                <div class="item-right">
                  <button class="remove-btn" (click)="removerProducto(item.producto.id)" title="Eliminar">×</button>
                  <div class="item-price">{{ formatPrice(item.producto.precio) }}</div>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary">
            <div class="summary-label">Subtotal estimado:</div>
            <div class="summary-total">{{ formatPrice(totalPrecio()) }}</div>
            
            <div class="info-text">
              El precio final se confirmará en la cotización formal
            </div>

            <a routerLink="/cotizaciones/solicitar" (click)="cerrar()" class="btn-solicitar">
              Solicitar Cotización Formal
            </a>

            <a routerLink="/catalogo" (click)="cerrar()" class="link-continue">
              Continuar explorando
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      --drawer-width: 400px;
      --primary-red: #ef2a2a;
      --dark-bg: #0f2044;
      --light-text: #ffffff;
      --secondary-text: #6b7280;
      --card-bg: #f3f4f6;
      --border-color: #e5e7eb;
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
      background: var(--card-bg);
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
      background: var(--dark-bg);
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-header h2 {
      margin: 0;
      color: var(--light-text);
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-items {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-red);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 12px;
      min-width: 50px;
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
      color: #dbeafe;
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
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
      color: #4b5563;
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
      flex-shrink: 0;
    }

    .cart-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #eceff3;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      position: relative;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-details h4 {
      margin: 0 0 4px 0;
      color: #111827;
      font-size: 0.95rem;
      line-height: 1.2;
      font-weight: 600;
    }

    .item-sku {
      color: #6b7280;
      font-size: 0.8rem;
      margin: 2px 0 8px 0;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 6px;
      width: fit-content;
    }

    .qty-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: #d1d5db;
      color: #374151;
      cursor: pointer;
      border-radius: 50%;
      font-size: 0.85rem;
      transition: all 0.2s;
      padding: 0;
    }

    .qty-btn:hover {
      background: #c4c9d1;
    }

    .qty-value {
      min-width: 24px;
      text-align: center;
      color: #111827;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .item-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-between;
      gap: 8px;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 1.3rem;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      color: #6b7280;
    }

    .item-price {
      color: #1e3a8a;
      font-weight: 700;
      font-size: 1.15rem;
      text-align: right;
    }

    .cart-summary {
      padding: 20px;
      background: #f3f4f6;
      border-radius: 0;
      border: none;
      border-top: 1px solid #d1d5db;
      margin-top: auto;
      flex-shrink: 0;
    }

    .summary-label {
      color: #334155;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .summary-total {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
    }

    .info-text {
      color: #94a3b8;
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: 16px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 0;
    }

    .btn-solicitar {
      display: block;
      text-align: center;
      text-decoration: none;
      width: 100%;
      padding: 13px;
      background: var(--primary-red);
      color: white;
      border: none;
      border-radius: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 12px;
      font-size: 1.03rem;
    }

    .btn-solicitar:hover {
      background: #dc2626;
    }

    .link-continue {
      display: block;
      text-align: center;
      color: #475569;
      text-decoration: none;
      font-size: 1.1rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .link-continue:hover {
      color: #1f2937;
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
