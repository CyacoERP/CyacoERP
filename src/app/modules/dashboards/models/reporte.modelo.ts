export interface Reporte {
  id: number;
  nombre: string;
  tipo: 'ventas' | 'clientes' | 'proyectos' | 'inventario';
  descripcion?: string;
  fechaGeneracion: Date;
  generadoPor: string;
  datos: any;
  formato: 'pdf' | 'excel' | 'csv';
}

export interface DashboardVentas {
  totalVentas: number;
  totalCotizaciones: number;
  cotizacionesAceptadas: number;
  cotizacionesPendientes: number;
  ultimosProductosVendidos: any[];
}

export interface DashboardClientes {
  totalClientes: number;
  clientesActivos: number;
  clientesNuevos: number;
  topClientes: any[];
}

export interface DashboardProyectos {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosFinalizados: number;
  proximosHitos: any[];
  porcentajePromedioAvance: number;
}
