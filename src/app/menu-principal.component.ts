import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getVisibleNavigationItems } from './navigation';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-menu-principal',
  imports: [RouterLink],
  template: `
    <main class="dashboard">
      <section class="welcome" aria-labelledby="welcome-title">
        @if (auth.currentUser(); as user) {
          <p class="eyebrow">Bienvenido, {{ user.username }}</p>
        }
        <h1 id="welcome-title">Menú principal</h1>
        <p class="welcome-copy">Accede rápidamente.</p>
      </section>

      <section class="module-grid" aria-label="Módulos disponibles">
        @for (item of moduleItems(); track item.id) {
          <a class="module-card" [routerLink]="item.path">
            <span [class]="item.iconClass" aria-hidden="true">{{ item.icon }}</span>
            <span class="module-title">{{ item.title }}</span>
            <span class="module-description">{{ item.description }}</span>
            <span class="module-action">{{ item.action }} <span aria-hidden="true">→</span></span>
          </a>
        } @empty {
          <p class="empty-menu" role="status">No hay módulos disponibles para tu rol.</p>
        }
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 76px);
      color: #172b4d;
      background: #f4f7fb;
      font-family: "Segoe UI", sans-serif;
    }

    .dashboard {
      width: min(1160px, calc(100% - 40px));
      margin: 0 auto;
      padding: 56px 0 72px;
    }

    .welcome {
      position: relative;
      margin-bottom: 30px;
      padding: 32px 36px;
      border: 1px solid #dbe4f0;
      border-radius: 18px;
      background: linear-gradient(115deg, #ffffff 0%, #eaf1ff 100%);
      box-shadow: 0 12px 32px rgb(30 64 175 / 6%);
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(30px, 4vw, 40px);
      font-weight: 650;
    }

    .welcome-copy {
      margin: 12px 0 0;
      color: #52637a;
      font-size: 16px;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .empty-menu {
      margin: 0;
      color: #52637a;
    }

    .module-card {
      display: grid;
      min-height: 210px;
      align-content: start;
      padding: 26px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      color: inherit;
      background: #ffffff;
      text-decoration: none;
      box-shadow: 0 5px 18px rgb(30 64 175 / 4%);
      transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
    }

    .module-card:hover {
      transform: translateY(-2px);
      border-color: #9bb9ef;
      box-shadow: 0 10px 26px rgb(30 64 175 / 11%);
    }

    .module-card:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
    }

    .module-icon {
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      margin-bottom: 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 750;
    }

    .suppliers-icon {
      color: #1d4ed8;
      background: #eaf1ff;
    }

    .sales-icon {
      color: #1e40af;
      background: #eff6ff;
    }

    .customers-icon {
      color: #315b9c;
      background: #e3edff;
    }

    .products-icon {
      color: #1d4ed8;
      background: #eaf1ff;
    }

    .receivable-icon {
      color: #166534;
      background: #dcfce7;
    }

    .module-title {
      font-size: 20px;
      font-weight: 700;
    }

    .module-description {
      margin-top: 8px;
      color: #52637a;
      font-size: 14px;
      line-height: 1.5;
    }

    .module-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 22px;
      color: #1d4ed8;
      font-size: 14px;
      font-weight: 700;
    }

    @media (max-width: 720px) {
      .dashboard {
        padding: 40px 0;
      }

      .welcome {
        padding: 26px 22px;
      }

      .module-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .module-card {
        min-height: 200px;
      }
    }

    @media (max-width: 520px) {
      .module-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .module-card {
        transition: none;
      }

      .module-card:hover {
        transform: none;
      }
    }
  `,
})
export class MenuPrincipalComponent {
  protected readonly auth = inject(AuthService);
  protected readonly moduleItems = computed(() =>
    getVisibleNavigationItems(this.auth.userRoles()).filter((item) => item.id !== 'home'),
  );
}
