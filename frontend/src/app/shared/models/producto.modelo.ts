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

