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
      color: #202a24;
      background: #f5f7f4;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(1100px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0;
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
      color: #467458;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 650;
    }

    .button {
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 16px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
    }

    .button-primary {
      color: #fff;
      background: #286744;
    }

    .button-primary:hover {
      background: #1d5235;
    }

    .button-secondary {
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid #aebbb1;
      border-radius: 4px;
      color: #34443a;
      background: #fff;
      text-decoration: none;
      font-weight: 600;
    }

    .table-wrap {
      overflow-x: auto;
      border-top: 1px solid #d9e0da;
      border-bottom: 1px solid #d9e0da;
      background: #fff;
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
      border-bottom: 1px solid #e6ebe6;
      white-space: nowrap;
    }

    th {
      color: #536258;
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
      color: #286744;
      background: transparent;
      font: inherit;
      cursor: pointer;
    }

    .actions button {
      color: #a33d35;
    }

    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    a:focus-visible,
    button:focus-visible {
      outline: 3px solid #d18b2c;
      outline-offset: 3px;
    }

    .message {
      padding: 20px 0;
      color: #536258;
    }

    .message-error {
      color: #a33d35;
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