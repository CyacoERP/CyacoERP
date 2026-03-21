import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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

  readonly totalItemsCarrito = this.carritoServicio.totalItems;
}

