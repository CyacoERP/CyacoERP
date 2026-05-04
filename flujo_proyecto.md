# Guía Completa de Flujos — CyacoERP

Este documento explica cómo funcionan internamente todas las funcionalidades del sistema: cómo se relacionan los módulos, cómo se mueven los datos, cómo se generan documentos y cómo Angular consume el backend.

---

## 1. Vista General del Stack

```
[Angular 21 Frontend :4200]
        ↕ HTTP + proxy /api → localhost:3000
[NestJS 11 Backend :3000]
        ↕ Prisma ORM
[PostgreSQL 16 :5432 (Docker)]
```

El frontend nunca se comunica directo con la base de datos. Todo pasa por la API REST del backend.
El proxy de desarrollo (`proxy.conf.json`) redirige `/api/*` al backend para evitar CORS en local.

---

## 2. Autenticación y Sesión

### 2.1 Registro de usuario

1. Usuario llena el formulario en `/auth/registro`.
2. Angular llama `POST /api/auth/registro` con nombre, correo, password.
3. Backend hashea la contraseña con `bcrypt (10 rounds)` y crea el usuario con rol `cliente`.
4. Responde con el JWT firmado + datos del usuario.
5. Angular guarda el token en `localStorage` via `AuthServicio`.

### 2.2 Login

1. Usuario llena email y password.
2. Angular llama `POST /api/auth/login`.
3. Backend busca el usuario por email, valida que esté activo, compara hash con `bcrypt.compare`.
4. Si válido, firma un JWT con `{ sub: id, email, rol, nombre }` y lo devuelve.
5. Angular almacena el token; el `AuthInterceptor` lo inyecta automáticamente en cada petición subsecuente como `Authorization: Bearer <token>`.

### 2.3 Flujo JWT en cada request protegida

```
Angular component
  → HttpClient.get('/api/clientes')
  → AuthInterceptor agrega header Authorization
  → NestJS JwtAuthGuard verifica firma del token
  → RolesGuard verifica que el rol sea el requerido
  → Controller recibe la petición
```

El token se crea al inicio del proyecto automáticamente si no existe un admin:
- `auth.service.ts → onModuleInit → ensureAdminSeed()`
- Crea `admin@cyaco.local` / `Admin12345` si la BD está vacía.

### 2.4 Perfil y cierre de sesión

- `GET /api/auth/perfil` devuelve los datos del usuario actual (sin password).
- Logout: Angular simplemente borra el token del `localStorage`. El backend no necesita ser notificado (tokens sin estado).

---

## 3. Gestión de Clientes

### 3.1 Cómo se crea un cliente

1. Admin navega a `/admin/clientes/nuevo`.
2. Llena nombre, empresa, RFC, email, teléfono, dirección.
3. Angular llama `POST /api/clientes` con JWT de admin.
4. Backend valida JWT + rol admin (`JwtAuthGuard` + `RolesGuard`).
5. `ClientesService.crear()` guarda el registro en tabla `Cliente` con `activo: true`.
6. El componente recarga la lista.

### 3.2 Soft Delete (desactivación)

- `DELETE /api/clientes/:id` no borra el registro de la BD.
- Pone `activo: false` en la tabla `Cliente`.
- Los clientes desactivados no aparecen en el listado por defecto.
- Esto preserva integridad referencial con proyectos y cotizaciones históricas.

### 3.3 Búsqueda y filtros

- `GET /api/clientes?busqueda=texto` filtra por nombre o empresa en Prisma con `contains` (case-insensitive).
- Angular usa `ConsultarClientesDto` como query params.

---

## 4. Catálogo: Productos y Categorías

### 4.1 Relación Producto → Categoría

```
Categoria (1) ──────── (*) Producto
```

Cada producto pertenece a **una** categoría. Las categorías se crean primero, luego los productos se asignan vía `categoriaId`.

### 4.2 Catálogo público vs. Admin

- `GET /api/productos` y `GET /api/categorias` son **públicos** (sin JWT).
- El frontend los carga en el módulo `catalogo` para cualquier visitante.
- Las operaciones POST/PUT/DELETE requieren JWT + admin.

