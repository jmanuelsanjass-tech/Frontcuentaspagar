import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-principal',
  imports: [RouterLink],
  template: `
    <main class="dashboard">
      <section class="welcome" aria-labelledby="welcome-title">
        <p class="eyebrow">Panel de control</p>
        <h1 id="welcome-title">Menú principal</h1>
        <p class="welcome-copy">Accede rápidamente a los módulos de tu negocio.</p>
      </section>

      <section class="module-grid" aria-label="Módulos disponibles">
        <a class="module-card" routerLink="/proveedores">
          <span class="module-icon suppliers-icon" aria-hidden="true">PR</span>
          <span class="module-title">Proveedores</span>
          <span class="module-description">Consulta y administra el directorio de proveedores.</span>
          <span class="module-action">Ir a proveedores <span aria-hidden="true">→</span></span>
        </a>
        <a class="module-card" routerLink="/ventas">
          <span class="module-icon sales-icon" aria-hidden="true">VE</span>
          <span class="module-title">Ventas</span>
          <span class="module-description">Registra productos, pagos y ventas.</span>
          <span class="module-action">Ir a ventas <span aria-hidden="true">→</span></span>
        </a>
        <a class="module-card" routerLink="/productos">
          <span class="module-icon products-icon" aria-hidden="true">PR</span>
          <span class="module-title">Productos</span>
          <span class="module-description">Consulta y administra el inventario de productos.</span>
          <span class="module-action">Ir a productos <span aria-hidden="true">→</span></span>
        </a>
        <a class="module-card" routerLink="/clientes">
          <span class="module-icon customers-icon" aria-hidden="true">CL</span>
          <span class="module-title">Clientes</span>
          <span class="module-description">Accede al módulo para administrar clientes.</span>
          <span class="module-action">Ir a clientes <span aria-hidden="true">→</span></span>
        </a>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 76px);
      color: #34271f;
      background: #fbf5ed;
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
      border: 1px solid #ead8c5;
      border-radius: 18px;
      background: linear-gradient(115deg, #fffdf9 0%, #f8eadd 100%);
      box-shadow: 0 12px 32px rgb(88 52 30 / 6%);
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #843e22;
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
      color: #69564a;
      font-size: 16px;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .module-card {
      display: grid;
      min-height: 210px;
      align-content: start;
      padding: 26px;
      border: 1px solid #eadfd3;
      border-radius: 14px;
      color: inherit;
      background: #fffdf9;
      text-decoration: none;
      box-shadow: 0 5px 18px rgb(88 52 30 / 4%);
      transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
    }

    .module-card:hover {
      transform: translateY(-2px);
      border-color: #c58d6b;
      box-shadow: 0 10px 26px rgb(88 52 30 / 11%);
    }

    .module-card:focus-visible {
      outline: 3px solid #843e22;
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
      color: #843e22;
      background: #f8eadd;
    }

    .sales-icon {
      color: #80551b;
      background: #fbf1e6;
    }

    .customers-icon {
      color: #79533d;
      background: #f2e6dc;
    }

    .products-icon {
      color: #843e22;
      background: #f8eadd;
    }

    .module-title {
      font-size: 20px;
      font-weight: 700;
    }

    .module-description {
      margin-top: 8px;
      color: #69564a;
      font-size: 14px;
      line-height: 1.5;
    }

    .module-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 22px;
      color: #843e22;
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
export class MenuPrincipalComponent {}
