import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <a class="brand" routerLink="/" aria-label="Zapaterías León, menú principal">
        <span class="brand-mark" aria-hidden="true">ERP</span>
        <span>Zapaterías León</span>
      </a>
      <nav class="main-nav" aria-label="Menú principal">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/proveedores" routerLinkActive="active">Proveedores</a>
        <a routerLink="/ventas" routerLinkActive="active">Ventas</a>
        <a routerLink="/productos" routerLinkActive="active">Productos</a>
        <a routerLink="/clientes" routerLinkActive="active">Clientes</a>
        @if (auth.isLoggedIn()) {
          <button class="nav-action" type="button" [disabled]="cerrandoSesion()" (click)="salir()">
            {{ cerrandoSesion() ? 'Saliendo...' : 'Salir' }}
          </button>
        }
      </nav>
    </header>
    @if (errorCierre()) {
      <p class="logout-error" role="alert">{{ errorCierre() }}</p>
    }
    <router-outlet />
  `,
  styles: `
    .nav-action {
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      border: 0;
      padding: 0 13px;
      border-radius: 5px;
      color: #69564a;
      background: transparent;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: color 120ms ease, background-color 120ms ease;
    }

    .nav-action:hover:not(:disabled) {
      color: #6d3019;
      background: #f8eadd;
    }

    .nav-action:focus-visible {
      outline: 3px solid #843e22;
      outline-offset: 2px;
    }

    .nav-action:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    @media (max-width: 640px) {
      .nav-action {
        flex: 0 0 auto;
        padding: 0 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .nav-action {
        transition: none;
      }
    }

    .logout-error {
      margin: 0;
      padding: 10px 20px;
      color: #8b1d19;
      background: #fff0e9;
      text-align: center;
    }
  `,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('cuentaspagar');
  protected readonly cerrandoSesion = signal(false);
  protected readonly errorCierre = signal('');
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  salir(): void {
    if (this.cerrandoSesion()) {
      return;
    }

    this.cerrandoSesion.set(true);
    this.errorCierre.set('');
    this.auth.logout().subscribe({
      next: () => {
        this.finalizarSalida();
      },
      error: () => {
        this.auth.clearAuthentication();
        this.errorCierre.set(
          'Se cerró la sesión en este navegador, pero el servidor no confirmó el cierre. Vuelve a iniciar sesión.',
        );
        void this.router.navigate(['/login']).finally(() => this.cerrandoSesion.set(false));
      },
    });
  }

  private finalizarSalida(): void {
    this.auth.clearAuthentication();
    void this.router.navigate(['/login']).finally(() => this.cerrandoSesion.set(false));
  }
}
