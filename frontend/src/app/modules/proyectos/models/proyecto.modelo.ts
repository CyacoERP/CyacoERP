export interface Hito {
  id: number;
  nombre: string;
  descripcion: string;
  porcentajeAvance: number;
  fechaEstimada: Date;
  fechaReal?: Date;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  cliente: string;
  estado: 'planificacion' | 'en_progreso' | 'pausado' | 'finalizado';
  porcentajeAvance: number;
  hitos: Hito[];
  fechaInicio: Date;
  fechaFinEstimada: Date;
  gerente?: string;
  presupuesto?: number;
}
