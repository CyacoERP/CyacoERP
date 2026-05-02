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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProyectoServicio, TareaProyectoApi, BitacoraProyectoApi } from '../../services/proyecto.servicio';
import { AuthServicio } from '../../../auth/services/auth.servicio';
import { Proyecto } from '../../models/proyecto.modelo';

type EstadoHitoVista = 'completado' | 'en_proceso' | 'pendiente';

interface HitoVista {
  id: number;
  nombre: string;
  fechaTexto: string;
  progreso: number;
  estado: EstadoHitoVista;
  estadoLabel: string;
}

interface ProyectoDetalleVista {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  estado: Proyecto['estado'];
  estadoLabel: string;
  gerente: string;
  fechaInicio: Date;
  fechaFinEstimada: Date;
  presupuesto: number;
  porcentajeAvance: number;
  hitos: HitoVista[];
}

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-proyecto.componente.html',
  styleUrl: './detalle-proyecto.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleProyectoComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly proyectoServicio = inject(ProyectoServicio);
  private readonly authServicio = inject(AuthServicio);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly proyecto = signal<ProyectoDetalleVista | null>(null);
  readonly bitacora = signal<BitacoraProyectoApi[]>([]);

  // Tareas
  readonly mostrarFormTarea = signal(false);
  readonly guardandoTarea = signal(false);
  readonly formTarea = signal({ titulo: '', descripcion: '' });
  readonly errorTarea = signal('');

  // Bitácora
  readonly mostrarFormBitacora = signal(false);
  readonly guardandoBitacora = signal(false);
  readonly formBitacora = signal({ nota: '', avance: 0 });
  readonly errorBitacora = signal('');

  readonly esAdmin = computed(() => this.authServicio.tieneRol('admin'));

  readonly resumenHitos = computed(() => {
    const detalle = this.proyecto();
    if (!detalle) {
      return { completados: 0, enProceso: 0, pendientes: 0 };
    }

    return {
      completados: detalle.hitos.filter((hito) => hito.estado === 'completado').length,
      enProceso: detalle.hitos.filter((hito) => hito.estado === 'en_proceso').length,
      pendientes: detalle.hitos.filter((hito) => hito.estado === 'pendiente').length,
    };
  });

  private proyectoId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.errorCarga.set('ID de proyecto inválido.');
      this.cargando.set(false);
      return;
    }

    this.proyectoId = id;
    this.cargarProyecto();
  }

  cargarProyecto(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.proyectoServicio.obtenerPorId(this.proyectoId).subscribe({
      next: (proyecto) => {
        this.proyecto.set(this.mapearDetalle(proyecto));
        this.cargando.set(false);
        this.cargarBitacora();
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el proyecto. Verifica tu sesión o conexión.');
        this.cargando.set(false);
      },
    });
  }

  cargarBitacora(): void {
    this.proyectoServicio.obtenerBitacora(this.proyectoId).subscribe({
      next: (entradas) => this.bitacora.set(entradas ?? []),
      error: () => {},
    });
  }

  // --- Tareas ---
  abrirFormTarea(): void {
    this.formTarea.set({ titulo: '', descripcion: '' });
    this.errorTarea.set('');
    this.mostrarFormTarea.set(true);
  }

  cerrarFormTarea(): void {
    this.mostrarFormTarea.set(false);
  }

  actualizarCampoTarea(campo: 'titulo' | 'descripcion', valor: string): void {
    this.formTarea.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarTarea(): void {
    const f = this.formTarea();
    if (!f.titulo.trim()) {
      this.errorTarea.set('El título de la tarea es requerido.');
      return;
    }
    this.guardandoTarea.set(true);
    this.errorTarea.set('');

    this.proyectoServicio
      .crearTarea(this.proyectoId, { titulo: f.titulo.trim(), descripcion: f.descripcion.trim() || undefined })
      .subscribe({
        next: () => {
          this.guardandoTarea.set(false);
          this.mostrarFormTarea.set(false);
          this.cargarProyecto();
        },
        error: () => {
          this.guardandoTarea.set(false);
          this.errorTarea.set('Error al crear la tarea. Intenta de nuevo.');
        },
      });
  }

  // --- Bitácora ---
  abrirFormBitacora(): void {
    this.formBitacora.set({ nota: '', avance: this.proyecto()?.porcentajeAvance ?? 0 });
    this.errorBitacora.set('');
    this.mostrarFormBitacora.set(true);
  }

  cerrarFormBitacora(): void {
    this.mostrarFormBitacora.set(false);
  }

  actualizarCampoBitacora(campo: 'nota' | 'avance', valor: string | number): void {
    this.formBitacora.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarBitacora(): void {
    const f = this.formBitacora();
    if (!f.nota.trim()) {
      this.errorBitacora.set('La nota es requerida.');
      return;
    }
    this.guardandoBitacora.set(true);
    this.errorBitacora.set('');

    this.proyectoServicio
      .agregarBitacora(this.proyectoId, { nota: f.nota.trim(), avance: Number(f.avance) || undefined })
      .subscribe({
        next: () => {
          this.guardandoBitacora.set(false);
          this.mostrarFormBitacora.set(false);
          this.cargarBitacora();
        },
        error: () => {
          this.guardandoBitacora.set(false);
          this.errorBitacora.set('Error al guardar la entrada. Intenta de nuevo.');
        },
      });
  }

  formatearFechaISO(iso: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  }

  private mapearDetalle(proyecto: Proyecto): ProyectoDetalleVista {
    const tareas = (proyecto.tareas ?? proyecto.hitos ?? []) as TareaProyectoApi[];

    const estadoLabels: Record<string, string> = {
      planificacion: 'Planificación',
      en_progreso: 'En Progreso',
      pausado: 'Pausado',
      finalizado: 'Finalizado',
    };

    return {
      id: proyecto.id,
      codigo: `PROY-${String(proyecto.id).padStart(4, '0')}`,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? '',
      cliente: proyecto.cliente ?? '',
      estado: proyecto.estado,
      estadoLabel: estadoLabels[proyecto.estado] ?? proyecto.estado,
      gerente: proyecto.gerente ?? 'No asignado',
      fechaInicio: new Date(proyecto.fechaInicio),
      fechaFinEstimada: new Date(proyecto.fechaFinEstimada),
      presupuesto: proyecto.presupuesto ?? 0,
      porcentajeAvance: proyecto.porcentajeAvance ?? 0,
      hitos: tareas.map((t) => this.mapearTareaAHito(t)),
    };
  }

  private mapearTareaAHito(tarea: TareaProyectoApi): HitoVista {
    const mapaEstado: Record<TareaProyectoApi['estado'], EstadoHitoVista> = {
      completada: 'completado',
      en_progreso: 'en_proceso',
      pendiente: 'pendiente',
      bloqueada: 'pendiente',
    };

    const mapaLabel: Record<TareaProyectoApi['estado'], string> = {
      completada: 'Completada',
      en_progreso: 'En Proceso',
      pendiente: 'Pendiente',
      bloqueada: 'Bloqueada',
    };

    return {
      id: tarea.id,
      nombre: tarea.titulo,
      fechaTexto: tarea.fechaEstimada
        ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
            new Date(tarea.fechaEstimada),
          )
        : 'Sin fecha',
      progreso: tarea.progreso ?? 0,
      estado: mapaEstado[tarea.estado] ?? 'pendiente',
      estadoLabel: mapaLabel[tarea.estado] ?? tarea.estado,
    };
  }
}
