import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponente } from './shared/components/navbar/navbar.componente';
import { FooterComponente } from './shared/components/footer/footer.componente';
import { CarritoPreviewComponent } from './modules/catalogo/components/carrito-preview/carrito-preview.componente';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponente, FooterComponente, CarritoPreviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
