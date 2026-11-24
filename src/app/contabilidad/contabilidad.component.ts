import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="dashboard">

      <section class="welcome">
        <p class="eyebrow">Finanzas</p>
        <h1>Contabilidad</h1>
        <p class="welcome-copy">
          Gestión de cuentas por cobrar y cuentas por pagar.
        </p>
      </section>

      <section class="module-grid">

        <a
          class="module-card"
          [routerLink]="['/cuentas-por-cobrar']">

          <span class="module-icon receivable-icon">CC</span>

          <span class="module-title">
            Cuentas por Cobrar
          </span>

          <span class="module-description">
            Administra cuentas, saldos y movimientos de cobranza.
          </span>

          <span class="module-action">
            Abrir →
          </span>

        </a>

        <a
          class="module-card"
          [routerLink]="['/cuentas-por-pagar']">

          <span class="module-icon payable-icon">CP</span>

          <span class="module-title">
            Cuentas por Pagar
          </span>

          <span class="module-description">
            Consulta compras, recepciones, facturas, pagos y auditoría.
          </span>

          <span class="module-action">
            Abrir →
          </span>

        </a>

      </section>

    </main>
  `,
  styles: [`
    .dashboard {
      width: min(1160px, calc(100% - 40px));
      margin: 0 auto;
      padding: 56px 0;
    }

    .welcome {
      margin-bottom: 30px;
      padding: 32px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid #dbe4f0;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    .module-card {
      display: grid;
      padding: 24px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: white;
      text-decoration: none;
      color: inherit;
    }

    .module-icon {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .receivable-icon {
      color: #166534;
      background: #dcfce7;
    }

    .payable-icon {
      color: #991b1b;
      background: #fee2e2;
    }

    .module-title {
      font-size: 20px;
      font-weight: 700;
    }

    .module-description {
      margin-top: 8px;
      color: #52637a;
    }

    .module-action {
      margin-top: 20px;
      color: #1d4ed8;
      font-weight: 700;
    }
  `]
})
export class ContabilidadComponent {}