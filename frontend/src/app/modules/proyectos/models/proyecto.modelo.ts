export interface Hito {
  id: number;
  titulo: string;
  descripcion?: string | null;
  estado: 'pendiente' | 'en_progreso' | 'bloqueada' | 'completada';
  progreso: number;
  orden: number;
  fechaEstimada?: string | null;
  fechaReal?: string | null;
  // legacy alias used internally
  nombre?: string;
  porcentajeAvance?: number;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  cliente: string;
  estado: 'planificacion' | 'en_progreso' | 'pausado' | 'finalizado';
  porcentajeAvance: number;
  hitos?: Hito[];
  tareas?: Hito[];
  fechaInicio: Date;
  fechaFinEstimada: Date;
  gerente?: string;
  presupuesto?: number;
  usuarioId?: number;
}
