import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.componente.html',
  styleUrl: './footer.componente.css',
})
export class FooterComponente {
  anioActual = new Date().getFullYear();
}
