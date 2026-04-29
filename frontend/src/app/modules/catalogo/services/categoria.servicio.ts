import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriaServicio {
  private apiUrl = '/api/categorias';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error obteniendo categorías del backend:', error);
        throw error;
      })
    );
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error obteniendo categoría:', error);
        throw error;
      })
    );
  }

  crear(categoria: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoria).pipe(
      catchError((error) => {
        console.error('Error creando categoría:', error);
        throw error;
      })
    );
  }

  actualizar(id: number, categoria: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoria).pipe(
      catchError((error) => {
        console.error('Error actualizando categoría:', error);
        throw error;
      })
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error eliminando categoría:', error);
        throw error;
      })
    );
  }
}
