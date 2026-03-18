import { Producto } from '../../../shared/models/producto.modelo';

export interface ItemCotizacion {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: number;
  numero: string;
  usuarioId: number;
  items: ItemCotizacion[];
  total: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'cancelada';
  fechaCreacion: Date;
  fechaPedido?: Date;
  observaciones?: string;
  contacto?: {
    nombreCompleto: string;
    correo: string;
    telefono: string;
    cargo: string;
    empresa: string;
  };
  proyecto?: {
    nombre: string;
    fechaRequerida: string;
  };
}

export interface SolicitudCotizacion {
  nombreCompleto: string;
  correo: string;
  telefono: string;
  cargo: string;
  empresa: string;
  proyecto: string;
  fechaRequerida: string;
  notas: string;
  items: ItemCotizacion[];
}
