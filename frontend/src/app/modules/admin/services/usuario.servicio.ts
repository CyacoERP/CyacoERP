import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../../shared/models/usuario.modelo';

@Injectable({ providedIn: 'root' })
export class UsuarioServicio {
  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('/api/usuarios');
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`/api/usuarios/${id}`);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>('/api/usuarios', usuario);
  }

  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`/api/usuarios/${id}`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/usuarios/${id}`);
  }

  obtenerPorRol(rol: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`/api/usuarios/filtro/rol/${rol}`);
  }

  cambiarPassword(id: number, passwordActual: string, passwordNueva: string): Observable<any> {
    return this.http.post(`/api/usuarios/${id}/cambiar-password`, {
      passwordActual,
      passwordNueva,
    });
  }
}
