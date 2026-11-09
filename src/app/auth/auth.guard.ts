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
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const itemId = route.data['navigationItemId'];
    if (itemId === undefined) {
      return true;
    }

    return (
      (isNavigationItemId(itemId) &&
        canAccessNavigationItem(itemId, this.auth.userRoles())) ||
      this.router.createUrlTree(['/'])
    );
  }
}
