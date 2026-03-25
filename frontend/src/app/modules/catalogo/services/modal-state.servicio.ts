import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalStateServicio {
  private carritoDrawerAbierto = signal(false);

  readonly isCarritoDrawerOpen = this.carritoDrawerAbierto.asReadonly();

  toggleCarritoDrawer(): void {
    this.carritoDrawerAbierto.update(v => !v);
  }

  abrirCarritoDrawer(): void {
    this.carritoDrawerAbierto.set(true);
  }

  cerrarCarritoDrawer(): void {
    this.carritoDrawerAbierto.set(false);
  }
}
