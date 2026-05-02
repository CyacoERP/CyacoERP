import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Cliente,
  CrearClientePayload,
  ActualizarClientePayload,
  ListaClientesRespuesta,
} from '../models/cliente.modelo';

@Injectable({ providedIn: 'root' })
export class ClienteServicio {
  constructor(private http: HttpClient) {}

  listar(pagina = 1, limite = 15, termino?: string): Observable<ListaClientesRespuesta> {
    let params = new HttpParams()
      .set('pagina', String(pagina))
      .set('limite', String(limite));
    if (termino && termino.trim()) {
      params = params.set('termino', termino.trim());
    }
    return this.http.get<ListaClientesRespuesta>('/api/clientes', { params });
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`/api/clientes/${id}`);
  }

  crear(payload: CrearClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>('/api/clientes', payload);
  }

  actualizar(id: number, payload: ActualizarClientePayload): Observable<Cliente> {
    return this.http.patch<Cliente>(`/api/clientes/${id}`, payload);
  }

  desactivar(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`/api/clientes/${id}`);
  }
}
