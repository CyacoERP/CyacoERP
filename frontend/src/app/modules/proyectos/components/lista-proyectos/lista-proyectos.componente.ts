import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProyectoServicio } from '../../services/proyecto.servicio';
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

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-proyectos.componente.html',
  styleUrl: './lista-proyectos.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaProyectosComponente implements OnInit {
  private readonly proyectoServicio = inject(ProyectoServicio);

  readonly proyectos = signal<TarjetaProyecto[]>([]);
  readonly cargando = signal(true);
  readonly textoBusqueda = signal('');
  readonly estadoFiltro = signal<EstadoFiltro>('todos');

  readonly proyectosFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const filtro = this.estadoFiltro();

    return this.proyectos().filter((proyecto) => {
      const coincideFiltro =
        filtro === 'todos' ? true : proyecto.estado === filtro;
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
    this.proyectoServicio.obtenerTodos().subscribe({
      next: (datos) => {
        const proyectosMapeados = (datos ?? []).map((proyecto, index) =>
          this.mapearProyecto(proyecto, index),
        );

        this.proyectos.set(
          proyectosMapeados.length > 0 ? proyectosMapeados : this.crearDatosDemo(),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.proyectos.set(this.crearDatosDemo());
        this.cargando.set(false);
      },
    });
  }

  actualizarBusqueda(evento: Event): void {
    const objetivo = evento.target as HTMLInputElement | null;
    this.textoBusqueda.set(objetivo?.value ?? '');
  }

  cambiarFiltro(estado: EstadoFiltro): void {
    this.estadoFiltro.set(estado);
  }

  trackPorCodigo(_: number, proyecto: TarjetaProyecto): string {
    return proyecto.codigo;
  }

  private mapearProyecto(proyecto: Proyecto, index: number): TarjetaProyecto {
    const totalHitos = proyecto.hitos?.length ?? 0;
    const hitosCompletados = proyecto.hitos?.filter(
      (hito) => (hito.porcentajeAvance ?? 0) >= 100,
    ).length;

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
      totalHitos: totalHitos > 0 ? totalHitos : 1,
    };
  }

  private obtenerEtiquetaEstado(estado: Proyecto['estado']): string {
    switch (estado) {
      case 'en_progreso':
        return 'En Proceso';
      case 'finalizado':
        return 'Completado';
      case 'planificacion':
        return 'Pendiente';
      case 'pausado':
        return 'Pausado';
      default:
        return 'N/D';
    }
  }

  private crearDatosDemo(): TarjetaProyecto[] {
    return [
      {
        id: 1,
        codigo: 'PROJ-001',
        nombre: 'Modernizacion Sistema SCADA - Refineria Cadereyta',
        descripcion:
          'Modernizacion completa del sistema de control y supervision de la refineria, sustituyendo equipos obsoletos por instrumentacion Endress+Hauser de ultima generacion.',
        cliente: 'PEMEX Refinacion',
        estado: 'en_progreso',
        estadoLabel: 'En Proceso',
        gerente: 'Ing. Carlos Vega',
        fechaInicio: new Date('2024-09-01'),
        fechaFinEstimada: new Date('2025-03-31'),
        presupuesto: 2500000,
        porcentajeAvance: 65,
        hitosCompletados: 2,
        totalHitos: 6,
      },
      {
        id: 2,
        codigo: 'PROJ-002',
        nombre: 'Sistema de Medicion Fiscal Gas Natural',
        descripcion:
          'Instalacion de sistema de medicion fiscal para gas natural conforme a norma AGA-9, con cromatografo en linea y sistema de computo de flujo.',
        cliente: 'CFE Generacion II',
        estado: 'en_progreso',
        estadoLabel: 'En Proceso',
        gerente: 'Ing. Laura Reyes',
        fechaInicio: new Date('2024-10-15'),
        fechaFinEstimada: new Date('2025-02-28'),
        presupuesto: 1800000,
        porcentajeAvance: 80,
        hitosCompletados: 3,
        totalHitos: 5,
      },
      {
        id: 3,
        codigo: 'PROJ-003',
        nombre: 'Automatizacion Planta de Tratamiento de Agua',
        descripcion:
          'Automatizacion integral de planta de tratamiento de agua potable con capacidad de 500 L/s, incluyendo instrumentacion de calidad, medicion de flujo y control remoto.',
        cliente: 'SIMAS Monterrey',
        estado: 'finalizado',
        estadoLabel: 'Completado',
        gerente: 'Ing. Diego Ramirez',
        fechaInicio: new Date('2024-08-01'),
        fechaFinEstimada: new Date('2025-01-31'),
        presupuesto: 950000,
        porcentajeAvance: 95,
        hitosCompletados: 5,
        totalHitos: 5,
      },
      {
        id: 4,
        codigo: 'PROJ-004',
        nombre: 'Migracion DCS Honeywell TDC 3000 a Experion',
        descripcion:
          'Migracion del sistema de control distribuido Honeywell TDC 3000 al nuevo sistema Experion PKS, manteniendo continuidad operativa de la planta quimica.',
        cliente: 'BASF Mexico',
        estado: 'planificacion',
        estadoLabel: 'Pendiente',
        gerente: 'Ing. Fernando Castro',
        fechaInicio: new Date('2025-01-01'),
        fechaFinEstimada: new Date('2025-06-30'),
        presupuesto: 3200000,
        porcentajeAvance: 20,
        hitosCompletados: 1,
        totalHitos: 5,
      },
    ];
  }
}
