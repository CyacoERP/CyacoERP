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
import { Categoria, Producto } from '../../../../shared/models/producto.modelo';

type ModoModal = 'crear' | 'editar';

interface FormProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoriaId: number;
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

  readonly formVacio: FormProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    categoriaId: 0,
  };

  readonly form = signal<FormProducto>({ ...this.formVacio });

  readonly productosFiltrados = computed(() => {
    const termino = this.termino().trim().toLowerCase();
    if (!termino) {
      return this.productos();
    }

    return this.productos().filter((producto) => {
      return (
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.descripcion ?? '').toLowerCase().includes(termino) ||
        (producto.categoria?.nombre ?? '').toLowerCase().includes(termino)
      );
    });
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.productoServicio.obtenerTodos().subscribe({
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
      next: (categorias) => {
        this.categorias.set(categorias as Categoria[]);
      },
    });
  }

  buscar(event: Event): void {
    this.termino.set((event.target as HTMLInputElement).value ?? '');
  }

  abrirCrear(): void {
    this.modoModal.set('crear');
    this.productoEditando.set(null);
    this.form.set({ ...this.formVacio });
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
      categoriaId: producto.categoriaId,
    });
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  actualizarCampo(campo: keyof FormProducto, valor: string | number): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

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
      this.errorModal.set('Selecciona una categoria.');
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagenUrl: form.imagenUrl.trim() || undefined,
      categoriaId: Number(form.categoriaId),
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
    if (!producto) {
      return;
    }

    this.productoServicio.eliminar(producto.id).subscribe({
      next: () => {
        this.mostrarConfirmEliminar.set(false);
        this.productoAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.mostrarConfirmEliminar.set(false);
      },
    });
  }

  trackPorId(_: number, producto: Producto): number {
    return producto.id;
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