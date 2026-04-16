import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServicio } from '../../modules/auth/services/auth.servicio';
import { Usuario } from '../../shared/models/usuario.modelo';

export const authGuard: CanActivateFn = (route, state) => {
  const authServicio = inject(AuthServicio);
  const router = inject(Router);

  if (authServicio.estáAutenticado()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const roleGuard = (rolesPermitidos: Usuario['rol'][]): CanActivateFn => {
  return (_route, _state) => {
    const authServicio = inject(AuthServicio);
    const router = inject(Router);

    const usuario = authServicio.obtenerUsuarioActual();
    if (!usuario) {
      return router.parseUrl('/auth/login');
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return router.parseUrl('/');
    }

    return true;
  };
};
