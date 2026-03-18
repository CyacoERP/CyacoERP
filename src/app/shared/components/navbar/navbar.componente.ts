import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthServicio } from '../../../modules/auth/services/auth.servicio';
import { Usuario } from '../../models/usuario.modelo';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.componente.html',
  styleUrl: './navbar.componente.css',
})
export class NavbarComponente implements OnInit {
  usuarioActual: Usuario | null = null;
  menuAbierto = false;

  constructor(private authServicio: AuthServicio) {}

  ngOnInit(): void {
    this.authServicio.usuarioActual$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(): void {
    this.authServicio.logout();
  }
}
