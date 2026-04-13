# AVISOS DE PRIVACIDAD Y POLITICA DE COOKIES - CYACO ERP

## 1. Responsable del tratamiento

CYACO ERP es responsable del tratamiento de los datos personales recabados a través de sus módulos de registro, autenticación, contacto, cotizaciones y administración de clientes.

Canales de contacto publicados en la interfaz:

- Correo: ventas@cyaco.mx
- Horario: Lun-Vie 8:00-18:00 CST

## 2. Datos personales que se recaban

Con base en los formularios y servicios actuales de la aplicación, CYACO ERP puede recabar las siguientes categorías de datos:

### 2.1 Datos de registro de usuario

- Nombre completo
- Empresa
- Correo electrónico
- Teléfono
- Cargo
- Contraseña

### 2.2 Datos de inicio de sesión

- Correo electrónico
- Contraseña

### 2.3 Datos de contacto

- Nombre
- Correo electrónico
- Teléfono (opcional)
- Empresa (opcional)
- Asunto
- Mensaje

### 2.4 Datos para solicitud de cotización

- Nombre completo
- Correo electrónico
- Teléfono
- Cargo
- Empresa
- Proyecto
- Fecha requerida
- Notas
- Productos, cantidades y subtotales solicitados

### 2.5 Datos de clientes (módulo administrativo/backend)

- Razón social
- RFC
- Correo electrónico (opcional)
- Teléfono (opcional)
- Sector (opcional)
- Estatus activo/inactivo

## 3. Finalidades del tratamiento

### 3.1 Finalidades primarias

Los datos personales se tratan para:

- Crear y administrar cuentas de usuario.
- Autenticar acceso al sistema.
- Gestionar solicitudes de cotización y su seguimiento comercial.
- Atender mensajes de contacto y soporte.
- Administrar cartera de clientes y operación comercial.
- Dar continuidad a proyectos y actividades asociadas.

### 3.2 Finalidades secundarias

Cuando corresponda, CYACO ERP puede utilizar datos de contacto para comunicaciones informativas relacionadas con el servicio.

## 4. Consentimiento

El consentimiento se obtiene en interfaces que incluyen aceptación expresa, por ejemplo:

- Registro: aceptación de Términos de Uso y Aviso de Privacidad.
- Cotización: aceptación del Aviso de Privacidad para contacto de seguimiento.

Si no existe aceptación en campos obligatorios de consentimiento, la aplicación bloquea el envío del formulario.

## 5. Almacenamiento y seguridad de la informacion

### 5.1 Medidas implementadas actualmente

- Uso de validaciones en frontend (campos obligatorios, formato de correo, longitud mínima de contraseña).
- Uso de validaciones en backend para datos de clientes (tipos, formato de correo, longitudes y restricciones).
- Existencia de guardas e interceptor de autenticación para uso de token JWT.
- Normalización de datos en backend (trim, mayúsculas/minúsculas) para reducir errores de consistencia.

### 5.2 Consideraciones de seguridad operativa

Actualmente el proyecto usa almacenamiento local del navegador para token y sesión de usuario, así como para cotizaciones locales:

- localStorage: token, usuario y cotizaciones.

Por esta razón, CYACO ERP recomienda para ambientes productivos:

- Habilitar HTTPS/TLS en todos los entornos públicos.
- Revisar hardening contra XSS.
- Evaluar migración de sesión a cookies seguras con atributos HttpOnly, Secure y SameSite, cuando la arquitectura de backend lo permita.
- Definir políticas de retención, depuración y borrado seguro para datos locales.

## 6. Politica de cookies y tecnologias similares

### 6.1 Uso actual identificado

Con base en la implementación actual del frontend/backend revisado:

- No se detectó uso funcional explícito de cookies de aplicación para sesión.
- No se detectó uso explícito de sessionStorage.
- Sí existe almacenamiento en localStorage para autenticación y cotizaciones.

### 6.2 Cookies técnicas

En caso de habilitarse en versiones futuras, las cookies técnicas se usarán exclusivamente para:

- Mantener sesiones autenticadas.
- Proteger flujos de autenticación.
- Mejorar continuidad de uso del sistema.

### 6.3 Cookies analíticas o de terceros

Si se incorporan herramientas analíticas o de terceros, CYACO ERP deberá:

- Informar su incorporación en esta política.
- Identificar proveedor y finalidad.
- Solicitar consentimiento cuando aplique conforme a normativa vigente.

### 6.4 Gestion de cookies

Cuando exista implementación efectiva de cookies no esenciales, se deberá habilitar un mecanismo de preferencia/consentimiento para aceptar o rechazar dichas cookies.

## 7. Transferencias de datos

CYACO ERP no declara en este documento transferencias a terceros fuera de la operación directa del servicio. Cualquier cambio de este tipo deberá actualizarse en esta política antes de su entrada en vigor.

## 8. Derechos de los titulares

Las personas titulares podrán solicitar, en términos de normativa aplicable, el ejercicio de derechos de:

- Acceso
- Rectificación
- Cancelación
- Oposición

Para atención de solicitudes, usar los canales oficiales de contacto publicados por CYACO ERP.

## 9. Conservacion de datos

Los datos se conservarán durante el tiempo necesario para cumplir con las finalidades descritas y obligaciones legales aplicables. En entornos de desarrollo o pruebas, se recomienda anonimizar o depurar información cuando no sea necesaria.

## 10. Cambios al aviso/sdd-apply

CYACO ERP podrá actualizar este documento por cambios normativos, funcionales, técnicos o de seguridad. La versión vigente será la publicada en la documentación oficial del proyecto.

## 11. Version del documento

- Documento: AVISOS_DE_PRIVACIDAD.md
- Fecha de emisión: 2026-04-13
- Estado: Vigente (sujeto a revisión legal)
---

## Anexo tecnico de trazabilidad (referencia interna)

Las siguientes piezas del sistema fundamentan las categorías de datos y su tratamiento:

- frontend/src/app/modules/auth/components/registro/registro.componente.ts
- frontend/src/app/modules/auth/components/login/login.componente.ts
- frontend/src/app/modules/auth/services/auth.servicio.ts
- frontend/src/app/modules/contacto/components/formulario-contacto/formulario-contacto.componente.ts
- frontend/src/app/modules/contacto/services/contacto.servicio.ts
- frontend/src/app/modules/cotizaciones/components/solicitar-cotizacion/solicitar-cotizacion.componente.ts
- frontend/src/app/modules/cotizaciones/services/cotizacion.servicio.ts
- frontend/src/app/core/interceptors/auth.interceptor.ts
- frontend/src/app/app.config.ts
- backend/src/clientes/dto/crear-cliente.dto.ts
- backend/src/clientes/clientes.service.ts
- frontend/src/app/shared/components/footer/footer.componente.html

Este anexo sirve como respaldo técnico de implementación y debe revisarse cuando cambien formularios, servicios o mecanismos de autenticación/persistencia.
