export const API_BASE_URL = 'http://localhost:3000/api';

export const ESTADOS_COTIZACION = [
  { valor: 'borrador', etiqueta: 'Borrador' },
  { valor: 'enviada', etiqueta: 'Enviada' },
  { valor: 'aceptada', etiqueta: 'Aceptada' },
  { valor: 'rechazada', etiqueta: 'Rechazada' },
  { valor: 'cancelada', etiqueta: 'Cancelada' },
];

export const ESTADOS_PROYECTO = [
  { valor: 'planificacion', etiqueta: 'Planificación' },
  { valor: 'en_progreso', etiqueta: 'En Progreso' },
  { valor: 'pausado', etiqueta: 'Pausado' },
  { valor: 'finalizado', etiqueta: 'Finalizado' },
];

export const ROLES_USUARIO = [
  { valor: 'cliente', etiqueta: 'Cliente' },
  { valor: 'gerencia', etiqueta: 'Gerencia' },
  { valor: 'admin', etiqueta: 'Administrador' },
  { valor: 'vendedor', etiqueta: 'Vendedor' },
];

export const CATEGORIES_FAQ = ['Productos', 'Cotizaciones', 'Proyectos', 'Cuenta', 'Otros'];
