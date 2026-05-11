import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Cotizacion, SolicitudCotizacion } from '../models/cotizacion.modelo';
import { Producto } from '../../../shared/models/producto.modelo';

@Injectable({ providedIn: 'root' })
export class CotizacionServicio {
  private readonly apiUrl = '/api/cotizaciones';

  constructor(private readonly http: HttpClient) {}

  obtenerTodas(): Observable<Cotizacion[]> {
    return this.http
      .get<CotizacionApi[]>(`${this.apiUrl}/mis`)
      .pipe(map((cotizaciones) => cotizaciones.map((c) => this.mapearDesdeApi(c))));
  }

  obtenerParaAdmin(filtros?: {
    estado?: string;
    cliente?: string;
    desde?: string;
    hasta?: string;
  }): Observable<Cotizacion[]> {
    let params = new HttpParams();
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.cliente) {
      params = params.set('cliente', filtros.cliente);
    }
    if (filtros?.desde) {
      params = params.set('desde', filtros.desde);
    }
    if (filtros?.hasta) {
      params = params.set('hasta', filtros.hasta);
    }

    return this.http
      .get<CotizacionApi[]>(this.apiUrl, { params })
      .pipe(map((cotizaciones) => cotizaciones.map((c) => this.mapearDesdeApi(c))));
  }

  obtenerPorId(id: number): Observable<Cotizacion> {
    return this.http
      .get<CotizacionApi>(`${this.apiUrl}/${id}`)
      .pipe(map((cotizacion) => this.mapearDesdeApi(cotizacion)));
  }

  crear(cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http
      .post<CotizacionApi>(this.apiUrl, {
        items: cotizacion.items.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        observaciones: cotizacion.observaciones,
        contactoNombre: cotizacion.contacto?.nombreCompleto,
        contactoCorreo: cotizacion.contacto?.correo,
        contactoTelefono: cotizacion.contacto?.telefono,
        contactoCargo: cotizacion.contacto?.cargo,
        contactoEmpresa: cotizacion.contacto?.empresa,
        proyectoNombre: cotizacion.proyecto?.nombre,
        fechaRequerida: cotizacion.proyecto?.fechaRequerida,
      })
      .pipe(map((respuesta) => this.mapearDesdeApi(respuesta)));
  }

  crearDesdeSolicitud(solicitud: SolicitudCotizacion): Observable<Cotizacion> {
    return this.http
      .post<CotizacionApi>(this.apiUrl, {
        items: solicitud.items.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        observaciones: solicitud.notas,
        contactoNombre: solicitud.nombreCompleto,
        contactoCorreo: solicitud.correo,
        contactoTelefono: solicitud.telefono,
        contactoCargo: solicitud.cargo,
        contactoEmpresa: solicitud.empresa,
        proyectoNombre: solicitud.proyecto,
        fechaRequerida: solicitud.fechaRequerida,
      })
      .pipe(map((respuesta) => this.mapearDesdeApi(respuesta)));
  }

  actualizar(id: number, cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http
      .patch<CotizacionApi>(`${this.apiUrl}/${id}/estado`, { estado: cotizacion.estado })
      .pipe(map((respuesta) => this.mapearDesdeApi(respuesta)));
  }

  actualizarEstado(id: number, estado: Cotizacion['estado']): Observable<Cotizacion> {
    return this.http
      .patch<CotizacionApi>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(map((respuesta) => this.mapearDesdeApi(respuesta)));
  }

  eliminar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado: 'cancelada' });
  }

  solicitarCotizacion(id: number): Observable<Cotizacion> {
    return this.http
      .patch<CotizacionApi>(`${this.apiUrl}/${id}/estado`, { estado: 'enviada' })
      .pipe(map((respuesta) => this.mapearDesdeApi(respuesta)));
  }

  exportarPDF(): Observable<Blob> {
    return this.obtenerTodas().pipe(
      map((cotizaciones) => new Blob([JSON.stringify(cotizaciones, null, 2)], { type: 'application/json' }))
    );
  }

  tieneCotizaciones(): boolean {
    return false;
  }

  limpiarCotizacion(): void {
    // Intencionalmente vacío: ahora la fuente de verdad vive en backend.
  }

  private mapearDesdeApi(cotizacion: CotizacionApi): Cotizacion {
    return {
      id: cotizacion.id,
      numero: cotizacion.numero,
      usuarioId: cotizacion.usuarioId,
      items: cotizacion.items.map((item) => ({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
      })),
      total: cotizacion.total,
      estado: cotizacion.estado,
      fechaCreacion: new Date(cotizacion.creadoEn),
      fechaPedido: cotizacion.enviadoEn ? new Date(cotizacion.enviadoEn) : undefined,
      observaciones: cotizacion.observaciones ?? undefined,
      contacto:
        cotizacion.contactoNombre || cotizacion.contactoCorreo || cotizacion.contactoTelefono
          ? {
              nombreCompleto: cotizacion.contactoNombre ?? '',
              correo: cotizacion.contactoCorreo ?? '',
              telefono: cotizacion.contactoTelefono ?? '',
              cargo: cotizacion.contactoCargo ?? '',
              empresa: cotizacion.contactoEmpresa ?? '',
            }
          : undefined,
      proyecto: cotizacion.proyectoNombre
        ? {
            nombre: cotizacion.proyectoNombre,
            fechaRequerida: cotizacion.fechaRequerida ?? '',
          }
        : undefined,
    };
  }
}

interface CotizacionApi {
  id: number;
  numero: string;
  usuarioId: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'cancelada';
  subtotal: number;
  descuentoPct: number;
  margenPct: number;
  total: number;
  observaciones?: string | null;
  contactoNombre?: string | null;
  contactoCorreo?: string | null;
  contactoTelefono?: string | null;
  contactoCargo?: string | null;
  contactoEmpresa?: string | null;
  proyectoNombre?: string | null;
  fechaRequerida?: string | null;
  enviadoEn?: string | null;
  creadoEn: string;
  items: Array<{
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    producto: Producto;
  }>;
}
