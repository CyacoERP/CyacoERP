import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteServicio } from '../../services/reporte.servicio';

@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-ventas.componente.html',
  styleUrl: './dashboard-ventas.componente.css',
})
export class DashboardVentasComponente implements OnInit {
  cargando = signal(true);

  constructor(private reporteServicio: ReporteServicio) {}

  ngOnInit() {
    this.reporteServicio.obtenerDashboardVentas().subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }
}
