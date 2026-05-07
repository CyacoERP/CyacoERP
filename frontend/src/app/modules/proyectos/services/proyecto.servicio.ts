import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.modelo';

export interface TareaProyectoApi {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion?: string | null;
  estado: 'pendiente' | 'en_progreso' | 'bloqueada' | 'completada';
  progreso: number;
  orden: number;
  fechaEstimada?: string | null;
  fechaReal?: string | null;
}

export interface BitacoraProyectoApi {
  id: number;
  proyectoId: number;
  nota: string;
  avance: number;
  creadoEn: string;
}

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

  obtenerTareas(idProyecto: number): Observable<TareaProyectoApi[]> {
    return this.http.get<TareaProyectoApi[]>(`/api/proyectos/${idProyecto}/tareas`);
  }

  crearTarea(idProyecto: number, tarea: Partial<TareaProyectoApi>): Observable<TareaProyectoApi> {
    return this.http.post<TareaProyectoApi>(`/api/proyectos/${idProyecto}/tareas`, tarea);
  }

  actualizarTarea(
    idProyecto: number,
    idTarea: number,
    cambios: Partial<TareaProyectoApi>,
  ): Observable<TareaProyectoApi> {
    return this.http.patch<TareaProyectoApi>(
      `/api/proyectos/${idProyecto}/tareas/${idTarea}`,
      cambios,
    );
  }

  obtenerTarea(idProyecto: number, idTarea: number): Observable<TareaProyectoApi> {
    return this.http.get<TareaProyectoApi>(`/api/proyectos/${idProyecto}/tareas/${idTarea}`);
  }

  eliminarTarea(idProyecto: number, idTarea: number): Observable<void> {
    return this.http.delete<void>(`/api/proyectos/${idProyecto}/tareas/${idTarea}`);
  }

  obtenerBitacora(idProyecto: number): Observable<BitacoraProyectoApi[]> {
    return this.http.get<BitacoraProyectoApi[]>(`/api/proyectos/${idProyecto}/bitacora`);
  }

  agregarBitacora(
    idProyecto: number,
    payload: { nota: string; avance?: number },
  ): Observable<BitacoraProyectoApi> {
    return this.http.post<BitacoraProyectoApi>(`/api/proyectos/${idProyecto}/bitacora`, payload);
  }

  actualizarBitacora(
    idProyecto: number,
    idBitacora: number,
    payload: { nota?: string; avance?: number },
  ): Observable<BitacoraProyectoApi> {
    return this.http.patch<BitacoraProyectoApi>(
      `/api/proyectos/${idProyecto}/bitacora/${idBitacora}`,
      payload,
    );
  }

  eliminarBitacora(idProyecto: number, idBitacora: number): Observable<void> {
    return this.http.delete<void>(`/api/proyectos/${idProyecto}/bitacora/${idBitacora}`);
  }
}
