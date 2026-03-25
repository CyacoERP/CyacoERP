import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reporte, DashboardVentas, DashboardClientes, DashboardProyectos } from '../models/reporte.modelo';

@Injectable({ providedIn: 'root' })
export class ReporteServicio {
  constructor(private http: HttpClient) {}

  obtenerDashboardVentas(): Observable<DashboardVentas> {
    return this.http.get<DashboardVentas>('/api/reportes/dashboard/ventas');
  }

  obtenerDashboardClientes(): Observable<DashboardClientes> {
    return this.http.get<DashboardClientes>('/api/reportes/dashboard/clientes');
  }

  obtenerDashboardProyectos(): Observable<DashboardProyectos> {
    return this.http.get<DashboardProyectos>('/api/reportes/dashboard/proyectos');
  }

  obtenerReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>('/api/reportes');
  }

  generarReporte(tipo: string, formato: string, filtros?: any): Observable<Reporte> {
    return this.http.post<Reporte>('/api/reportes/generar', { tipo, formato, filtros });
  }

  exportarReporte(id: number, formato: string): Observable<Blob> {
    return this.http.get(`/api/reportes/${id}/exportar/${formato}`, { responseType: 'blob' });
  }

  descargarReporte(id: number, nombreArchivo: string): void {
    this.exportarReporte(id, 'pdf').subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
