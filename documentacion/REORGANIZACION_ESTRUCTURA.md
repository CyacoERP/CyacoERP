# 📁 NUEVA ESTRUCTURA ORGANIZACIONAL - CyacoERP

## ✅ Estructura Reorganizada (Modular y Escalable)

```
src/app/
│
├── core/                              # Configuración global
│   ├── guards/
│   │   └── auth.guard.ts             # ✅ Ya movido
│   │
│   ├── interceptors/
│   │   └── auth.interceptor.ts       # ✅ Ya movido
│   │
│   └── constants/
│       └── constantes.ts             # Configuraciones globales
│
├── shared/                            # Componentes y servicios reutilizables
│   ├── components/
│   │   ├── navbar/
│   │   │   ├── navbar.componente.ts
│   │   │   ├── navbar.componente.html
│   │   │   └── navbar.componente.css
│   │   └── footer/
│   │       ├── footer.componente.ts
│   │       ├── footer.componente.html
│   │       └── footer.componente.css
│   │
│   ├── services/                     # Servicios compartidos entre módulos
│   │   └── (vacío por ahora - solo HTTP común)
│   │
│   ├── models/                       # Modelos compartidos
│   │   ├── usuario.modelo.ts         # Compartido por varios módulos
│   │   └── (otros modelos comunes)
│   │
│   ├── pipes/                        # Pipes reutilizables
│   │   └── (próximas: custom pipes)
│   │
│   ├── directives/                   # Directivas reutilizables
│   │   └── (próximas: custom directives)
│   │
│   └── helpers.ts                    # Funciones helpers
│
├── modules/                          # Módulos de negocio (cada uno independiente)
│   │
│   ├── auth/ (Autenticación)
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.componente.ts
│   │   │   │   ├── login.componente.html
│   │   │   │   └── login.componente.css
│   │   │   └── registro/ (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── auth.servicio.ts      # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── auth.modelo.ts        # LoginRequest, LoginResponse
│   │   │
│   │   └── auth.routes.ts            # Rutas específicas del módulo
│   │
│   ├── catalogo/ (Catálogo de Productos)
│   │   ├── components/
│   │   │   ├── lista-productos/
│   │   │   ├── ficha-producto/
│   │   │   ├── comparador-productos/
│   │   │   ├── carrito/              # Componente carrito (mover aquí)
│   │   │   └── producto-card/        # (mover aquí)
│   │   │
│   │   ├── services/
│   │   │   ├── producto.servicio.ts  # 📍 DEBE IR AQUÍ
│   │   │   └── carrito.servicio.ts   # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── producto.modelo.ts    # 📍 DEBE IR AQUÍ
│   │   │
│   │   └── catalogo.routes.ts
│   │
│   ├── cotizaciones/ (Cotizaciones)
│   │   ├── components/
│   │   │   ├── lista-cotizaciones/
│   │   │   ├── detalle-cotizacion/   (próximo)
│   │   │   └── formulario-cotizacion/ (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── cotizacion.servicio.ts # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── cotizacion.modelo.ts  # 📍 DEBE IR AQUÍ
│   │   │
│   │   └── cotizaciones.routes.ts
│   │
│   ├── proyectos/ (Proyectos)
│   │   ├── components/
│   │   │   ├── lista-proyectos/
│   │   │   ├── detalle-proyecto/     (próximo)
│   │   │   └── formulario-proyecto/  (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── proyecto.servicio.ts  # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── proyecto.modelo.ts    # 📍 DEBE IR AQUÍ
│   │   │
│   │   └── proyectos.routes.ts
│   │
│   ├── dashboards/ (Reportes y Analytics)
│   │   ├── components/
│   │   │   ├── dashboard-ventas/
│   │   │   ├── dashboard-clientes/   (próximo)
│   │   │   └── dashboard-proyectos/  (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── reporte.servicio.ts   # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── reporte.modelo.ts     # 📍 DEBE IR AQUÍ
│   │   │
│   │   └── dashboards.routes.ts
│   │
│   ├── admin/ (Administración)
│   │   ├── components/
│   │   │   ├── gestionar-usuarios/
│   │   │   ├── gestionar-productos/  (próximo)
│   │   │   ├── gestionar-cotizaciones/ (próximo)
│   │   │   └── gestionar-proyectos/  (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── usuario.servicio.ts   # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── (admin.modelo.ts - próximo)
│   │   │
│   │   └── admin.routes.ts
│   │
│   ├── blog/ (Blog/Noticias)
│   │   ├── components/
│   │   │   ├── lista-blog/
│   │   │   └── detalle-post/         (próximo)
│   │   │
│   │   ├── services/
│   │   │   └── blog.servicio.ts      # 📍 DEBE IR AQUÍ
│   │   │
│   │   ├── models/
│   │   │   └── blog.modelo.ts        # 📍 DEBE IR AQUÍ
│   │   │
│   │   └── blog.routes.ts
│   │
│   └── contacto/ (Contacto y Soporte)
│       ├── components/
│       │   ├── formulario-contacto/
│       │   ├── lista-faqs/           (próximo)
│       │   └── chat-soporte/         (próximo)
│       │
│       ├── services/
│       │   └── contacto.servicio.ts  # 📍 DEBE IR AQUÍ
│       │
│       ├── models/
│       │   └── contacto.modelo.ts    # 📍 DEBE IR AQUÍ
│       │
│       └── contacto.routes.ts
│
├── app.routes.ts                     # Rutas principales (agrupa todas)
├── app.config.ts
├── app.ts
└── main.ts
```

