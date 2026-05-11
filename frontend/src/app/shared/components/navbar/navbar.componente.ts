import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthServicio } from '../../../modules/auth/services/auth.servicio';
import { CarritoServicio } from '../../../modules/catalogo/services/carrito.servicio';
import { ModalStateServicio } from '../../../modules/catalogo/services/modal-state.servicio';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.componente.html',
  styleUrl: './navbar.componente.css',
})
export class NavbarComponente {
  readonly carritoServicio = inject(CarritoServicio);
  private readonly modalState = inject(ModalStateServicio);
  readonly authServicio = inject(AuthServicio);
  private readonly router = inject(Router);

  readonly totalItemsCarrito = this.carritoServicio.totalItems;
  readonly usuarioActual = toSignal(this.authServicio.usuarioActual$, { initialValue: null });

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  cerrarSesion(): void {
    this.authServicio.logout();
  }

  abrirCarritoDrawer(): void {
    this.modalState.abrirCarritoDrawer();
  }

  estaEnSeccion(prefijos: string[]): boolean {
    const actual = this.router.url;
    return prefijos.some((prefijo) => actual.startsWith(prefijo));
  }
}

