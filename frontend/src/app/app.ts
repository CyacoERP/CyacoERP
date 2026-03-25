import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponente } from './shared/components/navbar/navbar.componente';
import { FooterComponente } from './shared/components/footer/footer.componente';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponente, FooterComponente],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
