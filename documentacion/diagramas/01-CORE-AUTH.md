# Diagrama de Clases — Core + Auth

Este archivo contiene el diagrama de clases actualizado para el núcleo de la aplicación y el subsistema de autenticación (frontend). El diagrama está generado en formato Mermaid para facilitar su edición y renderizado.

```mermaid
classDiagram
    direction LR

    class App {
      +templateUrl: string
    }

    class NavbarComponente {
      +esAdmin(): boolean
      +cerrarSesion(): void
      +abrirCarritoDrawer(): void
      +estaEnSeccion(prefijos: string[]): boolean
    }

    class FooterComponente

    class AppRoutes {
      +routes: Routes
    }

    class AuthGuard {
      +authGuard(route, state): boolean
    }

    class RoleGuard {
      +roleGuard(rolesPermitidos): CanActivateFn
    }

    class AuthInterceptor {
      +intercept(req, next): Observable<HttpEvent>
    }

    class AuthServicio {
      +login(credenciales: LoginRequest): Observable<LoginResponse>
      +registro(datos: any): Observable<LoginResponse>
      +perfil(): Observable<Usuario>
      +actualizarPerfil(dto: ActualizarPerfilDto): Observable<Usuario>
      +cambiarPassword(passwordActual, passwordNueva): Observable<{mensaje: string}>
      +logout(): void
      +obtenerToken(): string|null
      +estáAutenticado(): boolean
      +obtenerUsuarioActual(): Usuario|null
      +tieneRol(rol: string): boolean
    }

    class LoginComponente {
      +iniciarSesion(): void
    }

    class Usuario {
      +id: number
      +nombre: string
      +email: string
      +telefono?: string
      +empresa?: string
      +cargo?: string
      +codigoPostal?: string
      +rol: string
    }

    class LoginRequest {
      +email: string
      +password: string
    }

    class LoginResponse {
      +token: string
      +usuario: Usuario
    }

    %% Relaciones
    App --> NavbarComponente
    App --> FooterComponente
    App --> AppRoutes

    NavbarComponente --> AuthServicio : "usa"
    AuthGuard ..> AuthServicio : "valida sesión"
    RoleGuard ..> AuthServicio : "valida rol"
    AuthInterceptor ..> AuthServicio : "inyecta token"
    LoginComponente --> AuthServicio : "autentica"

    AuthServicio o-- Usuario
    LoginResponse o-- Usuario

    %% Notas
    classDef componentes fill:#f3f4f6,stroke:#c7d2fe;
    class NavbarComponente,FooterComponente,LoginComponente componentes;

    classDef servicios fill:#ecfccb,stroke:#86efac;
    class AuthServicio servicios;

    classDef seguridad fill:#fff7ed,stroke:#ffd7b5;
    class AuthGuard,RoleGuard,AuthInterceptor seguridad;
```

Descripción corta:
- `AuthServicio` centraliza la autenticación, almacenamiento del token y del usuario en `localStorage`.
- `AuthInterceptor` inyecta el header `Authorization` y maneja 401 forzando logout.
- `authGuard` y `roleGuard` usan `AuthServicio` para permitir/denegar rutas.

Archivo generado automáticamente por asistente — puedes editar el bloque Mermaid para ajustar estilos o detalles.