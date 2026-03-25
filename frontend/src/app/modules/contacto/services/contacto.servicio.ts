import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeContacto {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  fechaEnvio?: Date;
  estado?: 'nuevo' | 'leido' | 'respondido';
}

export interface FAQ {
  id: number;
  pregunta: string;
  respuesta: string;
  categoria: string;
}

@Injectable({ providedIn: 'root' })
export class ContactoServicio {
  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: MensajeContacto): Observable<MensajeContacto> {
    return this.http.post<MensajeContacto>('/api/contacto/mensaje', mensaje);
  }

  obtenerMensajes(): Observable<MensajeContacto[]> {
    return this.http.get<MensajeContacto[]>('/api/contacto/mensajes');
  }

  marcarComoLeido(id: number): Observable<void> {
    return this.http.patch<void>(`/api/contacto/mensajes/${id}/leido`, {});
  }

  responderMensaje(id: number, respuesta: string): Observable<void> {
    return this.http.post<void>(`/api/contacto/mensajes/${id}/responder`, { respuesta });
  }

  obtenerFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>('/api/contacto/faqs');
  }

  obtenerFAQsPorCategoria(categoria: string): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`/api/contacto/faqs/categoria/${categoria}`);
  }
}
