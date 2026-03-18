import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthServicio } from '../../modules/auth/services/auth.servicio';

export const authGuard: CanActivateFn = (route, state) => {
  const authServicio = inject(AuthServicio);
  const router = inject(Router);

  if (authServicio.estáAutenticado()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  constructor(
    private authServicio: AuthServicio,
    private router: Router
  ) {}

  tieneRol(rolesPermitidos: string[]): boolean {
    const usuario = this.authServicio.obtenerUsuarioActual();
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      this.router.navigate(['/no-autorizado']);
      return false;
    }
    return true;
  }
}
