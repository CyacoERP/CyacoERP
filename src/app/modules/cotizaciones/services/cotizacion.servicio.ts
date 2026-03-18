import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cotizacion, SolicitudCotizacion } from '../models/cotizacion.modelo';

@Injectable({ providedIn: 'root' })
export class CotizacionServicio {
  private readonly storageKey = 'cyacoerp-cotizaciones';
  private readonly cotizacionesInternas = signal<Cotizacion[]>(this.cargarDesdeStorage());
  readonly cotizaciones = this.cotizacionesInternas.asReadonly();
  readonly totalCotizaciones = computed(() => this.cotizacionesInternas().length);

  obtenerTodas(): Observable<Cotizacion[]> {
    return of(this.ordenarPorFechaDesc(this.cotizacionesInternas()));
  }

  obtenerPorId(id: number): Observable<Cotizacion> {
    const cotizacion = this.cotizacionesInternas().find(c => c.id === id);
    if (!cotizacion) {
      throw new Error(`Cotización ${id} no encontrada`);
    }
    return of(cotizacion);
  }

  crear(cotizacion: Cotizacion): Observable<Cotizacion> {
    const nuevaCotizacion: Cotizacion = {
      ...cotizacion,
      id: this.generarId(),
      numero: this.generarNumero(),
      fechaCreacion: new Date(),
    };

    this.guardarCotizaciones([...this.cotizacionesInternas(), nuevaCotizacion]);
    return of(nuevaCotizacion);
  }

  crearDesdeSolicitud(solicitud: SolicitudCotizacion): Cotizacion {
    const cotizacion: Cotizacion = {
      id: this.generarId(),
      numero: this.generarNumero(),
      usuarioId: 1,
      items: solicitud.items,
      total: solicitud.items.reduce((acc, item) => acc + item.subtotal, 0),
      estado: 'enviada',
      fechaCreacion: new Date(),
      observaciones: solicitud.notas,
      contacto: {
        nombreCompleto: solicitud.nombreCompleto,
        correo: solicitud.correo,
        telefono: solicitud.telefono,
        cargo: solicitud.cargo,
        empresa: solicitud.empresa,
      },
      proyecto: {
        nombre: solicitud.proyecto,
        fechaRequerida: solicitud.fechaRequerida,
      },
    };

    this.guardarCotizaciones([...this.cotizacionesInternas(), cotizacion]);
    return cotizacion;
  }

  actualizar(id: number, cotizacion: Cotizacion): Observable<Cotizacion> {
    const actualizadas = this.cotizacionesInternas().map((item) =>
      item.id === id ? { ...cotizacion, id } : item
    );
    this.guardarCotizaciones(actualizadas);
    const encontrada = actualizadas.find(c => c.id === id);
    if (!encontrada) {
      throw new Error(`Cotización ${id} no encontrada`);
    }
    return of(encontrada);
  }

  eliminar(id: number): Observable<void> {
    this.guardarCotizaciones(this.cotizacionesInternas().filter(c => c.id !== id));
    return of(void 0);
  }

  solicitarCotizacion(id: number): Observable<Cotizacion> {
    const cotizacion = this.cotizacionesInternas().find(c => c.id === id);
    if (!cotizacion) {
      throw new Error(`Cotización ${id} no encontrada`);
    }

    const actualizada: Cotizacion = { ...cotizacion, estado: 'enviada' };
    this.guardarCotizaciones(
      this.cotizacionesInternas().map((item) => (item.id === id ? actualizada : item))
    );
    return of(actualizada);
  }

  exportarPDF(): Observable<Blob> {
    const contenido = JSON.stringify(this.cotizacionesInternas(), null, 2);
    return of(new Blob([contenido], { type: 'application/json' }));
  }

  tieneCotizaciones(): boolean {
    return this.cotizacionesInternas().length > 0;
  }

  limpiarCotizacion(): void {
    this.guardarCotizaciones([]);
  }

  private guardarCotizaciones(cotizaciones: Cotizacion[]): void {
    this.cotizacionesInternas.set(cotizaciones);
    localStorage.setItem(this.storageKey, JSON.stringify(cotizaciones));
  }

  private cargarDesdeStorage(): Cotizacion[] {
    const datos = localStorage.getItem(this.storageKey);
    if (!datos) {
      return [];
    }

    try {
      const parsed = JSON.parse(datos) as Cotizacion[];
      return parsed.map((item) => ({
        ...item,
        fechaCreacion: new Date(item.fechaCreacion),
        fechaPedido: item.fechaPedido ? new Date(item.fechaPedido) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private ordenarPorFechaDesc(cotizaciones: Cotizacion[]): Cotizacion[] {
    return [...cotizaciones].sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }

  private generarId(): number {
    const ids = this.cotizacionesInternas().map(c => c.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  private generarNumero(): string {
    const total = this.cotizacionesInternas().length + 1;
    return `COT-${new Date().getFullYear()}-${String(total).padStart(4, '0')}`;
  }
}
