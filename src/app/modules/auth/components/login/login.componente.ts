import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServicio } from '../../services/auth.servicio';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.componente.html',
  styleUrl: './login.componente.css',
})
export class LoginComponente {
  email = '';
  password = '';
  cargando = false;
  error = '';

  constructor(
    private authServicio: AuthServicio,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa email y contraseña';
      return;
    }

    this.cargando = true;
    const credenciales = { email: this.email, password: this.password };
    this.authServicio.login(credenciales).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.mensaje || 'Error autenticando';
        this.cargando = false;
      },
    });
  }
}
