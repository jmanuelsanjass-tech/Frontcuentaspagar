import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
        </div>
        <a routerLink="/proveedores" class="back-link">Volver a proveedores</a>
      </header>

      <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
        <section class="section" aria-labelledby="productos-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Detalle</p>
              <h2 id="productos-heading">Identifica Productos</h2>
            </div>
            <span class="item-count">{{ lineas().length }} productos</span>
          </div>

          <div class="product-fields">
            <div class="field">
              <label for="codigoBarras">Búsqueda por código de barras</label>
              <input id="codigoBarras" formControlName="codigoBarras"
                placeholder="Escanea o escribe el código" autocomplete="off" />
            </div>
            <div class="field">
              <label for="descripcion">Búsqueda por descripción</label>
              <input id="descripcion" formControlName="descripcion" placeholder="Descripción del producto" />
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Código Barras</th>
                  <th scope="col">Descripción Productos</th>
                  <th scope="col">Precio Unitario</th>
                  <th scope="col">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                @for (linea of lineas(); track $index) {
                  <tr>
                    <td>{{ linea.codigoBarras }}</td>
                    <td>{{ linea.descripcion }}</td>
                    <td class="numeric">
                      <input class="table-input" type="number" min="0.01" step="0.01"
                        [value]="linea.precioUnitario || ''"
                        [attr.aria-label]="'Precio unitario de ' + linea.descripcion"
                        (input)="actualizarLinea($index, 'precioUnitario', $event)" />
                    </td>
                    <td class="numeric">
                      <input class="table-input" type="number" min="0.01" step="any"
                        [value]="linea.cantidad"
                        [attr.aria-label]="'Cantidad de ' + linea.descripcion"
                        (input)="actualizarLinea($index, 'cantidad', $event)" />
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td class="empty-row" colspan="4">Aún no hay productos agregados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="section-actions">
            <button type="button" class="button button-primary" (click)="agregarProducto()">Agregar</button>
          </div>
        </section>

        <section class="section sale-section" aria-labelledby="venta-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Cobro</p>
              <h2 id="venta-heading">Venta</h2>
            </div>
          </div>

          <div class="sale-fields">
            <div class="field">
              <label for="subtotal">Subtotal</label>
              <input id="subtotal" [value]="subtotal().toFixed(2)" readonly />
            </div>
            <div class="field">
              <label for="iva">IVA (16%)</label>
              <input id="iva" [value]="iva().toFixed(2)" readonly />
            </div>
            <div class="field">
              <label for="descuento">Descuento</label>
              <input id="descuento" type="number" formControlName="descuento" min="0" step="0.01" />
            </div>
            <div class="field total-field">
              <label for="totalVenta">Total Venta</label>
              <input id="totalVenta" [value]="totalVenta().toFixed(2)" readonly />
            </div>
            <div class="field">
              <label for="estatus">Estatus <span aria-hidden="true">*</span></label>
              <select id="estatus" formControlName="estatus" required>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Anulada">Anulada</option>
              </select>
            </div>
            <div class="field">
              <label for="formaPago">Forma de pago <span aria-hidden="true">*</span></label>
              <select id="formaPago" formControlName="formaPago" required>
                <option value="" disabled>Selecciona una forma de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Crédito">Crédito</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="field">
              <label for="fechaVenta">Fecha de venta <span aria-hidden="true">*</span></label>
              <input id="fechaVenta" type="date" formControlName="fechaVenta" required />
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
      color: #202a24;
      background: #f5f7f4;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(900px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0;
    }

    .page-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 28px;
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

    .back-link {
      color: #286744;
      font-weight: 600;
      text-decoration: none;
    }

    form {
      padding: 24px;
      border: 1px solid #d9e0da;
      border-radius: 4px;
      background: #fff;
    }

    .section + .section {
      margin-top: 32px;
      padding-top: 28px;
      border-top: 1px solid #e2e8e3;
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
      color: #64736a;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h2 {
      margin: 0;
      color: #202a24;
      font-size: 21px;
      font-weight: 650;
    }

    .item-count {
      color: #526158;
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
      grid-template-columns: repeat(2, minmax(0, 360px));
      justify-content: center;
    }

    .sale-fields {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .table-wrap {
      margin-top: 22px;
      overflow-x: auto;
      border: 1px solid #d9e0da;
      border-radius: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th,
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #e6ebe6;
      font-size: 14px;
    }

    .table-input {
      width: 112px;
      min-height: 36px;
      padding: 6px 8px;
    }

    th {
      color: #34443a;
      background: #f5f7f4;
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

    .empty-row {
      padding: 24px;
      color: #64736a;
      text-align: center;
    }

    .section-actions {
      display: flex;
      justify-content: end;
      margin-top: 16px;
    }

    .total-field input {
      color: #1d5235;
      background: #edf4ee;
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
      border: 1px solid #aebbb1;
      border-radius: 3px;
      color: #202a24;
      background: #fff;
      font: inherit;
    }

    input:focus-visible,
    select:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid #d18b2c;
      outline-offset: 2px;
    }

    input[aria-invalid="true"],
    select[aria-invalid="true"] {
      border-color: #a33d35;
    }

    .field-error {
      margin: 0;
      color: #a33d35;
      font-size: 13px;
    }

    .message {
      margin: 20px 0 0;
      color: #286744;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e6ebe6;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid transparent;
      border-radius: 4px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .button-primary {
      color: #fff;
      background: #286744;
    }

    .button-primary:hover {
      background: #1d5235;
    }

    .button-secondary {
      border-color: #aebbb1;
      color: #34443a;
      background: #fff;
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
  readonly subtotal = computed(() => this.lineas().reduce(
    (suma, linea) => suma + linea.precioUnitario * linea.cantidad,
    0
  ));
  readonly iva = computed(() => this.subtotal() * 0.16);
  readonly totalVenta = computed(() => Math.max(
    0,
    this.subtotal() + this.iva() - this.form.controls.descuento.value
  ));
  readonly form = this.formBuilder.nonNullable.group({
    fechaVenta: [this.fechaActual(), Validators.required],
    codigoBarras: [''],
    descripcion: [''],
    descuento: [0, [Validators.required, Validators.min(0)]],
    estatus: ['Pendiente', Validators.required],
    formaPago: ['', Validators.required]
  });

  registrar(): void {
    this.mensaje.set('');

    if (this.lineas().length === 0) {
      this.mensaje.set('Agrega al menos un producto antes de guardar la venta.');
      return;
    }

    if (this.lineas().some(linea => linea.precioUnitario <= 0 || linea.cantidad <= 0)) {
      this.mensaje.set('Completa un precio unitario y una cantidad válidos en cada producto.');
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
      fechaVenta: valores.fechaVenta,
      productos: this.lineas(),
      subtotal: this.subtotal(),
      iva: this.iva(),
      descuento: valores.descuento,
      total: this.totalVenta(),
      estatus: valores.estatus,
      formaPago: valores.formaPago,
      guardadaEn: new Date().toISOString()
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
    const { codigoBarras, descripcion } = this.form.getRawValue();
    if (!codigoBarras.trim() || !descripcion.trim()) {
      this.mensaje.set('Completa el código de barras y la descripción del producto.');
      return;
    }

    this.lineas.update(lineas => [...lineas, {
      codigoBarras: codigoBarras.trim(),
      descripcion: descripcion.trim(),
      precioUnitario: 0,
      cantidad: 1
    }]);
    this.form.patchValue({ codigoBarras: '', descripcion: '' });
    this.mensaje.set('Producto agregado a la venta.');
  }

  actualizarLinea(indice: number, campo: 'precioUnitario' | 'cantidad', evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    if (!Number.isFinite(valor) || valor < 0) {
      return;
    }

    this.lineas.update(lineas => lineas.map((linea, posicion) =>
      posicion === indice ? { ...linea, [campo]: valor } : linea
    ));
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
  }

  limpiar(): void {
    this.form.reset({
      fechaVenta: this.fechaActual(),
      codigoBarras: '',
      descripcion: '',
      descuento: 0,
      estatus: 'Pendiente',
      formaPago: ''
    });
    this.lineas.set([]);
    this.mensaje.set('');
  }

  private fechaActual(): string {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}

interface DetalleVenta {
  codigoBarras: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
}

interface VentaGuardada {
  fechaVenta: string;
  productos: DetalleVenta[];
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  estatus: string;
  formaPago: string;
  guardadaEn: string;
}