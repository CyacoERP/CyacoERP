import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProyectoServicio } from './proyecto.servicio';
import { Proyecto } from '../models/proyecto.modelo';

const proyectoMock: Proyecto = {
  id: 1,
  nombre: 'Proyecto Alpha',
  descripcion: 'Descripción',
  cliente: 'Cliente SA',
  estado: 'planificacion',
  porcentajeAvance: 0,
  fechaInicio: '2025-01-01',
  fechaFinEstimada: '2025-12-31',
  activo: true,
  tareas: [],
} as any;

describe('ProyectoServicio', () => {
  let servicio: ProyectoServicio;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProyectoServicio],
    });

    servicio = TestBed.inject(ProyectoServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(servicio).toBeTruthy();
  });

  describe('obtenerTodos', () => {
    it('GET /api/proyectos retorna array de proyectos', () => {
      servicio.obtenerTodos().subscribe((proyectos) => {
        expect(proyectos.length).toBe(1);
        expect(proyectos[0].nombre).toBe('Proyecto Alpha');
      });

      const req = httpMock.expectOne('/api/proyectos');
      expect(req.request.method).toBe('GET');
      req.flush([proyectoMock]);
    });
  });

  describe('obtenerPorId', () => {
    it('GET /api/proyectos/:id retorna un proyecto', () => {
      servicio.obtenerPorId(1).subscribe((p) => {
        expect(p.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/proyectos/1');
      expect(req.request.method).toBe('GET');
      req.flush(proyectoMock);
    });
  });

  describe('crear', () => {
    it('POST /api/proyectos con el payload', () => {
      servicio.crear(proyectoMock).subscribe((p) => {
        expect(p.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/proyectos');
      expect(req.request.method).toBe('POST');
      req.flush(proyectoMock);
    });
  });

  describe('crearTarea', () => {
    it('POST /api/proyectos/:id/tareas con la tarea', () => {
      const tarea = { titulo: 'Tarea 1', estado: 'pendiente' as const, progreso: 0, orden: 1 };

      servicio.crearTarea(1, tarea).subscribe((t) => {
        expect(t.titulo).toBe('Tarea 1');
      });

      const req = httpMock.expectOne('/api/proyectos/1/tareas');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(tarea);
      req.flush({ id: 10, proyectoId: 1, ...tarea });
    });
  });

  describe('agregarBitacora', () => {
    it('POST /api/proyectos/:id/bitacora con la nota', () => {
      const entrada = { nota: 'Avance completado', avance: 80 };

      servicio.agregarBitacora(1, entrada).subscribe((b) => {
        expect(b.nota).toBe('Avance completado');
      });

      const req = httpMock.expectOne('/api/proyectos/1/bitacora');
      expect(req.request.method).toBe('POST');
      req.flush({ id: 1, proyectoId: 1, ...entrada, creadoEn: new Date().toISOString() });
    });
  });

  describe('obtenerBitacora', () => {
    it('GET /api/proyectos/:id/bitacora retorna array', () => {
      servicio.obtenerBitacora(1).subscribe((b) => {
        expect(Array.isArray(b)).toBe(true);
      });

      const req = httpMock.expectOne('/api/proyectos/1/bitacora');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
