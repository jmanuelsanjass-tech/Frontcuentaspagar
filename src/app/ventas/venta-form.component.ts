import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Venta, VentaDetalleRequest, VentaRequest } from '../models/venta.model';
import { VentaService } from '../services/venta.service';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Comercial</p>
          <h1>Ventas</h1>
          <p class="page-description">Registra y administra ventas con sus detalles.</p>
        </div>
        <div class="header-tools">
          <button type="button" class="button button-primary" (click)="nuevaVenta()">
            Nueva venta
          </button>
          <a routerLink="/clientes" class="back-link">Consultar clientes</a>
        </div>
      </header>

      @if (mensaje()) {
        <p class="message" role="status">{{ mensaje() }}</p>
      }
      @if (errorAccion()) {
        <p class="message message-error" role="alert">{{ errorAccion() }}</p>
      }

      @if (editorAbierto()) {
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <section class="section" aria-labelledby="venta-heading">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Entidad principal</p>
                <h2 id="venta-heading">
                  {{ editandoId() === null ? 'Registrar venta' : 'Editar venta #' + editandoId() }}
                </h2>
              </div>
            </div>

            <div class="sale-fields">
              <div class="field">
                <label for="clienteId">ID del cliente <span aria-hidden="true">*</span></label>
                <input id="clienteId" type="number" min="1" step="1" formControlName="clienteId"
                  placeholder="ID registrado en Clientes" required
                  [attr.aria-invalid]="form.controls.clienteId.invalid && form.controls.clienteId.touched"
                  aria-describedby="clienteId-error" />
                @if (form.controls.clienteId.invalid && form.controls.clienteId.touched) {
                  <p class="field-error" id="clienteId-error">Ingresa un ID de cliente entero y mayor que cero.</p>
                }
              </div>
              <div class="field">
                <label for="estado">Estado <span aria-hidden="true">*</span></label>
                <select id="estado" formControlName="estado" required>
                  <option value="completada">Completada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div class="field">
                <label for="descuento">Descuento</label>
                <input id="descuento" type="number" min="0" step="0.01" formControlName="descuento"
                  [attr.aria-invalid]="form.controls.descuento.invalid && form.controls.descuento.touched"
                  aria-describedby="descuento-error" />
                @if (form.controls.descuento.invalid && form.controls.descuento.touched) {
                  <p class="field-error" id="descuento-error">El descuento debe ser mayor o igual a cero.</p>
                }
              </div>
              <div class="field">
                <label for="iva">IVA <span aria-hidden="true">*</span></label>
                <input id="iva" type="number" min="0" step="0.01" formControlName="iva" required
                  [attr.aria-invalid]="form.controls.iva.invalid && form.controls.iva.touched"
                  aria-describedby="iva-error" />
                @if (form.controls.iva.invalid && form.controls.iva.touched) {
                  <p class="field-error" id="iva-error">El IVA es obligatorio y no puede ser negativo.</p>
                }
              </div>
            </div>
            <p class="field-hint">El servidor genera el ID, la fecha y los importes de subtotal y total.</p>
          </section>

          <section class="section" aria-labelledby="productos-heading">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Detalles enviados al servidor</p>
                <h2 id="productos-heading">Productos de la venta</h2>
              </div>
              <span class="item-count">{{ lineas().length }} productos</span>
            </div>

            <div class="product-fields" [formGroup]="detalleForm">
              <div class="field">
                <label for="codigoBarras">Código de barras <span aria-hidden="true">*</span></label>
                <input id="codigoBarras" formControlName="codigoBarras" maxlength="50"
                  autocomplete="off" required
                  [attr.aria-invalid]="detalleForm.controls.codigoBarras.invalid && detalleForm.controls.codigoBarras.touched"
                  aria-describedby="codigoBarras-error" />
                @if (detalleForm.controls.codigoBarras.invalid && detalleForm.controls.codigoBarras.touched) {
                  <p class="field-error" id="codigoBarras-error">El código de barras es obligatorio (máximo 50 caracteres).</p>
                }
              </div>
              <div class="field">
                <label for="cantidad">Cantidad <span aria-hidden="true">*</span></label>
                <input id="cantidad" type="number" min="0.01" step="0.01" formControlName="cantidad" required
                  [attr.aria-invalid]="detalleForm.controls.cantidad.invalid && detalleForm.controls.cantidad.touched"
                  aria-describedby="cantidad-error" />
                @if (detalleForm.controls.cantidad.invalid && detalleForm.controls.cantidad.touched) {
                  <p class="field-error" id="cantidad-error">La cantidad debe ser mayor que cero, con hasta dos decimales.</p>
                }
              </div>
              <div class="field">
                <label for="precioUnitario">Precio unitario <span aria-hidden="true">*</span></label>
                <input id="precioUnitario" type="number" min="0" step="0.01" formControlName="precioUnitario" required
                  [attr.aria-invalid]="detalleForm.controls.precioUnitario.invalid && detalleForm.controls.precioUnitario.touched"
                  aria-describedby="precioUnitario-error" />
                @if (detalleForm.controls.precioUnitario.invalid && detalleForm.controls.precioUnitario.touched) {
                  <p class="field-error" id="precioUnitario-error">El precio debe ser mayor o igual a cero y tener hasta dos decimales.</p>
                }
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <caption>Detalles que se enviarán con la venta</caption>
                <thead>
                  <tr>
                    <th scope="col">Código de barras</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Precio unitario</th>
                    <th scope="col">Importe</th>
                    <th scope="col"><span class="visually-hidden">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  @for (linea of lineas(); track $index) {
                    <tr>
                      <td>{{ linea.codigoBarras }}</td>
                      <td class="numeric">{{ linea.cantidad }}</td>
                      <td class="numeric">{{ formatoMoneda(linea.precioUnitario) }}</td>
                      <td class="numeric">{{ formatoMoneda(importeLinea(linea)) }}</td>
                      <td>
                        <button type="button" class="remove-button"
                          [attr.aria-label]="'Quitar detalle ' + linea.codigoBarras"
                          (click)="quitarProducto($index)">Quitar</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td class="empty-row" colspan="5">Aún no hay productos agregados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="section-actions">
              <button type="button" class="button button-secondary" (click)="agregarProducto()">
                Agregar producto
              </button>
            </div>
          </section>

          <section class="section sale-section" aria-labelledby="resumen-heading">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Estimación</p>
                <h2 id="resumen-heading">Resumen de venta</h2>
              </div>
            </div>
            <div class="sale-fields">
              <div class="field">
                <label for="subtotal">Subtotal estimado</label>
                <input id="subtotal" [value]="formatoMoneda(subtotal())" readonly />
              </div>
              <div class="field">
                <label for="totalVenta">Total estimado</label>
                <input id="totalVenta" [value]="formatoMoneda(totalVenta())" readonly />
              </div>
            </div>
            <p class="field-hint">Total = subtotal − descuento + IVA. El servidor calcula los importes definitivos.</p>
          </section>

          @if (errorFormulario()) {
            <p class="message message-error" role="alert">{{ errorFormulario() }}</p>
          }

          <div class="form-actions">
            <button type="button" class="button button-secondary" [disabled]="guardando()" (click)="cancelarEdicion()">
              Cancelar
            </button>
            <button type="submit" class="button button-primary" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : editandoId() === null ? 'Crear venta' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      }

      @if (cargando()) {
        <p class="message" role="status">Cargando ventas...</p>
      } @else if (errorLista()) {
        <p class="message message-error" role="alert">{{ errorLista() }}</p>
      } @else if (ventas().length === 0) {
        <p class="message">No hay ventas registradas.</p>
      } @else {
        <section class="sales-list" aria-labelledby="ventas-list-heading">
          <h2 id="ventas-list-heading">Ventas registradas</h2>
          <div class="table-wrap">
            <table>
              <caption>Ventas registradas y sus importes</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col">Descuento</th>
                  <th scope="col">IVA</th>
                  <th scope="col">Total</th>
                  <th scope="col">Detalles</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (venta of ventas(); track venta.ventaId) {
                  <tr>
                    <td>{{ venta.ventaId }}</td>
                    <td>{{ venta.clienteId }}</td>
                    <td>{{ venta.fechaVenta }}</td>
                    <td>{{ venta.estado || '—' }}</td>
                    <td class="numeric">{{ formatoMoneda(venta.subtotal) }}</td>
                    <td class="numeric">{{ formatoMoneda(venta.descuento ?? 0) }}</td>
                    <td class="numeric">{{ formatoMoneda(venta.iva) }}</td>
                    <td class="numeric">{{ formatoMoneda(venta.total) }}</td>
                    <td>{{ venta.detalles.length }}</td>
                    <td class="actions">
                      <button type="button" [disabled]="cargandoDetalleId() !== null || eliminandoId() !== null"
                        [attr.aria-label]="'Consultar venta ' + venta.ventaId"
                        (click)="consultar(venta)">Ver</button>
                      <button type="button" [disabled]="guardando() || eliminandoId() !== null"
                        [attr.aria-label]="'Editar venta ' + venta.ventaId"
                        (click)="editar(venta)">Editar</button>
                      @if (confirmandoEliminarId() === venta.ventaId) {
                        <button type="button" class="delete-action" [disabled]="eliminandoId() !== null"
                          [attr.aria-label]="'Confirmar eliminación de la venta ' + venta.ventaId"
                          (click)="eliminar(venta)">
                          {{ eliminandoId() === venta.ventaId ? 'Eliminando...' : 'Confirmar' }}
                        </button>
                        <button type="button" [disabled]="eliminandoId() !== null" (click)="cancelarEliminacion()">
                          Cancelar
                        </button>
                      } @else {
                        <button type="button" class="delete-action" [disabled]="eliminandoId() !== null"
                          [attr.aria-label]="'Eliminar venta ' + venta.ventaId"
                          (click)="solicitarEliminacion(venta)">Eliminar</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (cargandoDetalleId() !== null) {
        <p class="message" role="status">Consultando venta #{{ cargandoDetalleId() }}...</p>
      }
      @if (errorDetalle()) {
        <p class="message message-error" role="alert">{{ errorDetalle() }}</p>
      }
      @if (detalle(); as venta) {
        <section class="detail-panel" aria-labelledby="detalle-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Consulta por ID</p>
              <h2 id="detalle-heading">Venta #{{ venta.ventaId }}</h2>
            </div>
            <button type="button" class="button button-secondary" (click)="cerrarDetalle()">Cerrar detalle</button>
          </div>
          <dl class="detail-grid">
            <div><dt>Cliente</dt><dd>{{ venta.clienteId }}</dd></div>
            <div><dt>Fecha</dt><dd>{{ venta.fechaVenta }}</dd></div>
            <div><dt>Estado</dt><dd>{{ venta.estado || '—' }}</dd></div>
            <div><dt>Subtotal</dt><dd>{{ formatoMoneda(venta.subtotal) }}</dd></div>
            <div><dt>Descuento</dt><dd>{{ formatoMoneda(venta.descuento ?? 0) }}</dd></div>
            <div><dt>IVA</dt><dd>{{ formatoMoneda(venta.iva) }}</dd></div>
            <div><dt>Total</dt><dd>{{ formatoMoneda(venta.total) }}</dd></div>
            <div><dt>Auditoría</dt><dd>{{ venta.fechaAuditoria || '—' }} {{ venta.usuarioAuditoria || '' }}</dd></div>
          </dl>
          <div class="table-wrap">
            <table>
              <caption>Detalles de la venta consultada</caption>
              <thead>
                <tr>
                  <th scope="col">ID detalle</th>
                  <th scope="col">Código de barras</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio unitario</th>
                  <th scope="col">Importe</th>
                </tr>
              </thead>
              <tbody>
                @for (linea of venta.detalles; track linea.detalleId) {
                  <tr>
                    <td>{{ linea.detalleId }}</td>
                    <td>{{ linea.codigoBarras }}</td>
                    <td class="numeric">{{ linea.cantidad }}</td>
                    <td class="numeric">{{ formatoMoneda(linea.precioUnitario) }}</td>
                    <td class="numeric">{{ formatoMoneda(linea.importe) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </main>
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
      width: min(1180px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0 72px;
    }

    .page-header,
    .section-heading,
    .detail-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .page-header {
      align-items: start;
      margin-bottom: 24px;
    }

    .header-tools {
      display: grid;
      justify-items: end;
      gap: 12px;
    }

    .eyebrow,
    .section-kicker {
      margin: 0 0 6px;
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

    h2 {
      margin: 0;
      color: #123b8a;
      font-size: 21px;
      font-weight: 650;
    }

    .page-description,
    .field-hint {
      color: #52637a;
      font-size: 14px;
    }

    .page-description {
      margin: 10px 0 0;
    }

    .field-hint {
      margin: 14px 0 0;
    }

    .back-link {
      color: #1d4ed8;
      font-weight: 600;
      text-decoration: none;
    }

    form,
    .sales-list,
    .detail-panel {
      margin-bottom: 24px;
      padding: 26px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
    }

    .section + .section {
      margin-top: 30px;
      padding-top: 26px;
      border-top: 1px solid #dbe4f0;
    }

    .section-heading {
      margin-bottom: 18px;
    }

    .section-kicker {
      color: #52637a;
    }

    .item-count {
      color: #52637a;
      font-size: 14px;
      font-weight: 600;
    }

    .sale-fields,
    .product-fields,
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .field {
      display: grid;
      align-content: start;
      gap: 7px;
    }

    label,
    .detail-grid dt {
      font-size: 14px;
      font-weight: 650;
    }

    input,
    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 9px 11px;
      border: 1px solid #c5d0df;
      border-radius: 6px;
      color: #172b4d;
      background: #fff;
      font: inherit;
    }

    input[readonly] {
      background: #f7f9fc;
    }

    input:focus-visible,
    select:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    input[aria-invalid="true"],
    select[aria-invalid="true"] {
      border-color: #a23b2b;
    }

    .field-error {
      margin: 0;
      color: #a23b2b;
      font-size: 13px;
    }

    .table-wrap {
      margin-top: 18px;
      overflow-x: auto;
      border: 1px solid #dbe4f0;
      border-radius: 8px;
      background: #fff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      white-space: nowrap;
    }

    caption {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    th,
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #dbe4f0;
      font-size: 14px;
    }

    th {
      color: #123b8a;
      background: #eaf1ff;
      font-weight: 650;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .numeric {
      text-align: right;
    }

    .section-actions {
      display: flex;
      justify-content: end;
      margin-top: 14px;
    }

    .remove-button,
    .actions button {
      padding: 6px;
      border: 0;
      color: #1d4ed8;
      background: transparent;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .remove-button,
    .actions .delete-action {
      color: #a23b2b;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .empty-row {
      padding: 24px;
      color: #52637a;
      text-align: center;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: 7px;
      font: inherit;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .button-primary {
      color: #fff;
      background: #1d4ed8;
    }

    .button-primary:hover:not(:disabled) {
      background: #1e40af;
    }

    .button-secondary {
      border-color: #dbe4f0;
      color: #123b8a;
      background: #fff;
    }

    .button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .button:focus-visible,
    .remove-button:focus-visible,
    .actions button:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #dbe4f0;
    }

    .message {
      margin: 16px 0;
      color: #1d4ed8;
    }

    .message-error {
      color: #a23b2b;
    }

    .detail-grid {
      margin: 16px 0;
    }

    .detail-grid dd {
      margin: 4px 0 0;
      overflow-wrap: anywhere;
    }

    @media (max-width: 720px) {
      .page {
        width: min(100% - 28px, 1180px);
        padding: 32px 0;
      }

      .page-header {
        flex-direction: column;
      }

      .header-tools {
        justify-items: start;
      }

      form,
      .sales-list,
      .detail-panel {
        padding: 18px;
      }

      .sale-fields,
      .product-fields,
      .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 420px) {
      .sale-fields,
      .product-fields,
      .detail-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class VentaFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);

  readonly ventas = signal<Venta[]>([]);
  readonly lineas = signal<VentaDetalleRequest[]>([]);
  readonly detalle = signal<Venta | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly cargandoDetalleId = signal<number | null>(null);
  readonly eliminandoId = signal<number | null>(null);
  readonly confirmandoEliminarId = signal<number | null>(null);
  readonly editorAbierto = signal(true);
  readonly editandoId = signal<number | null>(null);
  readonly mensaje = signal('');
  readonly errorLista = signal('');
  readonly errorFormulario = signal('');
  readonly errorDetalle = signal('');
  readonly errorAccion = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    estado: ['completada', [Validators.required, Validators.maxLength(20)]],
    descuento: [0, [Validators.required, Validators.min(0)]],
    iva: [0, [Validators.required, Validators.min(0)]],
  });
  readonly detalleForm = this.formBuilder.nonNullable.group({
    codigoBarras: ['', [Validators.required, Validators.maxLength(50)]],
    cantidad: [1, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d{1,8}(?:\.\d{1,2})?$/)]],
    precioUnitario: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d{1,10}(?:\.\d{1,2})?$/)]],
  });

  private readonly descuentoVenta = toSignal(this.form.controls.descuento.valueChanges, {
    initialValue: this.form.controls.descuento.value,
  });
  private readonly ivaVenta = toSignal(this.form.controls.iva.valueChanges, {
    initialValue: this.form.controls.iva.value,
  });

  readonly subtotal = computed(() => this.redondear(
    this.lineas().reduce((suma, linea) => suma + this.importeLinea(linea), 0),
  ));
  readonly totalVenta = computed(() => this.redondear(
    this.subtotal() - Number(this.descuentoVenta()) + Number(this.ivaVenta()),
  ));

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.cargando.set(true);
    this.errorLista.set('');
    this.ventaService.listar().subscribe({
      next: (ventas) => {
        this.ventas.set(ventas);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.errorLista.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para cargar las ventas.'
            : `No fue posible cargar las ventas (HTTP ${response.status}).`,
        );
        this.cargando.set(false);
      },
    });
  }

  agregarProducto(): void {
    const codigoBarras = this.detalleForm.controls.codigoBarras;
    const cantidad = this.detalleForm.controls.cantidad;
    const precioUnitario = this.detalleForm.controls.precioUnitario;
    codigoBarras.markAsTouched();
    cantidad.markAsTouched();
    precioUnitario.markAsTouched();
    if (codigoBarras.invalid || cantidad.invalid || precioUnitario.invalid) {
      return;
    }

    this.lineas.update((lineas) => [
      ...lineas,
      {
        codigoBarras: codigoBarras.value.trim(),
        cantidad: Number(cantidad.value),
        precioUnitario: Number(precioUnitario.value),
      },
    ]);
    this.detalleForm.reset({
      codigoBarras: '',
      cantidad: 1,
      precioUnitario: 0,
    });
    this.errorFormulario.set('');
    this.mensaje.set('Producto agregado a la venta.');
  }

  quitarProducto(indice: number): void {
    this.lineas.update((lineas) => lineas.filter((_, posicion) => posicion !== indice));
  }

  guardar(): void {
    this.mensaje.set('');
    this.errorFormulario.set('');
    const clienteId = Number(this.form.controls.clienteId.value);
    if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
      this.form.controls.clienteId.markAsTouched();
      this.errorFormulario.set('Ingresa un ID de cliente entero y mayor que cero.');
      return;
    }
    if (this.lineas().length === 0) {
      this.errorFormulario.set('Agrega al menos un detalle antes de guardar la venta.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (Number(this.form.controls.descuento.value) > this.subtotal()) {
      this.errorFormulario.set('El descuento no puede superar el subtotal.');
      return;
    }

    const request: VentaRequest = {
      clienteId,
      descuento: Number(this.form.controls.descuento.value),
      iva: Number(this.form.controls.iva.value),
      estado: this.form.controls.estado.value,
      detalles: this.lineas().map((linea) => ({
        codigoBarras: linea.codigoBarras,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
      })),
    };

    this.guardando.set(true);
    const id = this.editandoId();
    const peticion = id === null
      ? this.ventaService.crear(request)
      : this.ventaService.actualizar(id, request);
    peticion.subscribe({
      next: (venta) => {
        if (id === null) {
          this.ventas.update((ventas) => [...ventas, venta]);
          this.mensaje.set(`Venta #${venta.ventaId} creada correctamente.`);
        } else {
          this.ventas.update((ventas) => ventas.map((item) => item.ventaId === id ? venta : item));
          this.mensaje.set(`Venta #${venta.ventaId} actualizada correctamente.`);
        }
        this.guardando.set(false);
        this.resetEditor();
      },
      error: (response: HttpErrorResponse) => {
        this.errorFormulario.set(this.mensajeError(response, id === null ? 'crear' : 'actualizar'));
        this.guardando.set(false);
      },
    });
  }

  nuevaVenta(): void {
    this.resetEditor();
    this.editorAbierto.set(true);
    this.mensaje.set('');
    this.errorAccion.set('');
  }

  editar(venta: Venta): void {
    this.consultarVenta(venta.ventaId, true);
  }

  consultar(venta: Venta): void {
    this.consultarVenta(venta.ventaId, false);
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
    this.errorDetalle.set('');
  }

  solicitarEliminacion(venta: Venta): void {
    this.confirmandoEliminarId.set(venta.ventaId);
    this.errorAccion.set('');
    this.mensaje.set('');
  }

  cancelarEliminacion(): void {
    this.confirmandoEliminarId.set(null);
  }

  eliminar(venta: Venta): void {
    const id = venta.ventaId;
    if (this.confirmandoEliminarId() !== id || this.eliminandoId() !== null) {
      return;
    }

    this.eliminandoId.set(id);
    this.errorAccion.set('');
    this.ventaService.eliminar(id).subscribe({
      next: () => {
        this.ventas.update((ventas) => ventas.filter((item) => item.ventaId !== id));
        if (this.detalle()?.ventaId === id) {
          this.cerrarDetalle();
        }
        if (this.editandoId() === id) {
          this.cancelarEdicion();
        }
        this.confirmandoEliminarId.set(null);
        this.eliminandoId.set(null);
        this.mensaje.set(`Venta #${id} eliminada correctamente.`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para eliminar la venta.'
            : response.status === 404
              ? 'La venta no se encontró en el servidor y no pudo eliminarse.'
              : `No fue posible eliminar la venta (HTTP ${response.status}).`,
        );
        this.eliminandoId.set(null);
      },
    });
  }

  importeLinea(linea: VentaDetalleRequest): number {
    return this.redondear(linea.cantidad * linea.precioUnitario);
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
  }

  cancelarEdicion(): void {
    this.resetEditor();
    this.mensaje.set('');
  }

  private consultarVenta(id: number, abrirEditor: boolean): void {
    this.cargandoDetalleId.set(id);
    this.errorDetalle.set('');
    this.errorFormulario.set('');
    this.detalle.set(null);
    this.ventaService.obtenerPorId(id).subscribe({
      next: (venta) => {
        this.cargandoDetalleId.set(null);
        if (abrirEditor) {
          this.cargarEditor(venta);
        } else {
          this.detalle.set(venta);
        }
      },
      error: (response: HttpErrorResponse) => {
        this.errorDetalle.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para consultar la venta.'
            : response.status === 404
              ? 'La venta no se encontró en el servidor.'
              : `No fue posible consultar la venta (HTTP ${response.status}).`,
        );
        this.cargandoDetalleId.set(null);
      },
    });
  }

  private cargarEditor(venta: Venta): void {
    this.editandoId.set(venta.ventaId);
    this.editorAbierto.set(true);
    this.detalle.set(null);
    this.form.patchValue({
      clienteId: venta.clienteId,
      estado: venta.estado ?? 'completada',
      descuento: venta.descuento ?? 0,
      iva: venta.iva,
    });
    this.detalleForm.reset({
      codigoBarras: '',
      cantidad: 1,
      precioUnitario: 0,
    });
    this.lineas.set(venta.detalles.map((detalle) => ({
      codigoBarras: detalle.codigoBarras,
      cantidad: Number(detalle.cantidad),
      precioUnitario: Number(detalle.precioUnitario),
    })));
    this.mensaje.set(`Editando venta #${venta.ventaId}. Al guardar se reemplazarán todos sus detalles.`);
    this.errorFormulario.set('');
  }

  private resetEditor(): void {
    this.editandoId.set(null);
    this.form.reset({
      clienteId: 0,
      estado: 'completada',
      descuento: 0,
      iva: 0,
    });
    this.detalleForm.reset({
      codigoBarras: '',
      cantidad: 1,
      precioUnitario: 0,
    });
    this.lineas.set([]);
    this.errorFormulario.set('');
    this.editorAbierto.set(false);
  }

  private mensajeError(response: HttpErrorResponse, accion: string): string {
    if (response.status === 0) {
      return `No fue posible conectar con el servidor para ${accion} la venta.`;
    }
    if (response.status === 404) {
      return 'La venta o el cliente relacionado no se encontró en el servidor.';
    }
    if (response.status === 400) {
      return 'El servidor rechazó los datos. Verifica el cliente, los detalles, el código de barras y los importes.';
    }
    return `No fue posible ${accion} la venta (HTTP ${response.status}).`;
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
