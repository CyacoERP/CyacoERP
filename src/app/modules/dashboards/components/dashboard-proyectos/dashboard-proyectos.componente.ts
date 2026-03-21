import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteServicio } from '../../services/reporte.servicio';

interface KPI {
  icono: string;
  valor: string;
  etiqueta: string;
  color: string;
}

interface ProyectoAvance {
  codigo: string;
  avance: number;
}

interface DatosLineaProyectos {
  mes: string;
  abiertos: number;
  cerrados: number;
}

interface EstadoProyecto {
  id: number;
  codigo: string;
  nombre: string;
  cliente: string;
  avance: number;
  hitosCompletados: number;
  hitosTotal: number;
  presupuesto: number;
  estado: string;
  estadoClase: string;
}

@Component({
  selector: 'app-dashboard-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-proyectos.componente.html',
  styleUrl: './dashboard-proyectos.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProyectosComponente implements OnInit {
  private readonly reporteServicio = inject(ReporteServicio);

  readonly cargando = signal(true);
  readonly filtroSeleccionado = signal<'ventas' | 'clientes' | 'proyectos'>(
    'proyectos',
  );

  readonly kpis = signal<KPI[]>([
    {
      icono: '📁',
      valor: '4',
      etiqueta: 'Total Proyectos',
      color: 'azul',
    },
    {
      icono: '⏳',
      valor: '3',
      etiqueta: 'En Proceso',
      color: 'naranja',
    },
    {
      icono: '✓',
      valor: '1',
      etiqueta: 'Completados',
      color: 'verde',
    },
    {
      icono: '$',
      valor: '$8.4M',
      etiqueta: 'Presupuesto Total',
      color: 'purpura',
    },
  ]);

  readonly avancePromedio = signal(65);

  readonly proyectosAvance = signal<ProyectoAvance[]>([
    { codigo: 'PROJ-001', avance: 78 },
    { codigo: 'PROJ-002', avance: 80 },
    { codigo: 'PROJ-003', avance: 85 },
    { codigo: 'PROJ-004', avance: 20 },
  ]);

  readonly datosLineaProyectos = signal<DatosLineaProyectos[]>([
    { mes: 'Oct', abiertos: 2, cerrados: 1 },
    { mes: 'Nov', abiertos: 3, cerrados: 2 },
    { mes: 'Dic', abiertos: 3, cerrados: 2 },
    { mes: 'Ene', abiertos: 4, cerrados: 3 },
    { mes: 'Feb', abiertos: 3, cerrados: 4 },
  ]);

  readonly estadosProyectos = signal<EstadoProyecto[]>([
    {
      id: 1,
      codigo: 'PROJ-001',
      nombre: 'Modernización Sistema SCADA...',
      cliente: 'PEMEX Refinación',
      avance: 65,
      hitosCompletados: 3,
      hitosTotal: 6,
      presupuesto: 2500000,
      estado: 'En Proceso',
      estadoClase: 'en_proceso',
    },
    {
      id: 2,
      codigo: 'PROJ-002',
      nombre: 'Sistema de Medición Fiscal Gas...',
      cliente: 'CFE Generacion II',
      avance: 80,
      hitosCompletados: 3,
      hitosTotal: 5,
      presupuesto: 1600000,
      estado: 'En Proceso',
      estadoClase: 'en_proceso',
    },
    {
      id: 3,
      codigo: 'PROJ-003',
      nombre: 'Automatización Planta de Tratam...',
      cliente: 'SMAS Monterrey',
      avance: 95,
      hitosCompletados: 5,
      hitosTotal: 5,
      presupuesto: 950000,
      estado: 'Completado',
      estadoClase: 'completado',
    },
    {
      id: 4,
      codigo: 'PROJ-004',
      nombre: 'Migración DCS Honeywood TDC 3...',
      cliente: 'BASF México',
      avance: 20,
      hitosCompletados: 1,
      hitosTotal: 5,
      presupuesto: 3200000,
      estado: 'En Proceso',
      estadoClase: 'en_proceso_yellow',
    },
  ]);

  readonly maxAvanceProyecto = computed(
    () => Math.max(...this.proyectosAvance().map((p) => p.avance)) / 100,
  );

  readonly maxProyectosLinea = computed(() =>
    Math.max(
      ...this.datosLineaProyectos().map((d) => Math.max(d.abiertos, d.cerrados)),
    ),
  );

  ngOnInit(): void {
    this.reporteServicio.obtenerDashboardProyectos().subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltro(
    filtro: 'ventas' | 'clientes' | 'proyectos',
  ): void {
    this.filtroSeleccionado.set(filtro);
  }

  calcularAnchoBarraAvance(avance: number): { width: string } {
    const width = `${avance}%`;
    return { width };
  }

  calcularAlturaPuntoLinea(valor: number): { height: string } {
    const max = this.maxProyectosLinea();
    const height = `${(valor / max) * 100}%`;
    return { height };
  }

  trackPorCodigo(_: number, proyecto: ProyectoAvance): string {
    return proyecto.codigo;
  }

  trackPorId(_: number, proyecto: EstadoProyecto): number {
    return proyecto.id;
  }
}
