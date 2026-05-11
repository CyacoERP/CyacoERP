import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { CompatibilidadProducto, Producto } from '../../../shared/models/producto.modelo';

@Injectable({ providedIn: 'root' })
export class ProductoServicio {
  private apiUrl = '/api/productos';

  constructor(private http: HttpClient) {}

  obtenerTodos(filtros?: {
    categoriaId?: number;
    familia?: string;
    fabricante?: string;
    precioMin?: number;
    precioMax?: number;
    busqueda?: string;
    incluirInactivos?: boolean;
  }): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros?.categoriaId != null) params = params.set('categoriaId', String(filtros.categoriaId));
    if (filtros?.familia) params = params.set('familia', filtros.familia);
    if (filtros?.fabricante) params = params.set('fabricante', filtros.fabricante);
    if (filtros?.precioMin != null) params = params.set('precioMin', String(filtros.precioMin));
    if (filtros?.precioMax != null) params = params.set('precioMax', String(filtros.precioMax));
    if (filtros?.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros?.incluirInactivos != null) {
      params = params.set('incluirInactivos', String(filtros.incluirInactivos));
    }

    return this.http.get<Producto[]>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error obteniendo productos del backend:', error);
        throw error;
      })
    );
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error obteniendo producto:', error);
        throw error;
      })
    );
  }

  crear(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      catchError((error) => {
        console.error('Error creando producto:', error);
        throw error;
      })
    );
  }

  actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto).pipe(
      catchError((error) => {
        console.error('Error actualizando producto:', error);
        throw error;
      })
    );
  }

  eliminar(id: number): Observable<Producto> {
    return this.http.delete<Producto>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error eliminando producto:', error);
        throw error;
      })
    );
  }

  obtenerCompatibilidades(productoId: number): Observable<CompatibilidadProducto[]> {
    return this.http.get<CompatibilidadProducto[]>(`${this.apiUrl}/${productoId}/compatibilidades`).pipe(
      catchError((error) => {
        console.error('Error obteniendo compatibilidades:', error);
        throw error;
      })
    );
  }

  crearCompatibilidad(productoId: number, data: { productoDestinoId: number; tipo: 'compatible' | 'incompatible'; nota?: string }): Observable<CompatibilidadProducto> {
    return this.http.post<CompatibilidadProducto>(`${this.apiUrl}/${productoId}/compatibilidades`, data).pipe(
      catchError((error) => {
        console.error('Error creando compatibilidad:', error);
        throw error;
      })
    );
  }

  eliminarCompatibilidad(productoId: number, compatibilidadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productoId}/compatibilidades/${compatibilidadId}`).pipe(
      catchError((error) => {
        console.error('Error eliminando compatibilidad:', error);
        throw error;
      })
    );
  }
}