### 4.3 Subida de ficha técnica PDF

1. Admin abre el producto en `/admin/productos`.
2. Selecciona un archivo PDF (máx 10 MB).
3. Angular hace `POST /api/productos/:id/documento` como `multipart/form-data`.
4. Backend usa `multer` con `diskStorage` para guardar el archivo en `backend/uploads/documentos/`.
5. Genera un nombre único: `doc-{timestamp}-{random}.pdf`.
6. Actualiza el campo `urlDocumento` del producto en BD con la ruta `/uploads/documentos/nombre.pdf`.
7. El archivo queda servido estáticamente por NestJS.

```
Angular FormData
  → POST /api/productos/:id/documento (multipart)
  → multer guarda en disco /uploads/documentos/
  → ProductosService.actualizarUrlDocumento()
  → Prisma actualiza campo urlDocumento en tabla Producto
  → Devuelve producto actualizado con URL
```

---

## 5. Cotizaciones

### 5.1 Flujo completo de una cotización

```
Cliente crea cotización  →  estado: borrador
Admin la revisa          →  estado: enviada (se manda al cliente)
Cliente acepta o rechaza →  estado: aceptada | rechazada
```

### 5.2 Cómo se crea y calcula

1. Usuario autenticado llama `POST /api/cotizaciones` con lista de items (productoId, cantidad, precioUnitario).
2. Backend valida que todos los productos existan y estén activos.
3. Calcula automáticamente:
   ```
   subtotal = Σ (cantidad × precioUnitario)
   totalConDescuento = subtotal − subtotal × (descuentoPct / 100)
   total = totalConDescuento + totalConDescuento × (margenPct / 100)
   ```
4. Genera número único de cotización con `generarNumeroCotizacion()`.
5. Crea la cotización y sus items en una **transacción Prisma** (atómica: si falla un item, no se crea nada).

### 5.3 Control de acceso por rol

- `GET /api/cotizaciones/mis` → devuelve solo las cotizaciones del usuario autenticado.
- `GET /api/cotizaciones` → solo admin, devuelve **todas**.
- `GET /api/cotizaciones/:id` → el cliente solo puede ver las suyas; admin ve cualquiera.

### 5.4 Cambio de estado

- `PATCH /api/cotizaciones/:id/estado` con `{ estado: "aceptada" }`.
- El servicio valida que el cambio de estado sea permitido según el rol.

---

## 6. Proyectos

### 6.1 Relación de entidades

```
Proyecto
  ├── tareas[]  (TareaProyecto)
  └── bitacora[] (BitacoraProyecto)
```

Un proyecto puede tener muchas tareas y muchas entradas de bitácora.

### 6.2 Cómo se crea un proyecto

1. Admin navega a `/admin/proyectos/nuevo`.
2. Llena nombre, cliente (texto libre), fechas, presupuesto.
3. Backend crea el proyecto con `estado: planificacion` y `porcentajeAvance: 0`.
4. El proyecto queda disponible para recibir tareas.

### 6.3 Control de visibilidad por rol

```
admin  → ve TODOS los proyectos activos
cliente → solo ve proyectos donde campo "cliente" coincide con su empresa/nombre
```

Esto se controla en `ProyectosService.listar()` con una condición condicional en Prisma basada en `usuario.rol`.

### 6.4 Ciclo de vida de una tarea

```
pendiente → en_progreso → completada
              ↓
           bloqueada → en_progreso (al desbloquear)
```

- `PATCH /api/proyectos/:id/tareas/:tareaId/estado/:estado` mueve la tarea.
- El avance del proyecto (`porcentajeAvance`) se recalcula automáticamente en `moverTareaEstado()`:
  ```
  avance = (tareas completadas / total tareas) × 100
  ```

### 6.5 Bitácora

- Registro cronológico de eventos del proyecto.
- Cada entrada tiene: descripción, fecha, autor.
- `POST /api/proyectos/:id/bitacora` agrega una entrada.
- Útil para auditoría y comunicación con el cliente.

---

## 7. Reportes y Exportación de Documentos

