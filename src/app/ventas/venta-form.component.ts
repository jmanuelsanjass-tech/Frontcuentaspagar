import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Comercial</p>
          <h1>Ventas</h1>
          <p class="page-description">Captura la venta y sus productos con los datos de las entidades.</p>
        </div>
        <div class="header-tools">
          <div class="field header-date">
            <label for="fechaVenta">Fecha y hora de venta <span aria-hidden="true">*</span></label>
            <input id="fechaVenta" type="datetime-local" [formControl]="form.controls.fechaVenta" required />
          </div>
          <a routerLink="/clientes" class="back-link">Consultar clientes</a>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
        <section class="section" aria-labelledby="venta-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Entidad principal</p>
              <h2 id="venta-heading">Datos de la venta</h2>
            </div>
          </div>

          <div class="sale-fields">
            <div class="field">
              <label for="idCliente">ID del cliente <span aria-hidden="true">*</span></label>
              <input id="idCliente" type="number" min="1" step="1" formControlName="idCliente"
                placeholder="ID registrado en Clientes" required />
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
              <label for="descuentoVenta">Descuento de la venta</label>
              <input id="descuentoVenta" type="number" formControlName="descuento" min="0" step="0.01" />
            </div>
            <div class="field">
              <label for="usuarioAuditoria">Usuario de auditoría</label>
              <input id="usuarioAuditoria" formControlName="usuarioAuditoria" maxlength="50"
                placeholder="Usuario responsable (opcional)" />
            </div>
          </div>
          <p class="field-hint">El ID de venta y la fecha de auditoría son automáticos. El QR es opcional.</p>
        </section>

        <section class="section" aria-labelledby="productos-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Entidad relacionada</p>
              <h2 id="productos-heading">Detalle de venta</h2>
            </div>
            <span class="item-count">{{ lineas().length }} productos</span>
          </div>

          <div class="product-fields">
            <div class="field">
              <label for="idProducto">ID del producto <span aria-hidden="true">*</span></label>
              <input id="idProducto" type="number" min="1" step="1" formControlName="idProducto"
                placeholder="ID registrado en Inventario" required />
            </div>
            <div class="field">
              <label for="codigoBarras">Código de barras</label>
              <input id="codigoBarras" formControlName="codigoBarras"
                placeholder="Código para identificar el producto" autocomplete="off" />
            </div>
            <div class="field">
              <label for="descripcion">Descripción del producto</label>
              <input id="descripcion" formControlName="descripcion" placeholder="Referencia visual del producto" />
            </div>
            <div class="field">
              <label for="precioUnitario">Precio unitario <span aria-hidden="true">*</span></label>
              <input id="precioUnitario" type="number" min="0.01" step="0.01"
                formControlName="precioUnitario" required />
            </div>
            <div class="field">
              <label for="cantidad">Cantidad <span aria-hidden="true">*</span></label>
              <input id="cantidad" type="number" min="1" step="1" formControlName="cantidad" required />
            </div>
            <div class="field">
              <label for="descuentoDetalle">Descuento del producto</label>
              <input id="descuentoDetalle" type="number" min="0" step="0.01"
                formControlName="descuentoDetalle" />
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID producto</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio unitario</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col">Descuento</th>
                  <th scope="col">IVA (16%)</th>
                  <th scope="col">Total</th>
                  <th scope="col"><span class="visually-hidden">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                @for (linea of lineas(); track $index) {
                  <tr>
                    <td>{{ linea.id_producto }}</td>
                    <td>{{ linea.descripcion || linea.codigoBarras || 'Producto' }}</td>
                    <td class="numeric">{{ linea.cantidad }}</td>
                    <td class="numeric">{{ formatoMoneda(linea.precio_unitario) }}</td>
                    <td class="numeric">{{ formatoMoneda(subtotalLinea(linea)) }}</td>
                    <td class="numeric">{{ formatoMoneda(linea.descuento) }}</td>
                    <td class="numeric">{{ formatoMoneda(ivaLinea(linea)) }}</td>
                    <td class="numeric">{{ formatoMoneda(totalLinea(linea)) }}</td>
                    <td>
                      <button type="button" class="remove-button"
                        [attr.aria-label]="'Quitar producto ' + linea.id_producto"
                        (click)="quitarProducto($index)">Quitar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td class="empty-row" colspan="9">Aún no hay productos agregados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="section-actions">
            <button type="button" class="button button-primary" (click)="agregarProducto()">Agregar producto</button>
          </div>
        </section>

        <section class="section sale-section" aria-labelledby="resumen-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Importes calculados</p>
              <h2 id="resumen-heading">Resumen de venta</h2>
            </div>
          </div>

          <div class="sale-fields">
            <div class="field">
              <label for="subtotal">Subtotal</label>
              <input id="subtotal" [value]="formatoMoneda(subtotal())" readonly />
            </div>
            <div class="field">
              <label for="iva">IVA (16%)</label>
              <input id="iva" [value]="formatoMoneda(iva())" readonly />
            </div>
            <div class="field">
              <label for="descuentoResumen">Descuento total</label>
              <input id="descuentoResumen" [value]="formatoMoneda(descuentoTotal())" readonly />
            </div>
            <div class="field total-field">
              <label for="totalVenta">Total Venta</label>
              <input id="totalVenta" [value]="formatoMoneda(totalVenta())" readonly />
            </div>
          </div>
        </section>

        @if (mensaje()) {
          <p class="message" role="status">{{ mensaje() }}</p>
        }

        <div class="form-actions">
          <button type="button" class="button button-secondary" (click)="limpiar()">Cancelar</button>
          <button type="submit" class="button button-primary">Guardar</button>
        </div>
      </form>
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
      padding: 56px 0 72px;
    }

    .page-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 28px;
    }

    .header-tools {
      display: grid;
      justify-items: end;
      gap: 10px;
    }

    .header-date {
      width: 270px;
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

    .back-link {
      color: #1d4ed8;
      font-weight: 600;
      text-decoration: none;
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

    form {
      padding: 28px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
    }

    .section + .section {
      margin-top: 32px;
      padding-top: 28px;
      border-top: 1px solid #dbe4f0;
    }

    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    .section-kicker {
      margin: 0 0 5px;
      color: #52637a;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h2 {
      margin: 0;
      color: #123b8a;
      font-size: 21px;
      font-weight: 650;
    }

    .item-count {
      color: #52637a;
      font-size: 14px;
      font-weight: 600;
    }

    .product-fields,
    .sale-fields {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }

    .product-fields {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .sale-fields {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .table-wrap {
      margin-top: 22px;
      overflow-x: auto;
      border: 1px solid #dbe4f0;
      border-radius: 8px;
      background: #ffffff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
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
      white-space: nowrap;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .numeric {
      text-align: right;
      white-space: nowrap;
    }

    .remove-button {
      border: 0;
      padding: 6px;
      color: #a23b2b;
      background: transparent;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .remove-button:hover {
      text-decoration: underline;
    }

    .remove-button:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      clip-path: inset(50%);
    }

    .empty-row {
      padding: 24px;
      color: #52637a;
      text-align: center;
    }

    .section-actions {
      display: flex;
      justify-content: end;
      margin-top: 16px;
    }

    .total-field input {
      color: #1d4ed8;
      background: #eff6ff;
      font-weight: 700;
    }

    .field {
      display: grid;
      align-content: start;
      gap: 7px;
    }

    label {
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
      background: #ffffff;
      font: inherit;
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

    .message {
      margin: 20px 0 0;
      color: #1d4ed8;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #dbe4f0;
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
      cursor: pointer;
    }

    .button-primary {
      color: #fff;
      background: #1d4ed8;
    }

    .button-primary:hover {
      background: #1e40af;
    }

    .button-secondary {
      border-color: #dbe4f0;
      color: #123b8a;
      background: #ffffff;
    }

    @media (max-width: 600px) {
      .page {
        width: min(100% - 28px, 900px);
        padding: 32px 0;
      }

      .page-header {
        align-items: start;
        flex-direction: column;
      }

      .header-tools {
        justify-items: start;
        width: 100%;
      }

      .header-date {
        width: min(100%, 320px);
      }

      h1 {
        font-size: 25px;
      }

      form {
        padding: 18px;
      }

      .product-fields,
      .sale-fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 420px) {
      .product-fields,
      .sale-fields {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `
})
export class VentaFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  readonly mensaje = signal('');
  readonly lineas = signal<DetalleVenta[]>([]);
  readonly form = this.formBuilder.nonNullable.group({
    fechaVenta: [this.fechaHoraActual(), Validators.required],
    idCliente: [0, [Validators.required, Validators.min(1)]],
    codigoBarras: [''],
    descripcion: [''],
    idProducto: [0],
    precioUnitario: [0],
    cantidad: [1],
    descuentoDetalle: [0],
    descuento: [0, [Validators.required, Validators.min(0)]],
    estado: ['completada', Validators.required],
    usuarioAuditoria: ['', Validators.maxLength(50)]
  });
  private readonly descuentoVenta = toSignal(this.form.controls.descuento.valueChanges, {
    initialValue: this.form.controls.descuento.value,
  });
  readonly subtotal = computed(() => this.redondear(this.lineas().reduce(
    (suma, linea) => suma + this.subtotalLinea(linea),
    0,
  )));
  readonly descuentoTotal = computed(() => this.redondear(
    this.lineas().reduce((suma, linea) => suma + linea.descuento, 0) +
      Number(this.descuentoVenta()),
  ));
  readonly iva = computed(() => this.redondear(
    this.lineas().reduce((suma, linea) => suma + this.ivaLinea(linea), 0) -
      Number(this.descuentoVenta()) * 0.16,
  ));
  readonly totalVenta = computed(() => this.redondear(
    this.subtotal() - this.descuentoTotal() + this.iva(),
  ));

  registrar(): void {
    this.mensaje.set('');

    if (this.lineas().length === 0) {
      this.mensaje.set('Agrega al menos un producto antes de guardar la venta.');
      return;
    }

    if (!Number.isSafeInteger(Number(this.form.controls.idCliente.value)) ||
      Number(this.form.controls.idCliente.value) <= 0) {
      this.mensaje.set('Ingresa un ID de cliente entero y válido registrado en Clientes.');
      return;
    }

    if (this.lineas().some(linea => linea.precio_unitario <= 0 || linea.cantidad <= 0)) {
      this.mensaje.set('Completa un precio unitario y una cantidad válidos en cada producto.');
      return;
    }

    if (this.lineas().some(linea => !Number.isInteger(linea.cantidad))) {
      this.mensaje.set('La cantidad de cada producto debe ser un número entero.');
      return;
    }

    if (this.lineas().some(linea => linea.descuento < 0 || linea.descuento > this.subtotalLinea(linea))) {
      this.mensaje.set('El descuento de cada producto debe estar entre cero y su subtotal.');
      return;
    }

    if (Number(this.form.controls.descuento.value) > this.subtotal() -
      this.lineas().reduce((suma, linea) => suma + linea.descuento, 0)) {
      this.mensaje.set('El descuento de la venta no puede superar el subtotal restante.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.mensaje.set('La venta solo se puede guardar desde el navegador.');
      return;
    }

    const valores = this.form.getRawValue();
    const venta: VentaGuardada = {
      id_cliente: Number(valores.idCliente),
      fecha_venta: new Date(valores.fechaVenta).toISOString(),
      subtotal: this.subtotal(),
      iva: this.iva(),
      descuento: this.descuentoTotal(),
      total: this.totalVenta(),
      estado: valores.estado,
      usuario_auditoria: valores.usuarioAuditoria.trim() || null,
      detalle_venta: this.lineas().map(linea => ({
        id_producto: linea.id_producto,
        cantidad: linea.cantidad,
        precio_unitario: linea.precio_unitario,
        descuento: linea.descuento,
      })),
    };

    try {
      const almacenadas: unknown = JSON.parse(localStorage.getItem('ventasGuardadas') ?? '[]');
      const ventas = Array.isArray(almacenadas) ? almacenadas : [];
      localStorage.setItem('ventasGuardadas', JSON.stringify([...ventas, venta]));
      this.mensaje.set('Venta guardada localmente en este navegador.');
    } catch {
      this.mensaje.set('No fue posible guardar la venta en el almacenamiento local del navegador.');
    }
  }

  agregarProducto(): void {
    const valores = this.form.getRawValue();
    if (!Number.isSafeInteger(Number(valores.idProducto)) || Number(valores.idProducto) <= 0) {
      this.mensaje.set('Ingresa un ID de producto válido registrado en Inventario.');
      return;
    }

    if (!Number.isInteger(Number(valores.cantidad)) || Number(valores.cantidad) <= 0) {
      this.mensaje.set('La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    if (Number(valores.precioUnitario) <= 0) {
      this.mensaje.set('Ingresa un precio unitario mayor que cero.');
      return;
    }

    const descuento = Number(valores.descuentoDetalle);
    const subtotal = Number(valores.precioUnitario) * Number(valores.cantidad);
    if (descuento < 0 || descuento > subtotal) {
      this.mensaje.set('El descuento del producto no puede superar su subtotal.');
      return;
    }

    this.lineas.update(lineas => [...lineas, {
      id_producto: Number(valores.idProducto),
      codigoBarras: valores.codigoBarras.trim(),
      descripcion: valores.descripcion.trim(),
      precio_unitario: Number(valores.precioUnitario),
      cantidad: Number(valores.cantidad),
      descuento,
    }]);
    this.form.patchValue({
      idProducto: 0,
      codigoBarras: '',
      descripcion: '',
      precioUnitario: 0,
      cantidad: 1,
      descuentoDetalle: 0,
    });
    this.mensaje.set('Producto agregado a la venta.');
  }

  subtotalLinea(linea: DetalleVenta): number {
    return this.redondear(linea.precio_unitario * linea.cantidad);
  }

  ivaLinea(linea: DetalleVenta): number {
    return this.redondear((this.subtotalLinea(linea) - linea.descuento) * 0.16);
  }

  totalLinea(linea: DetalleVenta): number {
    return this.redondear(this.subtotalLinea(linea) - linea.descuento + this.ivaLinea(linea));
  }

  quitarProducto(indice: number): void {
    this.lineas.update(lineas => lineas.filter((_, posicion) => posicion !== indice));
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
  }

  limpiar(): void {
    this.form.reset({
      fechaVenta: this.fechaHoraActual(),
      idCliente: 0,
      codigoBarras: '',
      descripcion: '',
      idProducto: 0,
      precioUnitario: 0,
      cantidad: 1,
      descuentoDetalle: 0,
      descuento: 0,
      estado: 'completada',
      usuarioAuditoria: ''
    });
    this.lineas.set([]);
    this.mensaje.set('');
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  private fechaHoraActual(): string {
    const fecha = new Date();
    const desfase = fecha.getTimezoneOffset() * 60_000;
    return new Date(fecha.getTime() - desfase).toISOString().slice(0, 16);
  }
}

interface DetalleVenta {
  id_producto: number;
  codigoBarras: string;
  descripcion: string;
  precio_unitario: number;
  cantidad: number;
  descuento: number;
}

interface VentaGuardada {
  id_cliente: number;
  fecha_venta: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  estado: string;
  usuario_auditoria: string | null;
  detalle_venta: Pick<DetalleVenta, 'id_producto' | 'cantidad' | 'precio_unitario' | 'descuento'>[];
}