---

## 📊 Resumen de Cambios

### Servicios a Mover:
| Servicio | Ubicación Actual | Ubicación Nueva |
|----------|-----------------|-----------------|
| auth.servicio.ts | src/app/servicios/ | src/app/modules/auth/services/ |
| producto.servicio.ts | src/app/servicios/ | src/app/modules/catalogo/services/ |
| carrito.servicio.ts | src/app/servicios/ | src/app/modules/catalogo/services/ |
| cotizacion.servicio.ts | src/app/servicios/ | src/app/modules/cotizaciones/services/ |
| proyecto.servicio.ts | src/app/servicios/ | src/app/modules/proyectos/services/ |
| usuario.servicio.ts | src/app/servicios/ | src/app/modules/admin/services/ |
| reporte.servicio.ts | src/app/servicios/ | src/app/modules/dashboards/services/ |
| blog.servicio.ts | src/app/servicios/ | src/app/modules/blog/services/ |
| contacto.servicio.ts | src/app/servicios/ | src/app/modules/contacto/services/ |

### Modelos a Mover:
| Modelo | Ubicación Actual | Ubicación Nueva |
|--------|-----------------|-----------------|
| usuario.modelo.ts | src/app/modelos/ | src/app/shared/models/ ⭐ |
| producto.modelo.ts | src/app/modelos/ | src/app/modules/catalogo/models/ |
| cotizacion.modelo.ts | src/app/modelos/ | src/app/modules/cotizaciones/models/ |
| proyecto.modelo.ts | src/app/modelos/ | src/app/modules/proyectos/models/ |
| reporte.modelo.ts | src/app/modelos/ | src/app/modules/dashboards/models/ |

⭐ Usuario es compartido porque lo usan múltiples módulos

### Componentes a Mover:
| Componente | Ubicación Actual | Ubicación Nueva |
|-----------|-----------------|-----------------|
| navbar | componentes/compartidos/ | shared/components/navbar/ ✅ |
| footer | componentes/compartidos/ | shared/components/footer/ ✅ |
| carrito | componentes/carrito/ | modules/catalogo/components/ |
| catalogo | componentes/catalogo/ | modules/catalogo/components/ |
| producto-card | componentes/producto-card/ | modules/catalogo/components/ |

✅ Ya movido

---

## 🎯 Ventajas de Esta Estructura

✅ **Modular**: Cada módulo es independiente
✅ **Escalable**: Fácil agregar nuevas funcionalidades
✅ **Mantenible**: Fácil encontrar y modificar código
✅ **Testeable**: Cada módulo puede testearse por separado
✅ **Reutilizable**: Shared para componentes comunes
✅ **Lazy Loading**: Cada módulo puede cargarse bajo demanda
✅ **Separación de Responsabilidades**: Core, Shared, Modules

---

## 📝 Próximos Pasos

1. [x] Crear estructura de carpetas
2. [ ] Mover servicios a sus módulos
3. [ ] Mover modelos a sus ubicaciones
4. [ ] Mover componentes de catalogo
5. [ ] Actualizar imports en archivos
6. [ ] Crear index.ts en cada módulo para facilitarexportaciones
7. [ ] Configurar rutas de cada módulo
8. [ ] Actualizar app.routes.ts consolidar rutas
9. [ ] Verificar compilación

---

## 🔗 Importaciones Después de la Reorganización

### Antes:
```typescript
import { AuthServicio } from '../../servicios/auth.servicio';
import { NavbarComponente } from '../../componentes/compartidos/navbar.componente';
```

### Después:
```typescript
import { AuthServicio } from '../../modules/auth/services/auth.servicio';
import { NavbarComponente } from '../../shared/components/navbar/navbar.componente';
```

O mejor, con paths elegantes en `tsconfig.json`:
```typescript
import { AuthServicio } from '@modules/auth/services/auth.servicio';
import { NavbarComponente } from '@shared/components/navbar/navbar.componente';
```
