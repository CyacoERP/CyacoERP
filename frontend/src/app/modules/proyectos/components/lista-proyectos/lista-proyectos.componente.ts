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
import { RouterLink } from '@angular/router';
import { ProyectoServicio } from '../../services/proyecto.servicio';
import { AuthServicio } from '../../../auth/services/auth.servicio';
import { Proyecto } from '../../models/proyecto.modelo';

type EstadoFiltro = 'todos' | 'en_progreso' | 'finalizado' | 'planificacion';

interface TarjetaProyecto {
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
  hitosCompletados: number;
  totalHitos: number;
}

interface FormNuevoProyecto {
  nombre: string;
  descripcion: string;
  cliente: string;
  gerente: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  presupuesto: number;
}

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-proyectos.componente.html',
  styleUrl: './lista-proyectos.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProyectosComponente implements OnInit {
  private readonly proyectoServicio = inject(ProyectoServicio);
  private readonly authServicio = inject(AuthServicio);

  readonly proyectos = signal<TarjetaProyecto[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly textoBusqueda = signal('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');
  readonly mostrarFormulario = signal(false);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');

  readonly form = signal<FormNuevoProyecto>({
    nombre: '',
    descripcion: '',
    cliente: '',
    gerente: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFinEstimada: '',
    presupuesto: 0,
  });

  readonly esAdmin = computed(() => this.authServicio.tieneRol('admin'));

  readonly proyectosFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const filtro = this.estadoFiltro();

    return this.proyectos().filter((proyecto) => {
      const coincideFiltro = filtro === 'todos' ? true : proyecto.estado === filtro;
      const coincideTexto =
        texto.length === 0
          ? true
          : proyecto.nombre.toLowerCase().includes(texto) ||
            proyecto.cliente.toLowerCase().includes(texto) ||
            proyecto.descripcion.toLowerCase().includes(texto);

      return coincideFiltro && coincideTexto;
    });
  });

  readonly totalProyectos = computed(() => this.proyectos().length);
  readonly enProceso = computed(
    () => this.proyectos().filter((p) => p.estado === 'en_progreso').length,
  );
  readonly completados = computed(
    () => this.proyectos().filter((p) => p.estado === 'finalizado').length,
  );
  readonly presupuestoTotal = computed(() =>
    this.proyectos().reduce((acc, proyecto) => acc + proyecto.presupuesto, 0),
  );

  readonly opcionesFiltro: Array<{ key: EstadoFiltro; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'en_progreso', label: 'En Proceso' },
    { key: 'finalizado', label: 'Completado' },
    { key: 'planificacion', label: 'Pendiente' },
  ];

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.proyectoServicio.obtenerTodos().subscribe({
      next: (datos) => {
        this.proyectos.set((datos ?? []).map((p, i) => this.mapearProyecto(p, i)));
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo conectar con el servidor. Verifica tu sesión.');
        this.proyectos.set([]);
        this.cargando.set(false);
      },
    });
  }

  actualizarBusqueda(evento: Event): void {
    this.textoBusqueda.set((evento.target as HTMLInputElement).value ?? '');
  }

  cambiarFiltro(estado: EstadoFiltro): void {
    this.estadoFiltro.set(estado);
  }

  trackPorId(_: number, proyecto: TarjetaProyecto): number {
    return proyecto.id;
  }

  abrirFormulario(): void {
    this.form.set({
      nombre: '',
      descripcion: '',
      cliente: '',
      gerente: '',
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFinEstimada: '',
      presupuesto: 0,
    });
    this.errorFormulario.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  actualizarCampo(campo: keyof FormNuevoProyecto, valor: string | number): void {
    this.form.update((f) => ({ ...f, [campo]: valor }));
  }

  guardarProyecto(): void {
    const f = this.form();
    if (!f.nombre.trim() || !f.cliente.trim() || !f.fechaInicio || !f.fechaFinEstimada) {
      this.errorFormulario.set('Nombre, cliente y fechas son requeridos.');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');

    const payload = {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      cliente: f.cliente.trim(),
      gerente: f.gerente.trim() || undefined,
      fechaInicio: f.fechaInicio,
      fechaFinEstimada: f.fechaFinEstimada,
      presupuesto: Number(f.presupuesto) || 0,
    } as unknown as Proyecto;

    this.proyectoServicio.crear(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.cargarProyectos();
      },
      error: () => {
        this.guardando.set(false);
        this.errorFormulario.set('Error al crear el proyecto. Intenta de nuevo.');
      },
    });
  }

  private mapearProyecto(proyecto: Proyecto, index: number): TarjetaProyecto {
    const tareas = proyecto.tareas ?? proyecto.hitos ?? [];
    const hitosCompletados = tareas.filter((t) => t.estado === 'completada').length;

    return {
      id: proyecto.id,
      codigo: `PROJ-${String(index + 1).padStart(3, '0')}`,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      estadoLabel: this.obtenerEtiquetaEstado(proyecto.estado),
      gerente: proyecto.gerente ?? 'Sin asignar',
      fechaInicio: new Date(proyecto.fechaInicio),
      fechaFinEstimada: new Date(proyecto.fechaFinEstimada),
      presupuesto: proyecto.presupuesto ?? 0,
      porcentajeAvance: proyecto.porcentajeAvance,
      hitosCompletados,
      totalHitos: tareas.length || 1,
    };
  }

  private obtenerEtiquetaEstado(estado: Proyecto['estado']): string {
    const mapa: Record<Proyecto['estado'], string> = {
      en_progreso: 'En Proceso',
      finalizado: 'Completado',
      planificacion: 'Planificación',
      pausado: 'Pausado',
    };
    return mapa[estado] ?? 'N/D';
  }
}
