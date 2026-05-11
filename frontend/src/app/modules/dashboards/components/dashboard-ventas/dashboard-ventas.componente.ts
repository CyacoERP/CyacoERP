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
  tendencia: number;
  color: string;
}

interface DatosGraficoLinea {
  mes: string;
  ventas: number;
  cotizaciones: number;
  meta: number;
}

interface DatosGraficoBarra {
  trimestre: string;
  ventas: number;
}

interface CategoriaVentas {
  nombre: string;
  porcentaje: number;
  color: string;
}

interface CotizacionReciente {
  codigo: string;
  cliente: string;
  total: number;
  estado: string;
  estadoClase: string;
}

@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-ventas.componente.html',
  styleUrl: './dashboard-ventas.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardVentasComponente implements OnInit {
  private readonly reporteServicio = inject(ReporteServicio);

  readonly cargando = signal(true);
  readonly periodoSeleccionado = signal<'mes' | 'trimestre' | 'año'>('mes');

  readonly kpis = signal<KPI[]>([
    {
      icono: '$',
      valor: '$7.82M',
      etiqueta: 'Ventas Totales',
      tendencia: 18.4,
      color: 'verde',
    },
    {
      icono: '📋',
      valor: '5',
      etiqueta: 'Cotizaciones',
      tendencia: 12.1,
      color: 'rojo',
    },
    {
      icono: '%',
      valor: '73.4%',
      etiqueta: 'Tasa de Conversión',
      tendencia: 2.3,
      color: 'verde',
    },
    {
      icono: '👥',
      valor: '142',
      etiqueta: 'Clientes Activos',
      tendencia: -3.2,
      color: 'rojo',
    },
  ]);

  readonly datosLinea = signal<DatosGraficoLinea[]>([
    { mes: 'Ene', ventas: 350000, cotizaciones: 12, meta: 400000 },
    { mes: 'Feb', ventas: 320000, cotizaciones: 11, meta: 400000 },
    { mes: 'Mar', ventas: 380000, cotizaciones: 14, meta: 400000 },
    { mes: 'Abr', ventas: 410000, cotizaciones: 16, meta: 400000 },
    { mes: 'May', ventas: 450000, cotizaciones: 18, meta: 400000 },
    { mes: 'Jun', ventas: 380000, cotizaciones: 15, meta: 400000 },
    { mes: 'Jul', ventas: 520000, cotizaciones: 20, meta: 400000 },
    { mes: 'Ago', ventas: 480000, cotizaciones: 19, meta: 400000 },
    { mes: 'Sep', ventas: 550000, cotizaciones: 21, meta: 400000 },
    { mes: 'Oct', ventas: 680000, cotizaciones: 25, meta: 400000 },
    { mes: 'Nov', ventas: 720000, cotizaciones: 27, meta: 400000 },
    { mes: 'Dic', ventas: 750000, cotizaciones: 28, meta: 400000 },
  ]);

  readonly datosBarras = signal<DatosGraficoBarra[]>([
    { trimestre: 'Q1', ventas: 1050000 },
    { trimestre: 'Q2', ventas: 1240000 },
    { trimestre: 'Q3', ventas: 1750000 },
    { trimestre: 'Q4', ventas: 2150000 },
  ]);

  readonly categorias = computed(() => [
    { nombre: 'Sensores Presión', porcentaje: 28, color: '#1e40af' },
    { nombre: 'Flujo', porcentaje: 22, color: '#dc2626' },
    { nombre: 'Temperatura', porcentaje: 18, color: '#f59e0b' },
    { nombre: 'Nivel', porcentaje: 16, color: '#10b981' },
    { nombre: 'Válvulas', porcentaje: 10, color: '#8b5cf6' },
    { nombre: 'Otros', porcentaje: 6, color: '#6b7280' },
  ]);

  readonly cotizacionesRecientes = signal<CotizacionReciente[]>([
    {
      codigo: 'COT-2024-001',
      cliente: 'Pemex Exploracion',
      total: 118500,
      estado: 'Atendida',
      estadoClase: 'atendida',
    },
    {
      codigo: 'COT-2024-002',
      cliente: 'Grupo ALFA',
      total: 135200,
      estado: 'Pendiente',
      estadoClase: 'pendiente',
    },
    {
      codigo: 'COT-2024-003',
      cliente: 'CEMEX Mexico',
      total: 180000,
      estado: 'Rechazada',
      estadoClase: 'rechazada',
    },
    {
      codigo: 'COT-2024-004',
      cliente: 'CFE Generacion',
      total: 293000,
      estado: 'En Proceso',
      estadoClase: 'en_proceso',
    },
    {
      codigo: 'COT-2024-005',
      cliente: 'Bachoco',
      total: 132000,
      estado: 'Pendiente',
      estadoClase: 'pendiente',
    },
  ]);

  readonly maxVentasLinea = computed(
    () => Math.max(...this.datosLinea().map((d) => d.ventas)) / 1000000,
  );
  readonly maxVentasBarras = computed(
    () => Math.max(...this.datosBarras().map((d) => d.ventas)) / 1000000,
  );

  ngOnInit(): void {
    this.reporteServicio.obtenerDashboardVentas().subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  cambiarPeriodo(periodo: 'mes' | 'trimestre' | 'año'): void {
    this.periodoSeleccionado.set(periodo);
  }

  calcularAlturaBarra(ventas: number): { height: string } {
    const max = this.maxVentasBarras();
    const height = `${(ventas / (max * 1000000)) * 100}%`;
    return { height };
  }

  trackPorCodigo(_: number, cotizacion: CotizacionReciente): string {
    return cotizacion.codigo;
  }

  exportarXlsx(): void {
    const encabezado = ['Indicador', 'Valor', 'Tendencia'];
    const filas = this.kpis().map((kpi) => [kpi.etiqueta, kpi.valor, `${kpi.tendencia}%`].join('\t'));
    const contenido = [encabezado.join('\t'), ...filas].join('\n');
    const blob = new Blob([contenido], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard-ventas.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
