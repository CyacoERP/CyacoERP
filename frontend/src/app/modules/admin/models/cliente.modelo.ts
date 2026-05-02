export interface Cliente {
  id: number;
  razonSocial: string;
  rfc: string;
  email: string;
  telefono?: string | null;
  sector?: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearClientePayload {
  razonSocial: string;
  rfc: string;
  email: string;
  telefono?: string;
  sector?: string;
}

export interface ActualizarClientePayload {
  razonSocial?: string;
  email?: string;
  telefono?: string;
  sector?: string;
}

export interface ListaClientesRespuesta {
  datos: Cliente[];
  total: number;
  pagina: number;
  totalPaginas: number;
}
