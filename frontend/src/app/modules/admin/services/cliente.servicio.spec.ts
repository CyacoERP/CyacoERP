import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteServicio } from './cliente.servicio';
import { Cliente } from '../models/cliente.modelo';

const clienteMock: Cliente = {
  id: 1,
  razonSocial: 'ACME S.A.',
  rfc: 'ACM010101000',
  email: 'acme@test.com',
  telefono: '3312345678',
  sector: 'Tecnología',
  activo: true,
  creadoEn: new Date().toISOString() as any,
  actualizadoEn: new Date().toISOString() as any,
};

describe('ClienteServicio', () => {
  let servicio: ClienteServicio;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteServicio],
    });

    servicio = TestBed.inject(ClienteServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(servicio).toBeTruthy();
  });

  describe('listar', () => {
    it('GET /api/clientes con parámetros de paginación', () => {
      const respuestaMock = {
        datos: [clienteMock],
        meta: { pagina: 1, limite: 10, total: 1, totalPaginas: 1 },
      };

      servicio.listar(1, 10).subscribe((res) => {
        expect(res.datos.length).toBe(1);
        expect(res.meta.total).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/clientes');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pagina')).toBe('1');
      expect(req.request.params.get('limite')).toBe('10');
      req.flush(respuestaMock);
    });

    it('incluye parámetro termino cuando se provee', () => {
      servicio.listar(1, 10, 'ACME').subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/clientes');
      expect(req.request.params.get('termino')).toBe('ACME');
      req.flush({ datos: [], meta: { pagina: 1, limite: 10, total: 0, totalPaginas: 1 } });
    });
  });

  describe('obtenerPorId', () => {
    it('GET /api/clientes/:id', () => {
      servicio.obtenerPorId(1).subscribe((c) => {
        expect(c.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('GET');
      req.flush(clienteMock);
    });
  });

  describe('crear', () => {
    it('POST /api/clientes con el payload correcto', () => {
      const payload = { razonSocial: 'ACME S.A.', rfc: 'ACM010101000' };

      servicio.crear(payload as any).subscribe((c) => {
        expect(c.id).toBe(1);
      });

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(clienteMock);
    });
  });

  describe('actualizar', () => {
    it('PATCH /api/clientes/:id con los cambios', () => {
      const cambios = { razonSocial: 'ACME Actualizado' };

      servicio.actualizar(1, cambios as any).subscribe((c) => {
        expect(c.razonSocial).toBe('ACME S.A.');
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('PATCH');
      req.flush(clienteMock);
    });
  });

  describe('desactivar', () => {
    it('DELETE /api/clientes/:id', () => {
      servicio.desactivar(1).subscribe((c) => {
        expect(c).toBeDefined();
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ ...clienteMock, activo: false });
    });
  });
});
