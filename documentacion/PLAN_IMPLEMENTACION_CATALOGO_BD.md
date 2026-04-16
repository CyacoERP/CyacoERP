# Plan de Implementacion: Catalogo 100% en Base de Datos

Fecha: 2026-04-15
Objetivo: Migrar catalogo de productos (actualmente XML local) a PostgreSQL con NestJS + Prisma, manteniendo compatibilidad con frontend Angular y dejando el XML solo como seed inicial.

## 1. Estado actual

- Frontend consume `frontend/public/assets/productos.xml` desde `ProductoServicio`.
- Backend no tiene modulo de productos/categorias.
- PostgreSQL y migraciones ya funcionales.
- Auth cliente/admin ya implementado y listo para proteger operaciones de escritura.

## 2. Criterios de exito

1. `GET /api/productos` devuelve productos desde BD con filtros y paginacion.
2. Frontend Catalogo deja de leer XML en runtime y consume API real.
3. CRUD de productos y categorias queda protegido para admin.
4. XML se usa unicamente para seed inicial (import one-shot), no como fuente operativa.
5. No hay regresiones en flujo de catalogo (filtros, orden, carrito y visualizacion).

## 3. Modelo de datos propuesto (Prisma)

### 3.1 Enum recomendado

- `EstadoInventario` opcional si luego se desea granularidad; por ahora basta `inStock` booleano.

### 3.2 Tablas

#### `Categoria`
- `id` (Int, PK, autoincrement)
- `nombre` (String, unique, varchar 120)
- `activo` (Boolean, default true)
- `creadoEn` (DateTime, default now)
- `actualizadoEn` (DateTime, updatedAt)

#### `Producto`
- `id` (Int, PK, autoincrement)
- `name` (String, varchar 180)
- `price` (Decimal(12,2))
- `imageUrl` (String?, varchar 255)
- `description` (String?, text)
- `inStock` (Boolean, default true)
- `brand` (String?, varchar 120)
- `rating` (Decimal(3,2)?, default 0)
- `reviews` (Int, default 0)
- `protocols` (String?, varchar 255)
- `sku` (String?, unique, varchar 60)
- `categoriaId` (Int, FK -> Categoria.id)
- `activo` (Boolean, default true)
- `creadoEn` (DateTime, default now)
- `actualizadoEn` (DateTime, updatedAt)

Nota: Para preservar compatibilidad con frontend actual, el backend debe responder `category` (texto). Se puede mapear desde `categoria.nombre` en el serializer/DTO de salida.

## 4. API contrato objetivo

## Publico (lectura)
1. `GET /api/productos`
- Query: `pagina`, `limite`, `termino`, `categoria`, `brand`, `precioMin`, `precioMax`, `inStock`, `activo`.
- Respuesta:
  - `datos: ProductoListadoDto[]`
  - `meta: { pagina, limite, total, totalPaginas }`

2. `GET /api/productos/:id`
- Respuesta: `ProductoDetalleDto`

3. `GET /api/categorias`
- Respuesta: lista de categorias activas

## Admin (escritura, protegido)
1. `POST /api/productos`
2. `PATCH /api/productos/:id`
3. `DELETE /api/productos/:id` (soft-delete con `activo=false`)
4. `POST /api/categorias`
5. `PATCH /api/categorias/:id`
6. `DELETE /api/categorias/:id` (soft-delete)

## 5. Fases de implementacion

## Fase A: Backend modulo Catalogo

1. Extender `schema.prisma` con `Categoria` y `Producto`.
2. Crear migracion Prisma.
3. Crear modulo `backend/src/productos`:
- `productos.module.ts`
- `productos.controller.ts`
- `productos.service.ts`
- DTOs: `crear-producto`, `actualizar-producto`, `consultar-productos`
4. Crear modulo `backend/src/categorias` (o agrupar en productos, recomendado separado para claridad).
5. Aplicar guardias:
- Lectura publica sin guard.
- Escritura con `JwtAuthGuard + RolesGuard + @Roles('admin')`.
6. Mapear salida para frontend:
- incluir `category` string desde `categoria.nombre`.

## Fase B: Seed inicial desde XML

1. Crear script `backend/prisma/seed-catalogo.ts` que:
- Lea `frontend/public/assets/productos.xml`.
- Normalice categorias y haga upsert.
- Inserte productos con `upsert` por `sku`.
2. Exponer script npm: `seed:catalogo`.
3. Ejecutar seed en entorno local tras migracion.

## Fase C: Integracion Frontend

1. Actualizar `ProductoServicio`:
- Reemplazar lectura XML por `GET /api/productos`.
- Soportar mapeo de respuesta paginada (`datos`) o arreglo simple.
2. Mantener interfaz `Producto` existente para evitar romper componentes.
3. Validar filtros/orden actuales del componente catalogo con datos API.
4. (Opcional recomendado) agregar `endpoint` configurable con variable de entorno frontend.

## Fase D: Endpoints admin para gestion futura

1. Implementar servicio admin de productos/categorias en frontend (o reutilizar modulo admin existente).
2. Pantalla minima para crear/editar/desactivar productos (admin).

## 6. Riesgos y mitigaciones

1. Riesgo: romper template por cambio de shape.
- Mitigacion: conservar nombres de propiedades (`name`, `price`, `category`, etc.).

2. Riesgo: datos inconsistentes entre XML y BD.
- Mitigacion: seed idempotente por `sku`.

3. Riesgo: precision decimal en precio/rating.
- Mitigacion: convertir Decimal de Prisma a number en DTO de salida.

4. Riesgo: categorias duplicadas por mayusculas/minusculas.
- Mitigacion: normalizar (`trim`, case-insensitive) antes de upsert.

## 7. Checklist de validacion

1. `docker compose ps` muestra postgres healthy.
2. `npx prisma migrate deploy` sin errores.
3. `npm run build` backend y frontend exitosos.
4. `GET /api/productos` responde datos reales BD.
5. Catalogo en UI muestra productos sin leer XML en runtime.
6. Login admin + `POST /api/productos` funciona.
7. Login cliente no puede crear/editar/eliminar productos (403 esperado).
8. Cotizaciones quedan desbloqueadas para consumir productos reales en siguiente fase.

## 8. Estimacion de ejecucion

- Fase A: 0.5 a 1 dia
- Fase B: 0.5 dia
- Fase C: 0.5 dia
- Fase D: 0.5 a 1 dia

Total: 2 a 3 dias de trabajo continuo para dejar Catalogo en BD listo como base de cotizaciones reales.
