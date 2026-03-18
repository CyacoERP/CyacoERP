export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  rol: 'cliente' | 'gerencia' | 'admin' | 'vendedor';
  activo: boolean;
  fechaRegistro?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
