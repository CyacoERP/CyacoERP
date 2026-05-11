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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthServicio } from '../../../auth/services/auth.servicio';
import { ProyectoServicio, TareaProyectoApi } from '../../services/proyecto.servicio';

type EstadoTarea = TareaProyectoApi['estado'];

@Component({
  selector: 'app-detalle-tarea-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-tarea-proyecto.componente.html',
  styleUrl: './detalle-tarea-proyecto.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleTareaProyectoComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly proyectoServicio = inject(ProyectoServicio);
  private readonly authServicio = inject(AuthServicio);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly eliminando = signal(false);
  readonly errorAccion = signal('');

  readonly proyectoNombre = signal('');
  readonly proyectoCodigo = signal('');
  readonly tarea = signal<TareaProyectoApi | null>(null);
  readonly form = signal({
    titulo: '',
    descripcion: '',
    estado: 'pendiente' as EstadoTarea,
    progreso: 0,
    orden: 0,
    fechaEstimada: '',
    fechaReal: '',
  });

  readonly esAdmin = computed(() => this.authServicio.tieneRol('admin'));

  proyectoId = 0;
  tareaId = 0;

  ngOnInit(): void {
    const proyectoId = Number(this.route.snapshot.paramMap.get('id'));
    const tareaId = Number(this.route.snapshot.paramMap.get('tareaId'));

    if (!Number.isFinite(proyectoId) || proyectoId <= 0 || !Number.isFinite(tareaId) || tareaId <= 0) {
      this.errorCarga.set('Parámetros de tarea inválidos.');
      this.cargando.set(false);
      return;
    }

    this.proyectoId = proyectoId;
    this.tareaId = tareaId;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    forkJoin({
      proyecto: this.proyectoServicio.obtenerPorId(this.proyectoId),
      tarea: this.proyectoServicio.obtenerTarea(this.proyectoId, this.tareaId),
    }).subscribe({
      next: ({ proyecto, tarea }) => {
        this.proyectoNombre.set(proyecto.nombre);
        this.proyectoCodigo.set(`PROY-${String(proyecto.id).padStart(4, '0')}`);
        this.tarea.set(tarea);
        this.form.set({
          titulo: tarea.titulo,
          descripcion: tarea.descripcion ?? '',
          estado: tarea.estado,
          progreso: tarea.progreso ?? 0,
          orden: tarea.orden ?? 0,
          fechaEstimada: tarea.fechaEstimada ? new Date(tarea.fechaEstimada).toISOString().slice(0, 10) : '',
          fechaReal: tarea.fechaReal ? new Date(tarea.fechaReal).toISOString().slice(0, 10) : '',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el detalle de la tarea.');
        this.cargando.set(false);
      },
    });
  }

  actualizarCampo(
    campo: 'titulo' | 'descripcion' | 'estado' | 'progreso' | 'orden' | 'fechaEstimada' | 'fechaReal',
    valor: string | number,
  ): void {
    this.form.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarCambios(): void {
    if (!this.esAdmin()) {
      return;
    }

    const form = this.form();
    if (!form.titulo.trim()) {
      this.errorAccion.set('El título es obligatorio.');
      return;
    }

    this.guardando.set(true);
    this.errorAccion.set('');

    this.proyectoServicio
      .actualizarTarea(this.proyectoId, this.tareaId, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        estado: form.estado,
        progreso: Number(form.progreso),
        orden: Number(form.orden),
        fechaEstimada: form.fechaEstimada || undefined,
        fechaReal: form.fechaReal || undefined,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.cargarDatos();
        },
        error: () => {
          this.guardando.set(false);
          this.errorAccion.set('No se pudo guardar la tarea.');
        },
      });
  }

  eliminarTarea(): void {
    if (!this.esAdmin()) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set('');

    this.proyectoServicio.eliminarTarea(this.proyectoId, this.tareaId).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.router.navigate(['/proyectos', this.proyectoId]);
      },
      error: () => {
        this.eliminando.set(false);
        this.errorAccion.set('No se pudo eliminar la tarea.');
      },
    });
  }

  labelEstado(estado: EstadoTarea): string {
    const labels: Record<EstadoTarea, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      bloqueada: 'Bloqueada',
      completada: 'Completada',
    };

    return labels[estado] ?? estado;
  }

  formatearFecha(iso?: string | null): string {
    if (!iso) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  }
}
