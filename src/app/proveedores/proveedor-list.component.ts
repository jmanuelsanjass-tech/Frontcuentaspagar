import { HttpErrorResponse } from '@angular/common/http';
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

      @if (mensajeAccion()) {
        <p class="message" role="status">{{ mensajeAccion() }}</p>
      }
      @if (errorAccion()) {
        <p class="message message-error" role="alert">{{ errorAccion() }}</p>
      }
      @if (consultandoId() !== null) {
        <p class="message" role="status">Consultando proveedor #{{ consultandoId() }}...</p>
      }
      @if (errorConsulta()) {
        <p class="message message-error" role="alert">{{ errorConsulta() }}</p>
      }
      @if (detalle(); as proveedor) {
        <section class="detail" aria-labelledby="detail-title">
          <div class="detail-heading">
            <h2 id="detail-title">Detalle del proveedor #{{ proveedor.idProveedor }}</h2>
            <button type="button" class="detail-close" (click)="cerrarDetalle()">Cerrar detalle</button>
          </div>
          <dl>
            <div><dt>Nombre</dt><dd>{{ proveedor.nombre }}</dd></div>
            <div><dt>Teléfono</dt><dd>{{ proveedor.telefono }}</dd></div>
            <div><dt>Correo</dt><dd>{{ proveedor.correo }}</dd></div>
            <div><dt>Dirección</dt><dd>{{ proveedor.direccion || '—' }}</dd></div>
            <div><dt>Estado de dirección</dt><dd>{{ proveedor.estadoDireccion }}</dd></div>
            <div><dt>Estado</dt><dd>{{ proveedor.estado || '—' }}</dd></div>
            <div><dt>Productos suministrados</dt><dd>{{ proveedor.productosSuministrados || '—' }}</dd></div>
            <div><dt>Fecha de registro</dt><dd>{{ proveedor.fechaRegistro || '—' }}</dd></div>
            <div><dt>Auditoría</dt><dd>{{ proveedor.fechaAuditoria || '—' }} {{ proveedor.usuarioAuditoria || '' }}</dd></div>
            <div><dt>Código QR</dt><dd>{{ proveedor.qrCode ? 'Registrado' : 'No registrado' }}</dd></div>
          </dl>
        </section>
      }

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
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Correo</th>
                <th scope="col">Estado de dirección</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (proveedor of proveedores(); track proveedor.idProveedor) {
                <tr>
                  <td>{{ proveedor.idProveedor }}</td>
                  <td>{{ proveedor.nombre }}</td>
                  <td>{{ proveedor.telefono }}</td>
                  <td>{{ proveedor.correo }}</td>
                  <td>{{ proveedor.estadoDireccion }}</td>
                  <td>{{ proveedor.estado || '—' }}</td>
                  <td class="actions">
                    <button type="button"
                      [disabled]="consultandoId() !== null || eliminandoId() !== null"
                      [attr.aria-label]="'Consultar proveedor ' + proveedor.nombre"
                      (click)="consultar(proveedor)">Ver</button>
                    <a [routerLink]="['/proveedores/editar', proveedor.idProveedor]">Editar</a>
                    @if (confirmandoEliminarId() === proveedor.idProveedor) {
                      <button
                        type="button"
                        class="delete-action"
                        [disabled]="eliminandoId() !== null"
                        [attr.aria-label]="'Confirmar eliminación del proveedor ' + proveedor.nombre"
                        (click)="eliminar(proveedor)">
                        {{ eliminandoId() === proveedor.idProveedor ? 'Eliminando...' : 'Confirmar' }}
                      </button>
                      <button type="button" [disabled]="eliminandoId() !== null"
                        (click)="cancelarEliminacion()">Cancelar</button>
                    } @else {
                      <button type="button"
                        class="delete-action"
                        [disabled]="eliminandoId() !== null"
                        [attr.aria-label]="'Eliminar proveedor ' + proveedor.nombre"
                        (click)="solicitarEliminacion(proveedor)">Eliminar</button>
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
      color: #172b4d;
      background: #f4f7fb;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(1100px, calc(100% - 40px));
      margin: 0 auto;
      padding: 56px 0 72px;
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
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 36px);
      font-weight: 650;
    }

    .button {
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 16px;
      border-radius: 7px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 140ms ease, transform 140ms ease;
    }

    .button-primary {
      color: #fff;
      background: #1d4ed8;
    }

    .button-primary:hover:not(:disabled) {
      background: #1e40af;
      transform: translateY(-1px);
    }

    .button-secondary {
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid #dbe4f0;
      border-radius: 7px;
      color: #123b8a;
      background: #ffffff;
      text-decoration: none;
      font-weight: 600;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
    }

    .detail {
      margin-bottom: 20px;
      padding: 20px 24px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #fff;
    }

    .detail-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .detail-heading h2 {
      margin: 0;
      font-size: 19px;
    }

    .detail dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 14px;
      margin: 18px 0 0;
    }

    .detail dt {
      font-weight: 700;
    }

    .detail dd {
      margin: 4px 0 0;
      overflow-wrap: anywhere;
    }

    .detail-close {
      padding: 6px 10px;
      border: 1px solid #1d4ed8;
      border-radius: 4px;
      color: #1d4ed8;
      background: #fff;
      font: inherit;
      cursor: pointer;
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
      border-bottom: 1px solid #dbe4f0;
      white-space: nowrap;
    }

    th {
      color: #52637a;
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
      color: #1d4ed8;
      background: transparent;
      font: inherit;
      cursor: pointer;
    }

    .actions a {
      text-decoration: none;
    }

    .actions button.delete-action {
      color: #a23b2b;
    }

    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    a:focus-visible,
    button:focus-visible,
    .detail-close:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
    }

    .actions a[aria-disabled="true"],
    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .message {
      padding: 20px 0;
      color: #52637a;
    }

    .message-error {
      color: #a23b2b;
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
  readonly confirmandoEliminarId = signal<number | null>(null);
  readonly consultandoId = signal<number | null>(null);
  readonly detalle = signal<Proveedor | null>(null);
  readonly errorConsulta = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);
  readonly mensajeAccion = signal<string | null>(null);

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
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para cargar los proveedores.'
            : `No fue posible cargar los proveedores (HTTP ${response.status}).`,
        );
        this.cargando.set(false);
      }
    });
  }

  consultar(proveedor: Proveedor): void {
    this.consultandoId.set(proveedor.idProveedor);
    this.detalle.set(null);
    this.errorConsulta.set(null);
    this.service.obtener(proveedor.idProveedor).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.consultandoId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorConsulta.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para consultar el proveedor.'
            : response.status === 404
              ? 'El proveedor no se encontró en el servidor.'
              : `No fue posible consultar el proveedor (HTTP ${response.status}).`,
        );
        this.consultandoId.set(null);
      },
    });
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
    this.errorConsulta.set(null);
  }

  solicitarEliminacion(proveedor: Proveedor): void {
    this.confirmandoEliminarId.set(proveedor.idProveedor);
    this.errorAccion.set(null);
    this.mensajeAccion.set(null);
  }

  cancelarEliminacion(): void {
    this.confirmandoEliminarId.set(null);
  }

  eliminar(proveedor: Proveedor): void {
    const id = proveedor.idProveedor;
    if (this.confirmandoEliminarId() !== id || this.eliminandoId() !== null) {
      return;
    }

    this.eliminandoId.set(id);
    this.errorAccion.set(null);
    this.service.eliminar(id).subscribe({
      next: () => {
        this.proveedores.update((proveedores) => proveedores.filter((item) => item.idProveedor !== id));
        if (this.detalle()?.idProveedor === id) {
          this.cerrarDetalle();
        }
        this.confirmandoEliminarId.set(null);
        this.eliminandoId.set(null);
        this.mensajeAccion.set(`Proveedor ${proveedor.nombre} eliminado correctamente.`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para eliminar el proveedor.'
            : response.status === 404
              ? 'El proveedor no se encontró en el servidor y no pudo eliminarse.'
              : `No fue posible eliminar el proveedor (HTTP ${response.status}).`,
        );
        this.eliminandoId.set(null);
      },
    });
  }
}