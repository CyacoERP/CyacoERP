import { Routes } from '@angular/router';
import { LandingComponente } from './modules/landing/components/landing/landing.componente';
import { CatalogoComponente } from './modules/catalogo/components/catalogo/catalogo.componente';
import { CarritoComponente } from './modules/catalogo/components/carrito/carrito.componente';
import { LoginComponente } from './modules/auth/components/login/login.componente';
import { RegistroComponente } from './modules/auth/components/registro/registro.componente';
import { ListaCotizacionesComponente } from './modules/cotizaciones/components/lista-cotizaciones/lista-cotizaciones.componente';
import { SolicitarCotizacionComponente } from './modules/cotizaciones/components/solicitar-cotizacion/solicitar-cotizacion.componente';
import { CotizacionEnviadaComponente } from './modules/cotizaciones/components/cotizacion-enviada/cotizacion-enviada.componente';
import { DetalleCotizacionComponente } from './modules/cotizaciones/components/detalle-cotizacion/detalle-cotizacion.componente';
import { ListaProyectosComponente } from './modules/proyectos/components/lista-proyectos/lista-proyectos.componente';
import { DetalleProyectoComponente } from './modules/proyectos/components/detalle-proyecto/detalle-proyecto.componente';
import { ListaBlogComponente } from './modules/blog/components/lista-blog/lista-blog.componente';
import { FormularioContactoComponente } from './modules/contacto/components/formulario-contacto/formulario-contacto.componente';
import { DashboardVentasComponente } from './modules/dashboards/components/dashboard-ventas/dashboard-ventas.componente';
import { DashboardClientesComponente } from './modules/dashboards/components/dashboard-clientes/dashboard-clientes.componente';
import { DashboardProyectosComponente } from './modules/dashboards/components/dashboard-proyectos/dashboard-proyectos.componente';
import { GestionarUsuariosComponente } from './modules/admin/components/gestionar-usuarios/gestionar-usuarios.componente';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponente },
  { path: 'catalogo', component: CatalogoComponente },
  { path: 'carrito', component: CarritoComponente },
  
  // Auth
  { path: 'auth/login', component: LoginComponente },
  { path: 'auth/registro', component: RegistroComponente },
  
  // Cotizaciones
  { path: 'cotizaciones', redirectTo: 'cotizaciones/mis', pathMatch: 'full' },
  { path: 'cotizaciones/mis', component: ListaCotizacionesComponente, canActivate: [authGuard] },
  { path: 'cotizaciones/solicitar', component: SolicitarCotizacionComponente, canActivate: [authGuard] },
  { path: 'cotizaciones/enviada', component: CotizacionEnviadaComponente, canActivate: [authGuard] },
  { path: 'cotizaciones/:id', component: DetalleCotizacionComponente, canActivate: [authGuard] },
  
  // Proyectos
  { path: 'proyectos', component: ListaProyectosComponente, canActivate: [authGuard] },
  { path: 'proyectos/:id', component: DetalleProyectoComponente, canActivate: [authGuard] },
  
  // Dashboards
  {
    path: 'dashboards/ventas',
    component: DashboardVentasComponente,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  {
    path: 'dashboards/clientes',
    component: DashboardClientesComponente,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  {
    path: 'dashboards/proyectos',
    component: DashboardProyectosComponente,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  // Admin
  {
    path: 'admin/usuarios',
    component: GestionarUsuariosComponente,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  
  // Blog
  { path: 'blog', component: ListaBlogComponente },
  { path: 'blog/:id', component: ListaBlogComponente },
  
  // Contacto
  { path: 'contacto', component: FormularioContactoComponente },
  
  // Comodín
  { path: '**', redirectTo: '' },
];