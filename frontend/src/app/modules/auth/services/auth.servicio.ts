import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario, LoginRequest, LoginResponse } from '../../../shared/models/usuario.modelo';

export interface ActualizarPerfilDto {
  nombre?: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthServicio {
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActual.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioDelStorage();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credenciales).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActual.next(null);
  }

  registro(datos: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/registro', datos).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  perfil(): Observable<Usuario> {
    return this.http.get<Usuario>('/api/auth/perfil');
  }

  actualizarPerfil(dto: ActualizarPerfilDto): Observable<Usuario> {
    return this.http.put<Usuario>('/api/auth/perfil', dto);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estáAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  tieneRol(rol: string): boolean {
    return this.usuarioActual.value?.rol === rol;
  }

  private cargarUsuarioDelStorage(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        this.usuarioActual.next(JSON.parse(usuarioJson));
      } catch (e) {
        console.error('Error cargando usuario del storage', e);
      }
    }
  }
}