### 7.1 Flujo de generación de reporte

```
Frontend llama POST /api/reportes/generar  →  tipo: ventas|clientes|proyectos|inventario, formato: pdf|excel|csv
                                           ↓
Backend consulta BD (Prisma aggregations)  →  obtiene KPIs y métricas
                                           ↓
Crea objeto ReporteGenerado y lo guarda en memoria (array en ReportesService)
                                           ↓
Devuelve el reporte con su ID asignado
```

> **Nota:** Los reportes se guardan en memoria del proceso Node.js. Si el backend se reinicia, se pierden. Para producción se extendería a guardarlos en BD.

### 7.2 Exportación a PDF (pdfkit)

1. Frontend llama `GET /api/reportes/:id/exportar/pdf`.
2. Backend crea un `PDFDocument` con `pdfkit`.
3. Agrega encabezado CyacoERP, nombre del reporte, fecha, línea separadora azul.
4. Itera los datos del reporte e imprime clave → valor.
5. Serializa el PDF a `Buffer` y lo envía con headers:
   ```
   Content-Type: application/pdf
   Content-Disposition: attachment; filename="reporte-{id}.pdf"
   ```
6. El navegador descarga el archivo automáticamente.

### 7.3 Exportación a Excel (exceljs)

1. Se crea un `Workbook` con una hoja nombrada según el tipo del reporte.
2. Se agrega una fila de encabezados (Métrica / Valor) con fondo azul y texto blanco.
3. Se itera el objeto de datos y se inserta cada par clave-valor como fila.
4. Se ajusta el ancho de columnas automáticamente.
5. Se serializa a `Buffer` con `workbook.xlsx.writeBuffer()`.
6. Se envía con `Content-Type: application/vnd.openxmlformats...`.

### 7.4 Exportación a CSV

- Más simple: itera datos, construye string con separador `|`.
- Devuelve como `text/csv` con nombre de archivo.

### 7.5 Dashboards en tiempo real

Los dashboards consultan directamente la BD cada vez:
- `GET /api/reportes/dashboard/ventas` → `COUNT`, `SUM` sobre tabla `Cotizacion`.
- `GET /api/reportes/dashboard/clientes` → `COUNT` con filtro por mes actual.
- `GET /api/reportes/dashboard/proyectos` → `COUNT`, `AVG` sobre tablas `Proyecto` y `TareaProyecto`.

---

## 8. Comunicación Frontend ↔ Backend

### 8.1 Servicios Angular (cómo se llama la API)

Cada módulo tiene su propio servicio que encapsula las llamadas HTTP:

```
CatalogoServicio  → HttpClient.get('/api/productos')
ClienteServicio   → HttpClient.get('/api/clientes')
ProyectoServicio  → HttpClient.get('/api/proyectos')
CotizacionServicio→ HttpClient.post('/api/cotizaciones', body)
AuthServicio      → HttpClient.post('/api/auth/login', body)
```

### 8.2 Interceptor de autenticación

- Definido en `core/interceptors/`.
- Se inyecta globalmente en `app.config.ts` con `provideHttpClient(withInterceptors([...]))`.
- Lee el token de `localStorage` y lo agrega como `Authorization: Bearer <token>` en cada request a `/api/*`.

### 8.3 Guards de rutas Angular

- `AuthGuard` → protege rutas que requieren estar autenticado. Si no hay token, redirige a `/auth/login`.
- `RolGuard` → protege rutas de admin. Si el rol no es `admin`, redirige al home.

### 8.4 Proxy de desarrollo

`proxy.conf.json` redirige todas las peticiones `/api/*` al backend:
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```
Así Angular puede llamar `/api/clientes` sin CORS, y el proxy lo convierte en `http://localhost:3000/api/clientes`.

---

## 9. Base de Datos y Migraciones

### 9.1 Esquema de tablas principales

```
Usuario ──────────────── Cotizacion (1:N, un usuario tiene muchas cotizaciones)
                              └── ItemCotizacion (N:1 → Producto)

Producto ──────────────── Categoria (N:1, muchos productos a una categoría)

Proyecto ─────────────── TareaProyecto (1:N)
         └────────────── BitacoraProyecto (1:N)

Cliente (tabla independiente, no FK con Usuario actualmente)
```

