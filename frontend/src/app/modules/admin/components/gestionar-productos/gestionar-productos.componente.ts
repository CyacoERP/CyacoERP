import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoServicio } from '../../../catalogo/services/producto.servicio';
import { CategoriaServicio } from '../../../catalogo/services/categoria.servicio';
import { Categoria, CompatibilidadProducto, Producto } from '../../../../shared/models/producto.modelo';

type ModoModal = 'crear' | 'editar';

interface EspecPar {
  clave: string;
  valor: string;
}

interface FormProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  urlDocumento: string;
  categoriaId: number;
  fabricante: string;
  numeroParte: string;
  skuInterno: string;
  familia: string;
  moneda: 'MXN' | 'USD';
}

interface FormCompatibilidad {
  productoDestinoId: number;
  tipo: 'compatible' | 'incompatible';
  nota: string;
}

@Component({
  selector: 'app-gestionar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-productos.componente.html',
  styleUrl: './gestionar-productos.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionarProductosComponente implements OnInit {
  private readonly productoServicio = inject(ProductoServicio);
  private readonly categoriaServicio = inject(CategoriaServicio);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly termino = signal('');

  readonly mostrarModal = signal(false);
  readonly modoModal = signal<ModoModal>('crear');
  readonly productoEditando = signal<Producto | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');

  readonly mostrarConfirmEliminar = signal(false);
  readonly productoAEliminar = signal<Producto | null>(null);

  // Especificaciones técnicas como pares clave/valor
  readonly especPares = signal<EspecPar[]>([]);

  // Compatibilidades (solo modo editar)
  readonly compatibilidades = signal<CompatibilidadProducto[]>([]);
  readonly cargandoCompat = signal(false);
  readonly formCompat = signal<FormCompatibilidad>({ productoDestinoId: 0, tipo: 'compatible', nota: '' });
  readonly guardandoCompat = signal(false);
  readonly errorCompat = signal('');

  readonly formVacio: FormProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    urlDocumento: '',
    categoriaId: 0,
    fabricante: '',
    numeroParte: '',
    skuInterno: '',
    familia: '',
    moneda: 'MXN',
  };

  readonly form = signal<FormProducto>({ ...this.formVacio });

  readonly productosFiltrados = computed(() => {
    const termino = this.termino().trim().toLowerCase();
    if (!termino) {
      return this.productos();
    }
    return this.productos().filter((p) =>
      p.nombre.toLowerCase().includes(termino) ||
      (p.descripcion ?? '').toLowerCase().includes(termino) ||
      (p.categoria?.nombre ?? '').toLowerCase().includes(termino) ||
      (p.fabricante ?? '').toLowerCase().includes(termino) ||
      (p.skuInterno ?? '').toLowerCase().includes(termino),
    );
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.productoServicio.obtenerTodos({ incluirInactivos: true }).subscribe({
      next: (productos) => {
        this.productos.set(productos as Producto[]);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar la lista de productos.');
        this.cargando.set(false);
      },
    });
  }

  cargarCategorias(): void {
    this.categoriaServicio.obtenerTodas().subscribe({
      next: (categorias) => this.categorias.set(categorias as Categoria[]),
    });
  }

  buscar(event: Event): void {
    this.termino.set((event.target as HTMLInputElement).value ?? '');
  }

  abrirCrear(): void {
    this.modoModal.set('crear');
    this.productoEditando.set(null);
    this.form.set({ ...this.formVacio });
    this.especPares.set([]);
    this.compatibilidades.set([]);
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  abrirEditar(producto: Producto): void {
    this.modoModal.set('editar');
    this.productoEditando.set(producto);
    this.form.set({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl ?? '',
      urlDocumento: producto.urlDocumento ?? '',
      categoriaId: producto.categoriaId,
      fabricante: producto.fabricante ?? '',
      numeroParte: producto.numeroParte ?? '',
      skuInterno: producto.skuInterno ?? '',
      familia: producto.familia ?? '',
      moneda: (producto.moneda as 'MXN' | 'USD') ?? 'MXN',
    });

    // Parsear especificaciones técnicas
    const specs = producto.especificacionesTecnicas as Record<string, string> | null;
    if (specs && typeof specs === 'object') {
      this.especPares.set(
        Object.entries(specs).map(([clave, valor]) => ({ clave, valor: String(valor) })),
      );
    } else {
      this.especPares.set([]);
    }

    this.errorModal.set('');
    this.mostrarModal.set(true);

    // Cargar compatibilidades
    this.cargandoCompat.set(true);
    this.productoServicio.obtenerCompatibilidades(producto.id).subscribe({
      next: (compat) => {
        this.compatibilidades.set(compat);
        this.cargandoCompat.set(false);
      },
      error: () => this.cargandoCompat.set(false),
    });
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  actualizarCampo(campo: keyof FormProducto, valor: string | number): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  // ─── Especificaciones ────────────────────────────────────────────────────
  agregarEspec(): void {
    this.especPares.update((pares) => [...pares, { clave: '', valor: '' }]);
  }

  quitarEspec(index: number): void {
    this.especPares.update((pares) => pares.filter((_, i) => i !== index));
  }

  actualizarEspec(index: number, campo: 'clave' | 'valor', valor: string): void {
    this.especPares.update((pares) =>
      pares.map((par, i) => (i === index ? { ...par, [campo]: valor } : par)),
    );
  }

  // ─── Compatibilidades ────────────────────────────────────────────────────
  actualizarFormCompat(campo: keyof FormCompatibilidad, valor: string | number): void {
    this.formCompat.update((f) => ({ ...f, [campo]: campo === 'productoDestinoId' ? Number(valor) : valor }));
  }

  agregarCompatibilidad(): void {
    const productoId = this.productoEditando()?.id;
    const fc = this.formCompat();
    if (!productoId || fc.productoDestinoId <= 0) {
      this.errorCompat.set('Selecciona un producto de destino.');
      return;
    }
    this.guardandoCompat.set(true);
    this.errorCompat.set('');
    this.productoServicio.crearCompatibilidad(productoId, {
      productoDestinoId: fc.productoDestinoId,
      tipo: fc.tipo,
      nota: fc.nota.trim() || undefined,
    }).subscribe({
      next: () => {
        this.guardandoCompat.set(false);
        this.formCompat.set({ productoDestinoId: 0, tipo: 'compatible', nota: '' });
        this.recargarCompatibilidades(productoId);
      },
      error: (err) => {
        this.guardandoCompat.set(false);
        this.errorCompat.set(err?.error?.message ?? 'Error al agregar compatibilidad.');
      },
    });
  }

  eliminarCompatibilidad(compatId: number): void {
    const productoId = this.productoEditando()?.id;
    if (!productoId) return;
    this.productoServicio.eliminarCompatibilidad(productoId, compatId).subscribe({
      next: () => this.recargarCompatibilidades(productoId),
    });
  }

  private recargarCompatibilidades(productoId: number): void {
    this.productoServicio.obtenerCompatibilidades(productoId).subscribe({
      next: (compat) => this.compatibilidades.set(compat),
    });
  }

  // ─── Guardar producto ────────────────────────────────────────────────────
  guardar(): void {
    const form = this.form();

    if (!form.nombre.trim()) {
      this.errorModal.set('El nombre del producto es requerido.');
      return;
    }
    if (form.precio <= 0) {
      this.errorModal.set('El precio debe ser mayor a 0.');
      return;
    }
    if (form.categoriaId <= 0) {
      this.errorModal.set('Selecciona una categoría.');
      return;
    }

    // Construir especificacionesTecnicas desde los pares
    const pares = this.especPares().filter((p) => p.clave.trim());
    const especificacionesTecnicas = pares.length > 0
      ? Object.fromEntries(pares.map((p) => [p.clave.trim(), p.valor.trim()]))
      : undefined;

    const payload: Partial<Producto> = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagenUrl: form.imagenUrl.trim() || undefined,
      urlDocumento: form.urlDocumento.trim() || undefined,
      categoriaId: Number(form.categoriaId),
      fabricante: form.fabricante.trim() || undefined,
      numeroParte: form.numeroParte.trim() || undefined,
      skuInterno: form.skuInterno.trim() || undefined,
      familia: form.familia.trim() || undefined,
      moneda: form.moneda,
      especificacionesTecnicas: especificacionesTecnicas as Record<string, unknown>,
    };

    this.guardando.set(true);
    this.errorModal.set('');

    if (this.modoModal() === 'crear') {
      this.productoServicio.crear(payload).subscribe({
        next: () => this.onGuardadoOk(),
        error: (err) => this.onGuardadoError(err),
      });
      return;
    }

    const id = this.productoEditando()?.id;
    if (!id) {
      this.guardando.set(false);
      return;
    }

    this.productoServicio.actualizar(id, payload).subscribe({
      next: () => this.onGuardadoOk(),
      error: (err) => this.onGuardadoError(err),
    });
  }

  confirmarEliminar(producto: Producto): void {
    this.productoAEliminar.set(producto);
    this.mostrarConfirmEliminar.set(true);
  }

  cancelarEliminar(): void {
    this.mostrarConfirmEliminar.set(false);
    this.productoAEliminar.set(null);
  }

  ejecutarEliminar(): void {
    const producto = this.productoAEliminar();
    if (!producto) return;

    this.productoServicio.eliminar(producto.id).subscribe({
      next: () => {
        this.mostrarConfirmEliminar.set(false);
        this.productoAEliminar.set(null);
        this.cargar();
      },
      error: () => this.mostrarConfirmEliminar.set(false),
    });
  }

  trackPorId(_: number, producto: Producto): number {
    return producto.id;
  }

  trackPorIndex(index: number): number {
    return index;
  }

  private onGuardadoOk(): void {
    this.guardando.set(false);
    this.mostrarModal.set(false);
    this.cargar();
  }

  private onGuardadoError(err: { error?: { message?: string | string[] } }): void {
    this.guardando.set(false);
    const msg = err?.error?.message ?? 'Error al guardar. Verifica los datos.';
    this.errorModal.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
}