import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServicio } from '../../services/auth.servicio';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.componente.html',
  styleUrl: './login.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponente {
  private readonly authServicio = inject(AuthServicio);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly recuerdate = signal(false);
  readonly mostrarPassword = signal(false);
  readonly cargando = signal(false);
  readonly error = signal('');

  actualizarEmail(valor: string): void {
    this.email.set(valor);
    this.error.set('');
  }

  actualizarPassword(valor: string): void {
    this.password.set(valor);
    this.error.set('');
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  toggleRecuerdate(): void {
    this.recuerdate.update((v) => !v);
  }

  iniciarSesion(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor ingresa email y contraseña');
      return;
    }

    this.cargando.set(true);
    const credenciales = { email: this.email(), password: this.password() };
    this.authServicio.login(credenciales).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.mensaje || 'Error autenticando');
        this.cargando.set(false);
      },
    });
  }
}
