import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Proveedor } from '../models/proveedor.model';
import { ProveedorService } from '../services/proveedor.service';

@Component({
  selector: 'app-proveedor-list',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Directorio</p>
          <h1>Gestión de proveedores</h1>
        </div>
        <div class="header-actions">
          <a routerLink="/ventas" class="button button-secondary">Ventas</a>
          <a routerLink="/proveedores/nuevo" class="button button-primary">+ Nuevo proveedor</a>
        </div>
      </header>

      @if (cargando()) {
        <p class="message" role="status">Cargando proveedores...</p>
      } @else if (error()) {
        <p class="message message-error" role="alert">{{ error() }}</p>
      } @else if (proveedores().length === 0) {
        <p class="message">No hay proveedores registrados.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <caption>Proveedores registrados</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">RUC</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Email</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (proveedor of proveedores(); track proveedor.id ?? proveedor.ruc) {
                <tr>
                  <td>{{ proveedor.nombre }}</td>
                  <td>{{ proveedor.ruc }}</td>
                  <td>{{ proveedor.telefono }}</td>
                  <td>{{ proveedor.email }}</td>
                  <td class="actions">
                    @if (proveedor.id !== undefined) {
                      <a [routerLink]="['/proveedores/editar', proveedor.id]">Editar</a>
                      <button
                        type="button"
                        [disabled]="eliminandoId() === proveedor.id"
                        [attr.aria-label]="'Eliminar proveedor ' + proveedor.nombre"
                        (click)="eliminar(proveedor.id!)">
                        {{ eliminandoId() === proveedor.id ? 'Eliminando...' : 'Eliminar' }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
<<<<<<< HEAD
      color: #172b4d;
      background: #f4f7fb;
=======
      color: #202a24;
      background: #f5f7f4;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(1100px, calc(100% - 40px));
      margin: 0 auto;
<<<<<<< HEAD
      padding: 56px 0 72px;
=======
      padding: 48px 0;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
      margin-bottom: 28px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .eyebrow {
      margin: 0 0 8px;
<<<<<<< HEAD
      color: #1d4ed8;
=======
      color: #467458;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
<<<<<<< HEAD
      font-size: clamp(28px, 4vw, 36px);
=======
      font-size: 30px;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-weight: 650;
    }

    .button {
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 16px;
<<<<<<< HEAD
      border-radius: 7px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 140ms ease, transform 140ms ease;
=======
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .button-primary {
      color: #fff;
<<<<<<< HEAD
      background: #1d4ed8;
    }

    .button-primary:hover:not(:disabled) {
      background: #1e40af;
      transform: translateY(-1px);
=======
      background: #286744;
    }

    .button-primary:hover {
      background: #1d5235;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .button-secondary {
      min-height: 42px;
      padding: 0 16px;
<<<<<<< HEAD
      border: 1px solid #dbe4f0;
      border-radius: 7px;
      color: #123b8a;
      background: #ffffff;
=======
      border: 1px solid #aebbb1;
      border-radius: 4px;
      color: #34443a;
      background: #fff;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      text-decoration: none;
      font-weight: 600;
    }

    .table-wrap {
      overflow-x: auto;
<<<<<<< HEAD
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
=======
      border-top: 1px solid #d9e0da;
      border-bottom: 1px solid #d9e0da;
      background: #fff;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    caption {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    th,
    td {
      padding: 14px 16px;
<<<<<<< HEAD
      border-bottom: 1px solid #dbe4f0;
=======
      border-bottom: 1px solid #e6ebe6;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      white-space: nowrap;
    }

    th {
<<<<<<< HEAD
      color: #52637a;
=======
      color: #536258;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .actions a,
    .actions button {
      padding: 0;
      border: 0;
<<<<<<< HEAD
      color: #1d4ed8;
=======
      color: #286744;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      background: transparent;
      font: inherit;
      cursor: pointer;
    }

    .actions button {
<<<<<<< HEAD
      color: #a23b2b;
=======
      color: #a33d35;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    a:focus-visible,
    button:focus-visible {
<<<<<<< HEAD
      outline: 3px solid #1d4ed8;
=======
      outline: 3px solid #d18b2c;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      outline-offset: 3px;
    }

    .message {
      padding: 20px 0;
<<<<<<< HEAD
      color: #52637a;
    }

    .message-error {
      color: #a23b2b;
=======
      color: #536258;
    }

    .message-error {
      color: #a33d35;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    @media (max-width: 640px) {
      .page {
        width: min(100% - 28px, 1100px);
        padding: 32px 0;
      }

      .page-header {
        align-items: start;
        flex-direction: column;
      }

      .header-actions {
        flex-wrap: wrap;
      }

      h1 {
        font-size: 25px;
      }
    }
  `
})
export class ProveedorListComponent implements OnInit {
  private readonly service = inject(ProveedorService);

  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly eliminandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.service.listar().subscribe({
      next: (data) => {
        this.proveedores.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los proveedores.');
        this.cargando.set(false);
      }
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Eliminar proveedor?')) {
      return;
    }

    this.eliminandoId.set(id);
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: () => {
        this.error.set('No fue posible eliminar el proveedor.');
        this.eliminandoId.set(null);
      },
      complete: () => this.eliminandoId.set(null)
    });
  }
}