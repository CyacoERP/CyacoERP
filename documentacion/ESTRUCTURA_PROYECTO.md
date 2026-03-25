# CyacoERP - Estructura del Proyecto Completa

## 📋 Resumen
Este es un ERP completo en Angular 21 con módulos para gestión de catálogos, cotizaciones, proyectos, dashboards, administración y más.

## 🏗️ Estructura de Carpetas

```
src/app/
│
├── modulos/                          # Módulos principales de la aplicación
│   ├── auth/                        # Módulo de autenticación
│   │   └── componentes/
│   │       ├── login.componente.*
│   │       └── registro.componente.* (por crear)
│   │
│   ├── catalogo/                    # Módulo de catálogo de productos
│   │   ├── componentes/
│   │   │   ├── lista-productos/
│   │   │   ├── ficha-producto/
│   │   │   └── comparador-productos/
│   │   └── servicios/              # (compartir con servicios/)
│   │
│   ├── cotizaciones/               # Módulo de cotizaciones y pedidos
│   │   ├── componentes/
│   │   │   ├── lista-cotizaciones.componente.*
│   │   │   ├── detalle-cotizacion.componente.*
│   │   │   └── form-cotizacion.componente.*
│   │   └── servicios/
│   │
│   ├── proyectos/                  # Módulo de proyectos
│   │   ├── componentes/
│   │   │   ├── lista-proyectos.componente.*
│   │   │   ├── detalle-proyecto.componente.*
│   │   │   └── form-proyecto.componente.*
│   │   └── servicios/
│   │
│   ├── dashboards/                 # Módulo de dashboards (Gerencia/Admin)
│   │   └── componentes/
│   │       ├── dashboard-ventas.componente.*
│   │       ├── dashboard-clientes.componente.*
│   │       └── dashboard-proyectos.componente.*
│   │
│   ├── admin/                      # Módulo de administración
│   │   └── componentes/
│   │       ├── gestionar-usuarios.componente.*
│   │       ├── gestionar-productos.componente.*
│   │       ├── gestionar-cotizaciones.componente.*
│   │       └── gestionar-proyectos.componente.*
│   │
│   ├── blog/                       # Módulo de blog/noticias
│   │   └── componentes/
│   │       ├── lista-blog.componente.*
│   │       └── detalle-post.componente.*
│   │
│   └── contacto/                   # Módulo de contacto/soporte
│       └── componentes/
│           ├── formulario-contacto.componente.*
│           └── lista-faqs.componente.*
│
├── componentes/
│   ├── catalogo/                   # Componentes originales
│   │   └── catalogo.componente.*
│   ├── carrito/
│   │   └── carrito.componente.*
│   ├── producto-card/
│   │   └── producto-card.componente.*
│   │
│   └── compartidos/                # Componentes reutilizables
│       ├── navbar.componente.*
│       └── footer.componente.*
│
├── modelos/                        # Interfaces y modelos TypeScript
│   ├── producto.modelo.ts
│   ├── usuario.modelo.ts
│   ├── cotizacion.modelo.ts
│   ├── proyecto.modelo.ts
│   └── reporte.modelo.ts
│
├── servicios/                      # Servicios compartidos
│   ├── auth.servicio.ts
│   ├── producto.servicio.ts
│   ├── carrito.servicio.ts
│   ├── cotizacion.servicio.ts
│   ├── proyecto.servicio.ts
│   ├── usuario.servicio.ts
│   ├── reporte.servicio.ts
│   ├── blog.servicio.ts
│   └── contacto.servicio.ts
│
├── guards/                         # Guards para rutas protegidas
│   └── auth.guard.ts
│
├── interceptores/                  # HTTP Interceptores
│   └── auth.interceptor.ts
│
├── utilidades/                     # Funciones y constantes compartidas
│   ├── constantes.ts
│   └── helpers.ts
│
├── app.config.ts
├── app.routes.ts
├── app.ts
└── main.ts
```

