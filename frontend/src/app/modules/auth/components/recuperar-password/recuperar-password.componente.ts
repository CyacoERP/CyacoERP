import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServicio } from '../../services/auth.servicio';

type Paso = 'solicitar' | 'resetear' | 'exito';

@Component({
  selector: 'app-recuperar-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-password.componente.html',
  styleUrl: './recuperar-password.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecuperarPasswordComponente {
  private readonly authServicio = inject(AuthServicio);
  private readonly router = inject(Router);

  readonly paso = signal<Paso>('solicitar');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly mensajeExito = signal('');

  // Paso 1
  readonly email = signal('');

  // Paso 2
  readonly codigo = signal('');
  readonly nuevaPassword = signal('');
  readonly confirmarPassword = signal('');
  readonly mostrarPassword = signal(false);

  actualizarEmail(v: string) { this.email.set(v); this.error.set(''); }
  actualizarCodigo(v: string) { this.codigo.set(v); this.error.set(''); }
  actualizarNuevaPassword(v: string) { this.nuevaPassword.set(v); this.error.set(''); }
  actualizarConfirmarPassword(v: string) { this.confirmarPassword.set(v); this.error.set(''); }
  toggleMostrarPassword() { this.mostrarPassword.update(v => !v); }

  solicitarCodigo(): void {
    const email = this.email().trim();
    if (!email) { this.error.set('Ingresa tu correo electrónico.'); return; }

    this.cargando.set(true);
    this.error.set('');

    this.authServicio.solicitarRecuperacion(email).subscribe({
      next: () => {
        this.cargando.set(false);
        this.paso.set('resetear');
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.error?.mensaje ?? 'Error al enviar el código. Intenta de nuevo.');
      },
    });
  }

  resetearPassword(): void {
    const codigo = this.codigo().trim();
    const nueva = this.nuevaPassword();
    const confirmar = this.confirmarPassword();

    if (!codigo) { this.error.set('Ingresa el código de verificación.'); return; }
    if (nueva.length < 8) { this.error.set('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (nueva !== confirmar) { this.error.set('Las contraseñas no coinciden.'); return; }

    this.cargando.set(true);
    this.error.set('');

    this.authServicio.resetearPassword(this.email().trim(), codigo, nueva).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.mensajeExito.set(res.mensaje);
        this.paso.set('exito');
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.error?.mensaje ?? 'Código inválido o expirado.');
      },
    });
  }

  irAlLogin(): void {
    void this.router.navigate(['/auth/login']);
  }
}
