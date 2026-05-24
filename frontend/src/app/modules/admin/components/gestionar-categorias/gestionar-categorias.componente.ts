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
import { CategoriaServicio } from '../../../catalogo/services/categoria.servicio';

type ModoModal = 'crear' | 'editar';

interface FormCategoria {
  nombre: string;
  descripcion: string;
}

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  creadoEn?: string;
}

@Component({
  selector: 'app-gestionar-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-categorias.componente.html',
  styleUrl: './gestionar-categorias.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionarCategoriasComponente implements OnInit {
  private readonly categoriaServicio = inject(CategoriaServicio);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly termino = signal('');

  readonly mostrarModal = signal(false);
  readonly modoModal = signal<ModoModal>('crear');
  readonly categoriaEditando = signal<Categoria | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');

  readonly mostrarConfirmEliminar = signal(false);
  readonly categoriaAEliminar = signal<Categoria | null>(null);
  readonly eliminando = signal(false);
  readonly errorEliminar = signal('');

  readonly form = signal<FormCategoria>({ nombre: '', descripcion: '' });

  readonly categoriasFiltradas = computed(() => {
    const t = this.termino().toLowerCase().trim();
    if (!t) return this.categorias();
    return this.categorias().filter(
      (c) =>
        c.nombre.toLowerCase().includes(t) ||
        (c.descripcion ?? '').toLowerCase().includes(t),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.categoriaServicio.obtenerTodas().subscribe({
      next: (datos) => {
        this.categorias.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudieron cargar las categorías.');
        this.cargando.set(false);
      },
    });
  }

  abrirCrear(): void {
    this.form.set({ nombre: '', descripcion: '' });
    this.modoModal.set('crear');
    this.categoriaEditando.set(null);
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  abrirEditar(categoria: Categoria): void {
    this.form.set({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' });
    this.modoModal.set('editar');
    this.categoriaEditando.set(categoria);
    this.errorModal.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.errorModal.set('');
  }

  guardar(): void {
    const f = this.form();
    if (!f.nombre.trim()) {
      this.errorModal.set('El nombre es obligatorio.');
      return;
    }

    this.guardando.set(true);
    this.errorModal.set('');
    const payload = { nombre: f.nombre.trim(), descripcion: f.descripcion.trim() || null };

    if (this.modoModal() === 'crear') {
      this.categoriaServicio.crear(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorModal.set(err?.error?.message ?? 'Error al crear la categoría.');
        },
      });
    } else {
      const id = this.categoriaEditando()!.id;
      this.categoriaServicio.actualizar(id, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarModal();
          this.cargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.errorModal.set(err?.error?.message ?? 'Error al actualizar la categoría.');
        },
      });
    }
  }

  confirmarEliminar(categoria: Categoria): void {
    this.categoriaAEliminar.set(categoria);
    this.errorEliminar.set('');
    this.mostrarConfirmEliminar.set(true);
  }

  cancelarEliminar(): void {
    this.mostrarConfirmEliminar.set(false);
    this.categoriaAEliminar.set(null);
    this.errorEliminar.set('');
  }

  ejecutarEliminar(): void {
    const cat = this.categoriaAEliminar();
    if (!cat) return;
    this.eliminando.set(true);
    this.categoriaServicio.eliminar(cat.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cancelarEliminar();
        this.cargar();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.errorEliminar.set(
          err?.error?.message ?? 'No se puede eliminar. La categoría puede tener productos asociados.',
        );
      },
    });
  }

  actualizarTermino(valor: string): void {
    this.termino.set(valor);
  }
}
