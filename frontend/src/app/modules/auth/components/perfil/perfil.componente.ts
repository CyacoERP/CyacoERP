import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServicio } from '../../services/auth.servicio';
import { Usuario } from '../../../../shared/models/usuario.modelo';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.componente.html',
  styleUrl: './perfil.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponente implements OnInit {
  private readonly authServicio = inject(AuthServicio);
  private readonly router = inject(Router);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly exitoPerfil = signal(false);
  readonly errorPerfil = signal('');

  readonly guardandoPass = signal(false);
  readonly exitoPass = signal(false);
  readonly errorPass = signal('');

  // Readonly
  readonly rol = signal('');

  // Campos editables — info personal
  readonly nombre = signal('');
  readonly correo = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly cargo = signal('');
  readonly codigoPostal = signal('');

  // Campos de cambio de contraseña
  readonly passActual = signal('');
  readonly passNueva = signal('');
  readonly passConfirmar = signal('');

  ngOnInit(): void {
    this.authServicio.perfil().subscribe({
      next: (usuario) => {
        this.poblarFormulario(usuario);
        this.cargando.set(false);
      },
      error: () => {
        this.errorPerfil.set('No se pudo cargar el perfil. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  private poblarFormulario(usuario: Usuario): void {
    this.rol.set(usuario.rol);
    this.nombre.set(usuario.nombre ?? '');
    this.correo.set(usuario.email);
    this.telefono.set(usuario.telefono ?? '');
    this.empresa.set(usuario.empresa ?? '');
    this.cargo.set(usuario.cargo ?? '');
    this.codigoPostal.set(usuario.codigoPostal ?? '');
  }

  guardar(): void {
    if (!this.nombre().trim()) {
      this.errorPerfil.set('El nombre es requerido.');
      return;
    }

    this.guardando.set(true);
    this.errorPerfil.set('');
    this.exitoPerfil.set(false);

    this.authServicio.actualizarPerfil({
      nombre: this.nombre().trim(),
      correo: this.correo().trim() || undefined,
      telefono: this.telefono().trim() || undefined,
      empresa: this.empresa().trim() || undefined,
      cargo: this.cargo().trim() || undefined,
      codigoPostal: this.codigoPostal().trim() || undefined,
    }).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.exitoPerfil.set(true);
        this.poblarFormulario(usuario);
        const usuarioLocalJson = localStorage.getItem('usuario');
        if (usuarioLocalJson) {
          try {
            const local = JSON.parse(usuarioLocalJson);
            localStorage.setItem('usuario', JSON.stringify({ ...local, nombre: usuario.nombre, email: usuario.email }));
          } catch (_) { /* nada */ }
        }
        setTimeout(() => this.exitoPerfil.set(false), 3000);
      },
      error: (err) => {
        this.guardando.set(false);
        const msg = err?.error?.message ?? err?.error?.mensaje ?? 'Error al guardar. Intenta de nuevo.';
        this.errorPerfil.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  cambiarContrasena(): void {
    this.errorPass.set('');
    this.exitoPass.set(false);

    if (!this.passActual().trim()) {
      this.errorPass.set('Ingresa tu contraseña actual.');
      return;
    }
    if (this.passNueva().length < 8) {
      this.errorPass.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.passNueva() !== this.passConfirmar()) {
      this.errorPass.set('Las contraseñas no coinciden.');
      return;
    }

    this.guardandoPass.set(true);

    this.authServicio.cambiarPassword(this.passActual(), this.passNueva()).subscribe({
      next: () => {
        this.guardandoPass.set(false);
        this.exitoPass.set(true);
        this.passActual.set('');
        this.passNueva.set('');
        this.passConfirmar.set('');
        setTimeout(() => this.exitoPass.set(false), 3000);
      },
      error: (err) => {
        this.guardandoPass.set(false);
        const msg = err?.error?.mensaje ?? err?.error?.message ?? 'Error al cambiar la contraseña.';
        this.errorPass.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
