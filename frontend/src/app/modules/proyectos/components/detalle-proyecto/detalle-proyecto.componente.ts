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
import { ProyectoServicio, TareaProyectoApi, BitacoraProyectoApi } from '../../services/proyecto.servicio';
import { AuthServicio } from '../../../auth/services/auth.servicio';
import { Proyecto } from '../../models/proyecto.modelo';

type EstadoHitoVista = 'completado' | 'en_proceso' | 'pendiente';

interface HitoVista {
  id: number;
  nombre: string;
  descripcion: string;
  fechaTexto: string;
  fechaRealTexto: string;
  fechaEstimadaIso: string;
  fechaRealIso: string;
  progreso: number;
  orden: number;
  estado: EstadoHitoVista;
  estadoBackend: TareaProyectoApi['estado'];
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
  private readonly router = inject(Router);
  private readonly proyectoServicio = inject(ProyectoServicio);
  private readonly authServicio = inject(AuthServicio);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly proyecto = signal<ProyectoDetalleVista | null>(null);
  readonly bitacora = signal<BitacoraProyectoApi[]>([]);

  // Tareas
  readonly mostrarFormTarea = signal(false);
  readonly guardandoTarea = signal(false);
  readonly formTarea = signal({ titulo: '', descripcion: '', fechaEstimada: '' });
  readonly errorTarea = signal('');

  readonly mostrarDetalleTarea = signal(false);
  readonly guardandoDetalleTarea = signal(false);
  readonly eliminandoTarea = signal(false);
  readonly errorDetalleTarea = signal('');
  readonly tareaSeleccionada = signal<HitoVista | null>(null);
  readonly formDetalleTarea = signal({
    titulo: '',
    descripcion: '',
    estado: 'pendiente' as TareaProyectoApi['estado'],
    progreso: 0,
    orden: 0,
    fechaEstimada: '',
    fechaReal: '',
  });

