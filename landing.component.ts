import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  stats = [
    { number: '20+', label: 'Años de experiencia' },
    { number: '900+', label: 'Clientes activos' },
    { number: '6,000+', label: 'Productos en catálogo' },
    { number: '97%', label: 'Satisfacción del cliente' }
  ];

  brands = [
    'Endress+Hauser',
    'Yokogawa',
    'Emerson',
    'ABB',
    'Vega'
  ];
}