## 🚀 Rutas Principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | CatalogoComponente | Página de inicio |
| `/catalogo` | CatalogoComponente | Catálogo de productos |
| `/carrito` | CarritoComponente | Carrito de compras |
| `/auth/login` | LoginComponente | Iniciar sesión |
| `/auth/registro` | LoginComponente* | Registrarse |
| `/cotizaciones` | ListaCotizacionesComponente | Lista de cotizaciones |
| `/cotizaciones/:id` | DetailComponente* | Detalle de cotización |
| `/proyectos` | ListaProyectosComponente | Lista de proyectos |
| `/proyectos/:id` | DetailComponente* | Detalle de proyecto |
| `/blog` | ListaBlogComponente | Blog/Noticias |
| `/contacto` | FormularioContactoComponente | Contacto/Soporte |
| `/admin/usuarios` | GestionarUsuariosComponente | Gestión de usuarios |
| `/dashboards/ventas` | DashboardVentasComponente | Dashboard de ventas |

*Por completar

## 📦 Servicios Disponibles

### AuthServicio
- `login(credenciales)` - Autenticación de usuario
- `logout()` - Cerrar sesión
- `registro(datos)` - Registro de usuario
- `obtenerToken()` - Token JWT
- `estáAutenticado()` - Verificar autenticación
- `tieneRol(rol)` - Verificar rol del usuario

### ProductoServicio
- `obtenerTodos()` - Obtener todos los productos
- `obtenerPorId(id)` - Obtener producto específico

### CotizacionServicio
- `obtenerTodas()` - Listar cotizaciones
- `obtenerPorId(id)` - Detalle de cotización
- `crear(cotizacion)` - Crear cotización
- `actualizar(id, cotizacion)` - Actualizar cotización
- `solicitarCotizacion(id)` - Enviar solicitud
- `exportarPDF(id)` - Generar PDF

### ProyectoServicio
- `obtenerTodos()` - Listar proyectos
- `obtenerPorId(id)` - Detalle de proyecto
- `crear(proyecto)` - Crear proyecto
- `actualizarEstado(id, estado)` - Cambiar estado

### ReporteServicio
- `obtenerDashboardVentas()` - Dashboard comercial
- `obtenerDashboardClientes()` - Dashboard clientes
- `obtenerDashboardProyectos()` - Dashboard proyectos
- `generarReporte(tipo, formato)` - Generar reportes
- `descargarReporte(id, nombre)` - Descargar PDF/Excel

### UsuarioServicio
- `obtenerTodos()` - Listar usuarios
- `crear(usuario)` - Crear usuario
- `actualizar(id, usuario)` - Actualizar usuario
- `cambiarPassword(id, actual, nueva)` - Cambiar contraseña

### BlogServicio
- `obtenerTodos()` - Listar posts
- `crear(post)` - Crear post
- `obtenerPorTag(tag)` - Filtrar por etiqueta

### ContactoServicio
- `enviarMensaje(mensaje)` - Enviar mensaje de contacto
- `obtenerFAQs()` - Obtener preguntas frecuentes
- `responderMensaje(id, respuesta)` - Responder soporte

## 🔐 Guards y Seguridad

- **authGuard**: Protege rutas que requieren autenticación
- **RoleGuard**: Verifica roles específicos (cliente, gerencia, admin, vendedor)
- **AuthInterceptor**: Inyecta token JWT en headers

## 🎨 Componentes Compartidos

- **NavbarComponente**: Barra de navegación con menú responsive
- **FooterComponente**: Pie de página con enlaces importantes

## 📱 Características

✅ Autenticación con JWT
✅ Gestión de productos
✅ Carrito de compras/cotizaciones
✅ Seguimiento de proyectos
✅ Dashboards analíticos
✅ Panel administrativo
✅ Blog de noticias
✅ Contacto y soporte
✅ Reportes (PDF/Excel)
✅ Responsive design
✅ Guards de rutas

## 🔧 Configuración de API

Base URL: `http://localhost:3000/api`

Actualizar en: `src/app/utilidades/constantes.ts`

```typescript
export const API_BASE_URL = 'http://localhost:3000/api';
```

## 📝 Próximos Pasos

- [ ] Completar componentes de registro
- [ ] Crear componentes detalle para cotizaciones, proyectos
- [ ] Implementar formularios de creación/edición
- [ ] Agregar validaciones frontend
- [ ] Conectar con backend API
- [ ] Implementar gestión de archivos (PDF, Excel)
- [ ] Agregar más dashboards
- [ ] Mejorar estilos y temas
- [ ] Testing (unit, E2E)
- [ ] Deployment y CI/CD

## 🚀 Uso Rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Build para producción
npm run build

# Tests
npm test
```

## 📖 Documentación Adicional

- Angular: https://angular.dev
- TypeScript: https://www.typescriptlang.org
- RxJS: https://rxjs.dev
