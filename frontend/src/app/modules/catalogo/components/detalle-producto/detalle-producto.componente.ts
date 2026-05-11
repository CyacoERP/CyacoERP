import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoServicio } from '../../services/producto.servicio';
import { CarritoServicio } from '../../services/carrito.servicio';
import { AuthServicio } from '../../../auth/services/auth.servicio';
import { CompatibilidadProducto, Producto } from '../../../../shared/models/producto.modelo';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-producto.componente.html',
  styleUrl: './detalle-producto.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleProductoComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productoServicio = inject(ProductoServicio);
  private readonly carritoServicio = inject(CarritoServicio);
  private readonly authServicio = inject(AuthServicio);

  readonly producto = signal<Producto | null>(null);
  readonly compatibles = signal<CompatibilidadProducto[]>([]);
  readonly incompatibles = signal<CompatibilidadProducto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly agregado = signal(false);
  readonly alertaIncompatibilidad = signal('');

  get especEntradas(): { clave: string; valor: string }[] {
    const specs = this.producto()?.especificacionesTecnicas as Record<string, unknown> | null;
    if (!specs || typeof specs !== 'object') return [];
    return Object.entries(specs).map(([clave, valor]) => ({ clave, valor: String(valor) }));
  }

  get esAdmin(): boolean {
    return this.authServicio.tieneRol('admin');
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (!id || isNaN(id)) {
        this.router.navigate(['/catalogo']);
        return;
      }
      this.cargar(id);
    });
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.error.set('');

    this.productoServicio.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.cargando.set(false);
        this.cargarCompatibilidades(id);
      },
      error: () => {
        this.error.set('No se pudo cargar el producto. Verifica que exista.');
        this.cargando.set(false);
      },
    });
  }

  private cargarCompatibilidades(id: number): void {
    this.productoServicio.obtenerCompatibilidades(id).subscribe({
      next: (lista) => {
        this.compatibles.set(lista.filter((c) => c.tipo === 'compatible'));
        this.incompatibles.set(lista.filter((c) => c.tipo === 'incompatible'));
      },
    });
  }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p || p.stock <= 0) return;

    const idsEnCarrito = new Set(this.carritoServicio.obtenerIdsProductos());
    const conflictos = this.incompatibles().filter((c) => idsEnCarrito.has(c.productoDestinoId));

    if (conflictos.length > 0) {
      const nombres = conflictos
        .map((c) => c.productoDestino?.nombre ?? `Producto #${c.productoDestinoId}`)
        .join(', ');
      this.alertaIncompatibilidad.set(
        `Advertencia: este producto tiene incompatibilidad con ${nombres}.`,
      );
      setTimeout(() => this.alertaIncompatibilidad.set(''), 5000);
    }

    this.carritoServicio.agregarProducto(p);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  descargarDocumento(): void {
    const url = this.producto()?.urlDocumento;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  volver(): void {
    this.router.navigate(['/catalogo']);
  }
}