### 9.2 Cómo aplicar migraciones

```bash
cd backend
npx prisma migrate dev --name nombre_migracion   # crea migración + aplica en desarrollo
npx prisma migrate deploy                         # aplica en producción (sin crear nuevas)
npx prisma studio                                 # abre UI para ver/editar datos
```

### 9.3 Seed de datos iniciales

```bash
cd backend
npm run db:seed
```

Ejecuta `prisma/seed.ts` que crea:
- 8 usuarios (1 admin + 7 clientes)
- 13 clientes
- 8 categorías de productos
- 24 productos con imágenes reales
- 5 proyectos con tareas y bitácora
- 4 cotizaciones con items

---

## 10. Despliegue en Producción

### 10.1 Estructura Docker en producción

```
docker-compose.prod.yml
  ├── postgres:16-alpine      (BD persistente en volumen)
  ├── backend (Dockerfile)    (Node.js multi-stage build)
  └── nginx                   (sirve frontend Angular + reverse proxy al backend)
```

### 10.2 Cómo se construye y sirve el frontend

1. `ng build` genera los archivos estáticos en `frontend/dist/`.
2. Dockerfile copia esos archivos a la imagen nginx.
3. `nginx.conf` configura:
   - Sirve archivos estáticos de Angular en `/`.
   - Proxy reverso: `/api/*` → `http://backend:3000/api/*`.
4. Todo el tráfico HTTP entra por nginx en el puerto 80.

### 10.3 Variables de entorno necesarias para producción

Copiar `backend/.env.prod.example` como `backend/.env.prod` y configurar:
```
DATABASE_URL  — URL completa de PostgreSQL
JWT_SECRET    — Clave secreta fuerte (min 32 caracteres)
CORS_ORIGIN   — Dominio del frontend en producción
```

### 10.4 Comandos para levantar en producción

```bash
docker compose -f docker-compose.prod.yml up -d
docker exec -it cyacoerp-backend npx prisma migrate deploy
docker exec -it cyacoerp-backend npm run db:seed
```

---

## 11. Orden de inicio en desarrollo (desde cero — git clone)

```bash
# 1. Copiar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env si es necesario (por defecto funciona con Docker local)

# 2. Levantar base de datos PostgreSQL
docker compose up -d

# 3. Instalar dependencias del backend y preparar BD completo
cd backend
npm install                  # instala node_modules
npx prisma generate          # genera el cliente @prisma/client (necesario antes del seed)
npx prisma migrate deploy    # aplica todas las migraciones a la BD
npm run db:seed              # carga datos iniciales (usuarios, productos, clientes...)

# O en un solo comando:
npm run setup

# 4. Iniciar el backend
npm start

# 5. Frontend (en otra terminal)
cd frontend
npm install
ng serve
```

> **¿Por qué falla `@prisma/client` sin `prisma generate`?**
> El cliente Prisma es código generado a partir del schema. No se sube a git (está en `.gitignore`).
> Siempre hay que correr `npx prisma generate` después de un `git clone` o al cambiar `schema.prisma`.

### Solución al error P3005 "database schema is not empty"

Ocurre cuando el volumen de Docker ya tenía datos de una corrida anterior y Prisma detecta tablas que no creó él.

**Opción A — Borrar el volumen y empezar limpio (recomendado):**
```bash
docker compose down -v        # baja contenedores Y borra volúmenes
docker compose up -d          # levanta de nuevo con BD vacía
cd backend
npm run setup                 # generate + migrate + seed
```

**Opción B — Si no quieres perder los datos, baseline manual:**
```bash
cd backend
npx prisma migrate resolve --applied 20260321055351_init_clientes
npx prisma migrate resolve --applied 20260415000100_init_usuarios_auth
npx prisma migrate deploy     # aplica cualquier migración pendiente
```

Accesos:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- pgAdmin (gestor BD): http://localhost:5050
- Credenciales admin: `admin@cyaco.local` / `Admin12345`
