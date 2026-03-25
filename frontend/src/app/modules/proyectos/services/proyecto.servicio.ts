import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.modelo';

@Injectable({ providedIn: 'root' })
export class ProyectoServicio {
  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>('/api/proyectos');
  }

  obtenerPorId(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`/api/proyectos/${id}`);
  }

  crear(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>('/api/proyectos', proyecto);
  }

  actualizar(id: number, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`/api/proyectos/${id}`, proyecto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/proyectos/${id}`);
  }

  actualizarEstado(id: number, estado: string): Observable<Proyecto> {
    return this.http.patch<Proyecto>(`/api/proyectos/${id}/estado`, { estado });
  }

  obtenerProyectosActivos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>('/api/proyectos/filtro/activos');
  }
}
