import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.componente.html',
  styleUrls: ['./landing.componente.css']
})
export class LandingComponente {
  readonly stats = [
    { number: '20+', label: 'Años de experiencia' },
    { number: '900+', label: 'Clientes activos' },
    { number: '6,000+', label: 'Productos en catálogo' },
    { number: '97%', label: 'Satisfacción del cliente' }
  ];
}
