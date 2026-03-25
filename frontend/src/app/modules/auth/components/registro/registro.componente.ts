import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServicio } from '../../services/auth.servicio';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.componente.html',
  styleUrl: './registro.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroComponente {
  private readonly fb = inject(FormBuilder);
  private readonly authServicio = inject(AuthServicio);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mostrarPassword = signal(false);
  readonly error = signal('');

  readonly formulario = this.fb.nonNullable.group({
    nombreCompleto: ['', [Validators.required]],
    empresa: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    cargo: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]],
    aceptaTerminos: [false, [Validators.requiredTrue]],
  });

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  get passwordsNoCoinciden(): boolean {
    const password = this.formulario.controls.password.value;
    const confirmar = this.formulario.controls.confirmarPassword.value;
    return !!password && !!confirmar && password !== confirmar;
  }

  invalid(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  registrar(): void {
    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa los campos obligatorios para continuar.');
      return;
    }

    if (this.passwordsNoCoinciden) {
      this.error.set('La confirmación de contraseña no coincide.');
      return;
    }

    const payload = {
      nombreCompleto: this.formulario.controls.nombreCompleto.value,
      empresa: this.formulario.controls.empresa.value,
      correo: this.formulario.controls.correo.value,
      telefono: this.formulario.controls.telefono.value,
      cargo: this.formulario.controls.cargo.value,
      password: this.formulario.controls.password.value,
    };

    this.cargando.set(true);
    this.authServicio.registro(payload).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        const mensaje =
          typeof err === 'object' && err && 'error' in err
            ? (err as { error?: { mensaje?: string } }).error?.mensaje
            : undefined;

        this.error.set(mensaje || 'No fue posible completar el registro.');
        this.cargando.set(false);
      },
    });
  }
}