  // Bitácora
  readonly mostrarFormBitacora = signal(false);
  readonly guardandoBitacora = signal(false);
  readonly formBitacora = signal({ nota: '', avance: 0 });
  readonly errorBitacora = signal('');
  readonly mostrandoEditarBitacora = signal(false);
  readonly guardandoEditarBitacora = signal(false);
  readonly eliminandoBitacora = signal(false);
  readonly errorEditarBitacora = signal('');
  readonly bitacoraSeleccionada = signal<BitacoraProyectoApi | null>(null);
  readonly formEditarBitacora = signal({ nota: '', avance: 0 });

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
    this.formTarea.set({ titulo: '', descripcion: '', fechaEstimada: '' });
    this.errorTarea.set('');
    this.mostrarFormTarea.set(true);
  }

  cerrarFormTarea(): void {
    this.mostrarFormTarea.set(false);
  }

  actualizarCampoTarea(campo: 'titulo' | 'descripcion' | 'fechaEstimada', valor: string): void {
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
      .crearTarea(this.proyectoId, {
        titulo: f.titulo.trim(),
        descripcion: f.descripcion.trim() || undefined,
        fechaEstimada: f.fechaEstimada || undefined,
      })
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

  abrirDetalleTarea(hito: HitoVista): void {
    this.tareaSeleccionada.set(hito);
    this.formDetalleTarea.set({
      titulo: hito.nombre,
      descripcion: hito.descripcion,
      estado: hito.estadoBackend,
      progreso: hito.progreso,
      orden: hito.orden,
      fechaEstimada: hito.fechaEstimadaIso,
      fechaReal: hito.fechaRealIso,
    });
    this.errorDetalleTarea.set('');
    this.mostrarDetalleTarea.set(true);
  }

  cerrarDetalleTarea(): void {
    this.mostrarDetalleTarea.set(false);
    this.tareaSeleccionada.set(null);
  }

  actualizarCampoDetalleTarea(
    campo: 'titulo' | 'descripcion' | 'estado' | 'progreso' | 'orden' | 'fechaEstimada' | 'fechaReal',
    valor: string | number,
  ): void {
    this.formDetalleTarea.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarDetalleTarea(): void {
    const tarea = this.tareaSeleccionada();
    const form = this.formDetalleTarea();
    if (!tarea) {
      return;
    }
    if (!form.titulo.trim()) {
      this.errorDetalleTarea.set('El título de la tarea es requerido.');
      return;
    }

    this.guardandoDetalleTarea.set(true);
    this.errorDetalleTarea.set('');

    this.proyectoServicio
      .actualizarTarea(this.proyectoId, tarea.id, {
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
          this.guardandoDetalleTarea.set(false);
          this.cerrarDetalleTarea();
          this.cargarProyecto();
        },
        error: () => {
          this.guardandoDetalleTarea.set(false);
          this.errorDetalleTarea.set('No se pudo actualizar la tarea.');
        },
      });
  }

  eliminarTareaSeleccionada(): void {
    const tarea = this.tareaSeleccionada();
    if (!tarea) {
      return;
    }
    this.eliminandoTarea.set(true);
    this.proyectoServicio.eliminarTarea(this.proyectoId, tarea.id).subscribe({
      next: () => {
        this.eliminandoTarea.set(false);
        this.cerrarDetalleTarea();
        this.cargarProyecto();
      },
      error: () => {
        this.eliminandoTarea.set(false);
        this.errorDetalleTarea.set('No se pudo eliminar la tarea.');
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

  abrirEditarBitacora(entrada: BitacoraProyectoApi): void {
    this.bitacoraSeleccionada.set(entrada);
    this.formEditarBitacora.set({ nota: entrada.nota, avance: entrada.avance ?? 0 });
    this.errorEditarBitacora.set('');
    this.mostrandoEditarBitacora.set(true);
  }

  cerrarEditarBitacora(): void {
    this.mostrandoEditarBitacora.set(false);
    this.bitacoraSeleccionada.set(null);
  }

  actualizarCampoEditarBitacora(campo: 'nota' | 'avance', valor: string | number): void {
    this.formEditarBitacora.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarEditarBitacora(): void {
    const actual = this.bitacoraSeleccionada();
    const form = this.formEditarBitacora();
    if (!actual) {
      return;
    }
    if (!form.nota.trim()) {
      this.errorEditarBitacora.set('La nota es requerida.');
      return;
    }
    this.guardandoEditarBitacora.set(true);
    this.errorEditarBitacora.set('');
    this.proyectoServicio
      .actualizarBitacora(this.proyectoId, actual.id, {
        nota: form.nota.trim(),
        avance: Number(form.avance) || 0,
      })
      .subscribe({
        next: () => {
          this.guardandoEditarBitacora.set(false);
          this.cerrarEditarBitacora();
          this.cargarBitacora();
          this.cargarProyecto();
        },
        error: () => {
          this.guardandoEditarBitacora.set(false);
          this.errorEditarBitacora.set('No se pudo actualizar la nota.');
        },
      });
  }

  eliminarBitacoraSeleccionada(): void {
    const actual = this.bitacoraSeleccionada();
    if (!actual) {
      return;
    }
    this.eliminandoBitacora.set(true);
    this.proyectoServicio.eliminarBitacora(this.proyectoId, actual.id).subscribe({
      next: () => {
        this.eliminandoBitacora.set(false);
        this.cerrarEditarBitacora();
        this.cargarBitacora();
      },
      error: () => {
        this.eliminandoBitacora.set(false);
        this.errorEditarBitacora.set('No se pudo eliminar la nota.');
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

  verTarea(hito: HitoVista): void {
    this.router.navigate(['/proyectos', this.proyectoId, 'tareas', hito.id]);
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
      descripcion: tarea.descripcion ?? '',
      fechaTexto: tarea.fechaEstimada
        ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
            new Date(tarea.fechaEstimada),
          )
        : 'Sin fecha',
      fechaRealTexto: tarea.fechaReal
        ? new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
            new Date(tarea.fechaReal),
          )
        : 'Sin fecha real',
      fechaEstimadaIso: tarea.fechaEstimada ? new Date(tarea.fechaEstimada).toISOString().slice(0, 10) : '',
      fechaRealIso: tarea.fechaReal ? new Date(tarea.fechaReal).toISOString().slice(0, 10) : '',
      progreso: tarea.progreso ?? 0,
      orden: tarea.orden ?? 0,
      estado: mapaEstado[tarea.estado] ?? 'pendiente',
      estadoBackend: tarea.estado,
      estadoLabel: mapaLabel[tarea.estado] ?? tarea.estado,
    };
  }
}
