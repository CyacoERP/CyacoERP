import { Routes } from '@angular/router';
import { CatalogoComponente } from './componentes/catalogo/catalogo.componente';
import { CarritoComponente } from './componentes/carrito/carrito.componente';

export const routes: Routes = [
  { path: '', component: CatalogoComponente },
  { path: 'carrito', component: CarritoComponente },
  { path: '**', redirectTo: '' },
];