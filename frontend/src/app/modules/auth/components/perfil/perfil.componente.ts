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
  readonly exito = signal(false);
  readonly error = signal('');

  // Datos de solo lectura
  readonly correo = signal('');
  readonly rol = signal('');

  // Campos editables
  readonly nombre = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly cargo = signal('');

  ngOnInit(): void {
    this.authServicio.perfil().subscribe({
      next: (usuario) => {
        this.poblarFormulario(usuario);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  private poblarFormulario(usuario: Usuario): void {
    this.correo.set(usuario.email);
    this.rol.set(usuario.rol);
    this.nombre.set(usuario.nombre ?? '');
    this.telefono.set(usuario.telefono ?? '');
    this.empresa.set(usuario.empresa ?? '');
    this.cargo.set(usuario.cargo ?? '');
  }

  guardar(): void {
    if (!this.nombre().trim()) {
      this.error.set('El nombre es requerido.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.exito.set(false);

    this.authServicio.actualizarPerfil({
      nombre: this.nombre().trim(),
      telefono: this.telefono().trim() || undefined,
      empresa: this.empresa().trim() || undefined,
      cargo: this.cargo().trim() || undefined,
    }).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.exito.set(true);
        this.poblarFormulario(usuario);
        // Actualizar localStorage para que el navbar refleje el cambio
        const usuarioLocalJson = localStorage.getItem('usuario');
        if (usuarioLocalJson) {
          try {
            const usuarioLocal = JSON.parse(usuarioLocalJson);
            const actualizado = { ...usuarioLocal, nombre: usuario.nombre };
            localStorage.setItem('usuario', JSON.stringify(actualizado));
          } catch (_) { /* nada */ }
        }
        setTimeout(() => this.exito.set(false), 3000);
      },
      error: (err) => {
        this.guardando.set(false);
        const msg = err?.error?.message ?? 'Error al guardar. Intenta de nuevo.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
