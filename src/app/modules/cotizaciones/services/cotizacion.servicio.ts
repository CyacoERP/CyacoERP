import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cotizacion, ItemCotizacion } from '../models/cotizacion.modelo';

@Injectable({ providedIn: 'root' })
export class CotizacionServicio {
  private cotizacionActual = new BehaviorSubject<Cotizacion | null>(null);
  public cotizacionActual$ = this.cotizacionActual.asObservable();

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>('/api/cotizaciones');
  }

  obtenerPorId(id: number): Observable<Cotizacion> {
    return this.http.get<Cotizacion>(`/api/cotizaciones/${id}`);
  }

  crear(cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http.post<Cotizacion>('/api/cotizaciones', cotizacion);
  }

  actualizar(id: number, cotizacion: Cotizacion): Observable<Cotizacion> {
    return this.http.put<Cotizacion>(`/api/cotizaciones/${id}`, cotizacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/cotizaciones/${id}`);
  }

  agregarItem(item: ItemCotizacion): void {
    const cotizaActual = this.cotizacionActual.value;
    if (cotizaActual) {
      cotizaActual.items.push(item);
      cotizaActual.total += item.subtotal;
      this.cotizacionActual.next(cotizaActual);
    }
  }

  eliminarItem(index: number): void {
    const cotizaActual = this.cotizacionActual.value;
    if (cotizaActual && index >= 0 && index < cotizaActual.items.length) {
      cotizaActual.total -= cotizaActual.items[index].subtotal;
      cotizaActual.items.splice(index, 1);
      this.cotizacionActual.next(cotizaActual);
    }
  }

  solicitarCotizacion(id: number): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`/api/cotizaciones/${id}/solicitar`, {});
  }

  exportarPDF(id: number): Observable<Blob> {
    return this.http.get(`/api/cotizaciones/${id}/pdf`, { responseType: 'blob' });
  }

  limpiarCotizacion(): void {
    this.cotizacionActual.next(null);
  }
}
