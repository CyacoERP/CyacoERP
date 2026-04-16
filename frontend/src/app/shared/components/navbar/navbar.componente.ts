import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthServicio } from '../../../modules/auth/services/auth.servicio';
import { CarritoServicio } from '../../../modules/catalogo/services/carrito.servicio';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.componente.html',
  styleUrl: './navbar.componente.css',
})
export class NavbarComponente {
  readonly carritoServicio = inject(CarritoServicio);
  readonly authServicio = inject(AuthServicio);

  readonly totalItemsCarrito = this.carritoServicio.totalItems;
  readonly usuarioActual = toSignal(this.authServicio.usuarioActual$, { initialValue: null });

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  cerrarSesion(): void {
    this.authServicio.logout();
  }
}

