export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  fabricante?: string;
  numeroParte?: string;
  skuInterno?: string;
  familia?: string;
  moneda?: 'MXN' | 'USD';
  especificacionesTecnicas?: Record<string, unknown> | null;
  precio: number;
  stock: number;
  imagenUrl?: string;
  urlDocumento?: string | null;
  categoriaId: number;
  categoria?: Categoria;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CompatibilidadProducto {
  id: number;
  productoOrigenId: number;
  productoDestinoId: number;
  tipo: 'compatible' | 'incompatible';
  nota?: string | null;
  productoDestino?: Producto;
}

