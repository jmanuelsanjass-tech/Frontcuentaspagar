import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { canAccessNavigationItem, isNavigationItemId } from '../navigation';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // 1. Verificamos si el usuario está logueado
    if (!this.auth.isLoggedIn()) {
      console.warn('Guard: Usuario no autenticado. Redirigiendo a login.');
      return this.router.createUrlTree(['/login']);
    }

    // 2. Si está logueado, verificamos los roles
    const itemId = route.data['navigationItemId'];
    
    // Si la ruta no requiere un item de navegación específico, lo dejamos pasar
    if (!itemId) {
      return true; 
    }

    const roles = this.auth.userRoles();
    console.log('==== GUARD ====');
    console.log('Ruta:', route.routeConfig?.path);
    console.log('Roles detectados:', roles);

    const acceso = isNavigationItemId(itemId) && canAccessNavigationItem(itemId, roles);
    console.log('¿Tiene acceso?:', acceso);

    // 3. Si tiene acceso, pasa. Si no, lo mandamos a la página principal
    return acceso ? true : this.router.createUrlTree(['/']);
  }
}