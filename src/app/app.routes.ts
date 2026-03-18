import { Routes } from '@angular/router';
import { LandingComponente } from './modules/landing/components/landing/landing.componente';
import { CatalogoComponente } from './modules/catalogo/components/catalogo/catalogo.componente';
import { CarritoComponente } from './modules/catalogo/components/carrito/carrito.componente';
import { LoginComponente } from './modules/auth/components/login/login.componente';
import { ListaCotizacionesComponente } from './modules/cotizaciones/components/lista-cotizaciones/lista-cotizaciones.componente';
import { ListaProyectosComponente } from './modules/proyectos/components/lista-proyectos/lista-proyectos.componente';
import { ListaBlogComponente } from './modules/blog/components/lista-blog/lista-blog.componente';
import { FormularioContactoComponente } from './modules/contacto/components/formulario-contacto/formulario-contacto.componente';

export const routes: Routes = [
  { path: '', component: LandingComponente },
  { path: 'catalogo', component: CatalogoComponente },
  { path: 'carrito', component: CarritoComponente },
  
  // Auth
  { path: 'auth/login', component: LoginComponente },
  { path: 'auth/registro', component: LoginComponente }, // Reutilizar login (será modificado después)
  
  // Cotizaciones
  { path: 'cotizaciones', component: ListaCotizacionesComponente },
  { path: 'cotizaciones/:id', component: ListaCotizacionesComponente },
  
  // Proyectos
  { path: 'proyectos', component: ListaProyectosComponente },
  { path: 'proyectos/:id', component: ListaProyectosComponente },
  
  // Blog
  { path: 'blog', component: ListaBlogComponente },
  { path: 'blog/:id', component: ListaBlogComponente },
  
  // Contacto
  { path: 'contacto', component: FormularioContactoComponente },
  
  // Comodín
  { path: '**', redirectTo: '' },
];