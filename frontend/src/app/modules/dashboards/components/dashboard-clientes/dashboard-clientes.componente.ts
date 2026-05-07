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
import { ReporteServicio } from '../../services/reporte.servicio';

interface KPI {
  icono: string;
  valor: string;
  etiqueta: string;
  subtexto: string;
  color: string;
}

interface ClientePrincipal {
  nombre: string;
  ventas: number;
}

interface MetricaSalud {
  nombre: string;
  valor: number;
}

interface ClienteDetalle {
  id: number;
  nombre: string;
  proyectos: number;
  cotizaciones: number;
  ventasAnuales: number;
  participacion: number;
}

@Component({
  selector: 'app-dashboard-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-clientes.componente.html',
  styleUrl: './dashboard-clientes.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardClientesComponente implements OnInit {
  private readonly reporteServicio = inject(ReporteServicio);

  readonly cargando = signal(true);

  readonly kpis = signal<KPI[]>([
    {
      icono: '👥',
      valor: '142',
      etiqueta: 'Clientes Totales',
      subtexto: '+12 nuevos este trimestre',
      color: 'azul',
    },
    {
      icono: '$',
      valor: '$178K',
      etiqueta: 'Ingreso Promedio / Cliente',
      subtexto: 'MRR amplios',
      color: 'verde',
    },
    {
      icono: '⭐',
      valor: '72',
      etiqueta: 'NPS (Satisfacción)',
      subtexto: 'Puntuación Nett Promoter',
      color: 'naranja',
    },
  ]);

  readonly clientesPrincipales = signal<ClientePrincipal[]>([
    { nombre: 'PEMEX', ventas: 3200000 },
    { nombre: 'CFE', ventas: 2100000 },
    { nombre: 'BASF', ventas: 1850000 },
    { nombre: 'CEMEX', ventas: 1400000 },
    { nombre: 'Grupo ALFA', ventas: 2400000 },
    { nombre: 'Bachoco', ventas: 780000 },
    { nombre: 'VITRO', ventas: 1100000 },
  ]);

  readonly metricasSalud = signal<MetricaSalud[]>([
    { nombre: 'Ventas', valor: 85 },
    { nombre: 'Crecimiento', valor: 72 },
    { nombre: 'Proyectos', valor: 68 },
    { nombre: 'Satisfacción', valor: 78 },
    { nombre: 'Retención', valor: 82 },
    { nombre: 'Colecciones', valor: 88 },
  ]);

  readonly clientesDetalle = signal<ClienteDetalle[]>([
    {
      id: 1,
      nombre: 'PEMEX',
      proyectos: 6,
      cotizaciones: 24,
      ventasAnuales: 3200000,
      participacion: 24.9,
    },
    {
      id: 2,
      nombre: 'CFE',
      proyectos: 5,
      cotizaciones: 18,
      ventasAnuales: 2100000,
      participacion: 16.4,
    },
    {
      id: 3,
      nombre: 'BASF',
      proyectos: 4,
      cotizaciones: 15,
      ventasAnuales: 1850000,
      participacion: 14.4,
    },
    {
      id: 4,
      nombre: 'CEMEX',
      proyectos: 3,
      cotizaciones: 12,
      ventasAnuales: 1400000,
      participacion: 10.9,
    },
    {
      id: 5,
      nombre: 'Grupo ALFA',
      proyectos: 6,
      cotizaciones: 20,
      ventasAnuales: 2400000,
      participacion: 18.7,
    },
    {
      id: 6,
      nombre: 'Bachoco',
      proyectos: 2,
      cotizaciones: 8,
      ventasAnuales: 780000,
      participacion: 6.1,
    },
    {
      id: 7,
      nombre: 'VITRO',
      proyectos: 3,
      cotizaciones: 11,
      ventasAnuales: 1100000,
      participacion: 8.5,
    },
  ]);

  readonly maxVentasCliente = computed(() =>
    Math.max(...this.clientesPrincipales().map((c) => c.ventas)),
  );

  readonly pointsHexagon = computed(() => {
    const metrics = this.metricasSalud();
    const centerX = 100;
    const centerY = 100;
    const radius = 60;
    const angleSlice = (Math.PI * 2) / metrics.length;

    return metrics
      .map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  });

  readonly ejesHexagon = computed(() => {
    const metrics = this.metricasSalud();
    const centerX = 100;
    const centerY = 100;
    const radius = 60;
    const angleSlice = (Math.PI * 2) / metrics.length;

    return metrics.map((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  readonly pointsDataHexagon = computed(() => {
    const metrics = this.metricasSalud();
    const centerX = 100;
    const centerY = 100;
    const maxValue = 100;
    const angleSlice = (Math.PI * 2) / metrics.length;

    return metrics
      .map((m, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (m.valor / maxValue) * 60;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  });

  readonly puntosData = computed(() => {
    const metrics = this.metricasSalud();
    const centerX = 100;
    const centerY = 100;
    const maxValue = 100;
    const angleSlice = (Math.PI * 2) / metrics.length;

    return metrics.map((m, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (m.valor / maxValue) * 60;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    });
  });

  readonly posicionesEtiquetas = computed(() => {
    const metrics = this.metricasSalud();
    const centerX = 100;
    const centerY = 100;
    const angleSlice = (Math.PI * 2) / metrics.length;
    const radio = 78;

    return metrics.map((metric, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = centerX + radio * Math.cos(angle);
      const y = centerY + radio * Math.sin(angle);
      return { ...metric, x: (x / 200) * 100, y: (y / 200) * 100 };
    });
  });

  ngOnInit(): void {
    this.reporteServicio.obtenerDashboardClientes().subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  calcularAnchoBarraCliente(ventas: number): { width: string } {
    const max = this.maxVentasCliente();
    const width = `${(ventas / max) * 100}%`;
    return { width };
  }

  exportarExcel(): void {
    const encabezado = ['Cliente', 'Proyectos', 'Cotizaciones', 'VentasAnuales', 'Participacion'];
    const filas = this.clientesDetalle().map((c) =>
      [c.nombre, c.proyectos, c.cotizaciones, c.ventasAnuales, c.participacion].join('\t'),
    );
    const contenido = [encabezado.join('\t'), ...filas].join('\n');
    const blob = new Blob([contenido], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard-clientes.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  trackPorId(_: number, cliente: ClienteDetalle): number {
    return cliente.id;
  }

  trackPorNombre(_: number, cliente: ClientePrincipal): string {
    return cliente.nombre;
  }
}
