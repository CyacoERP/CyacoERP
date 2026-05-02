import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('CyacoERP E2E', () => {
  let app: INestApplication<App>;
  let tokenAdmin: string;
  let clienteId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/auth/login con credenciales de admin retorna 201 y token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@cyacoerp.com', password: 'Admin1234!' })
        .expect((r) => {
          // Accept 200 or 201 depending on NestJS version
          expect([200, 201]).toContain(r.status);
        });

      tokenAdmin = res.body.token ?? res.body.access_token;
      expect(tokenAdmin).toBeDefined();
    });
  });

  describe('Clientes (admin)', () => {
    it('GET /api/clientes retorna 200 con lista paginada', async () => {
      if (!tokenAdmin) return;

      const res = await request(app.getHttpServer())
        .get('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body).toHaveProperty('datos');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.datos)).toBe(true);
    });

    it('POST /api/clientes crea un cliente y retorna 201', async () => {
      if (!tokenAdmin) return;

      const payload = {
        razonSocial: 'Empresa E2E Test',
        rfc: `E2E${Date.now().toString().slice(-9)}`,
        email: `e2e_${Date.now()}@test.com`,
        sector: 'Testing',
      };

      const res = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.razonSocial).toBe(payload.razonSocial);
      clienteId = res.body.id;
    });

    it('PATCH /api/clientes/:id actualiza el cliente', async () => {
      if (!tokenAdmin || !clienteId) return;

      const res = await request(app.getHttpServer())
        .patch(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ sector: 'Actualizado' })
        .expect(200);

      expect(res.body.sector).toBe('Actualizado');
    });
  });

  describe('Proyectos (admin)', () => {
    it('GET /api/proyectos retorna 200 con array', async () => {
      if (!tokenAdmin) return;

      const res = await request(app.getHttpServer())
        .get('/api/proyectos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Sin token', () => {
    it('GET /api/clientes sin token retorna 401', async () => {
      await request(app.getHttpServer())
        .get('/api/clientes')
        .expect(401);
    });
  });
});
