import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponente } from './shared/components/navbar/navbar.componente';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponente],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
