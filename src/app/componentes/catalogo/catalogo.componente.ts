import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductoCardComponente } from '../producto-card/producto-card.componente';
import { ProductoServicio } from '../../servicios/producto.servicio';
import { CarritoServicio } from '../../servicios/carrito.servicio';
import { Producto } from '../../modelos/producto.modelo';

@Component({
  selector: 'app-catalogo',
  imports: [ProductoCardComponente, RouterLink],
  standalone: true,
  templateUrl: './catalogo.componente.html',
  styleUrl: './catalogo.componente.css',
})
export class CatalogoComponente implements OnInit {
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);

  constructor(
    private productoServicio: ProductoServicio,
    private carritoServicio: CarritoServicio
  ) {}

  get totalItemsCarrito(): number {
    return this.carritoServicio.totalItems();
  }

  ngOnInit(): void {
    this.productoServicio.obtenerTodos().subscribe({
      next: (prods) => {
        this.productos.set(prods);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  onAgregarAlCarrito(producto: Producto): void {
    this.carritoServicio.agregarProducto(producto);
  }
}
