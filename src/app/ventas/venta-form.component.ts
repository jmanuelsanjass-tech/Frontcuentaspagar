import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { Venta, VentaDetalle, VentaDetalleRequest, VentaRequest } from '../models/venta.model';
import { ProductoBusqueda, ProductoBusquedaService } from '../services/producto-busqueda.service';
import { VentaService } from '../services/venta.service';
import { Banco } from '../models/banco.model';
import { BancoService } from '../services/banco.service';
import { Cliente } from '../models/cliente.model';
import { ClienteService } from '../services/cliente.service';
import { TicketVentaComponent } from './ticket-venta/ticket-venta';

interface LineaVentaEditor extends VentaDetalleRequest {
  nombreProducto: string;
  idProducto: number; // <-- Asegúrate de que esté aquí
}

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink ,TicketVentaComponent ],
  

  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Comercial</p>
          <h1>Ventas</h1>
          <p class="page-description">Registra y administra ventas con sus detalles.</p>
        </div>
        <div class="header-tools">
          <button type="button" class="button button-primary" (click)="nuevaVenta()">Nueva venta (F10)</button>
          <a routerLink="/clientes" class="back-link">Consultar clientes</a>
        </div>
      </header>

      @if (mensaje()) { <p class="message" role="status">{{ mensaje() }}</p> }
      @if (errorAccion()) { <p class="message message-error" role="alert">{{ errorAccion() }}</p> }

      @if (editorAbierto()) {
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          
          <!-- SECCIÓN 1: PRODUCTOS -->
          <section class="section" aria-labelledby="productos-heading">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Detalles enviados al servidor</p>
                <h2 id="productos-heading">Productos de la venta</h2>
              </div>
              <span class="item-count">{{ lineas().length }} productos</span>
            </div>

            <div class="product-fields" [formGroup]="detalleForm">
              <div class="field product-search-field">
                <label for="codigoBarras">Código de barras/Producto <span aria-hidden="true">*</span></label>
                <input id="codigoBarras" [formControl]="busquedaProducto" type="search" role="combobox" autocomplete="off" placeholder="Escribe un código o nombre de producto" (keydown)="manejarTecladoBusqueda($event)" />
                
                @if (sugerenciasAbiertas()) {
                  <ul class="product-suggestions" role="listbox">
                    @for (producto of sugerencias(); track producto.idProducto; let index = $index) {
                      <li role="option" [class.active]="indiceSugerenciaActiva() === index" (click)="seleccionarProducto(producto)">
                        <span class="suggestion-main"><strong>{{ producto.nombre }}</strong><span>{{ producto.codigoBarras }}</span></span>
                        <span class="suggestion-meta"><span>{{ formatoMoneda(producto.precio) }}</span></span>
                      </li>
                    } @empty {
                      @if (busquedaSuficiente() && !cargandoProductos() && !errorBusqueda()) {
                        <li class="no-suggestions" role="option" aria-disabled="true">No se encontraron productos.</li>
                      }
                    }
                  </ul>
                }
              </div>
              <div class="field">
                <label for="cantidad">Cantidad <span aria-hidden="true">*</span></label>
                <input id="cantidad" type="number" min="0.01" step="0.01" formControlName="cantidad" required />
              </div>
              <div class="field">
                <label for="precioUnitario">Precio unitario <span aria-hidden="true">*</span></label>
                <input id="precioUnitario" type="number" min="0" step="0.01" formControlName="precioUnitario" required />
              </div>
            </div>

            <button
              type="button"
              class="button button-primary"
              (click)="agregarProducto()"
              title="F2">
              Agregar producto(F2)

            </button>


            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Importe</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  @for (linea of lineas(); track $index) {
                    <tr>
                      <td>{{ linea.codigoBarras }}</td>
                      <td>{{ linea.nombreProducto }}</td>
                      <td class="numeric">{{ linea.cantidad }}</td>
                      <td class="numeric">{{ formatoMoneda(linea.precioUnitario) }}</td>
                      <td class="numeric">{{ formatoMoneda(importeLinea(linea)) }}</td>
                      <td><button type="button" class="remove-button" (click)="quitarProducto($index)">Quitar</button></td>
                    </tr>
                  } @empty {
                    <tr><td class="empty-row" colspan="6">Aún no hay productos agregados.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- SECCIÓN 2: REGISTRAR VENTA Y PAGO -->
          <section class="section" aria-labelledby="venta-heading">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Entidad principal</p>
                <h2 id="venta-heading">{{ editandoId() === null ? 'Registrar venta' : 'Editar venta #' + editandoId() }}</h2>
              </div>
            </div>

            <div class="sale-fields">
              <div class="field product-search-field">
                <label for="busquedaCliente">Cliente (ID o Nombre) <span aria-hidden="true">*</span></label>
                <input id="busquedaCliente" [formControl]="busquedaCliente" type="search" role="combobox" autocomplete="off" placeholder="Escribe el nombre o ID del cliente" />
                <input type="hidden" formControlName="clienteId" />

                @if (sugerenciasClienteAbiertas()) {
                  <ul class="product-suggestions" role="listbox">
                    @for (cliente of sugerenciasCliente(); track cliente.idCliente) {
                      <li role="option" (click)="seleccionarCliente(cliente)">
                        <span class="suggestion-main">
                          <strong>{{ cliente.nombre }}</strong>
                          <span>ID: {{ cliente.idCliente }}</span>
                        </span>
                      </li>
                    } @empty {
                      <li class="no-suggestions" role="option" aria-disabled="true">No se encontraron clientes.</li>
                    }
                  </ul>
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
                <input id="descuento" type="number" min="0" step="0.01" formControlName="descuento" />
              </div>
              <div class="field">
                <label for="iva">IVA <span aria-hidden="true">*</span></label>
                <input id="iva" type="number" min="0" step="0.01" formControlName="iva" readonly  />
              </div>
            </div>

            <div class="section-heading" style="margin-top: 20px;">
              <div><h3 style="margin: 0; font-size: 18px; color: #123b8a;">Información de Pago</h3></div>
            </div>

            <div class="sale-fields">
              <div class="field">
                <label for="tipoMoneda">Método de Pago <span aria-hidden="true">*</span></label>
                <select id="tipoMoneda" formControlName="tipoMoneda" required>
                  <option value="Pesos">Efectivo (Pesos)</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta Debito">Tarjeta de Débito</option>
                  <option value="Tarjeta Credito">Tarjeta de Crédito</option>
                </select>
              </div>
              @if (!esEfectivo()) {
                <div class="field">
                  <label for="bancoCorto">Banco <span aria-hidden="true">*</span></label>
                  <select id="bancoCorto" formControlName="bancoCorto" required>
                    <option value="" disabled>Selecciona un banco</option>
                    @for (banco of bancos(); track banco.id) {
                      <option [value]="banco.nombreCorto">{{ banco.nombreCorto }}</option>
                    }
                  </select>
                </div>
              }

              <div class="field">
                <label for="subtotal">Sub Total</label>
                <input
                  id="subtotal"
                  [value]="subtotal()"
                  readonly />
              </div>
                          
              <div class="field">
                <label for="montoRecibido">Monto Recibido <span aria-hidden="true">*</span></label>
                <input id="montoRecibido" type="number" min="0" step="0.01" formControlName="montoRecibido" required />
              </div>
    <!--  
              <div class="field">
                <label for="montoSobrante">Monto Sobrante (Cambio)</label>
                <input id="montoSobrante" [value]="formatoMoneda(montoSobrante())" readonly />
              </div>
            -->
            </div>
          
          </section>
          <!--    
          <section class="section sale-section" aria-labelledby="resumen-heading">
            <div class="section-heading"><div><p class="section-kicker">Estimación</p><h2 id="resumen-heading">Resumen de venta</h2></div></div>
            <div class="sale-fields">
              <div class="field"><label for="subtotal">Subtotal estimado</label><input id="subtotal" [value]="formatoMoneda(subtotal())" readonly /></div>
              <div class="field"><label for="totalVenta">Total a pagar</label><input id="totalVenta" [value]="formatoMoneda(totalVenta())" readonly style="font-weight: bold; color: #1d4ed8;" /></div>
            </div>
          </section>
            -->
          @if (errorFormulario()) { <p class="message message-error" role="alert">{{ errorFormulario() }}</p> }

<div class="form-actions">

  <button
    type="button"
    class="button button-secondary"
    [disabled]="guardando()"
    (click)="cancelarEdicion()">
    Cancelar
  </button>

  <button
    type="button"
    class="button button-primary"
    [disabled]="guardando()"
    (click)="abrirConfirmacion()">

    {{ guardando()
      ? 'Guardando...'
      : editandoId() === null
          ? 'Pagar (F4)'
          : 'Guardar cambios' }}

  </button>

</div>

        </form>
  }

@if (mostrarConfirmacion()) {

<div class="modal-overlay">

  <div class="modal-confirmacion">

    <div class="modal-header">

      <h2>Confirmar Venta</h2>

      <button
        type="button"
        class="btn-cerrar"
        (click)="cerrarConfirmacion()">

        ×

      </button>

    </div>

    <div class="modal-body">

      <div class="resumen-totales">

        <div class="card-total">
          <span>Subtotal</span>
          <strong>{{ formatoMoneda(subtotal()) }}</strong>
        </div>

        <div class="card-total">
          <span>IVA</span>
          <strong>{{ formatoMoneda(form.controls.iva.value) }}</strong>
        </div>

        <div class="card-total">
          <span>Monto Recibido</span>
          <strong>
            {{ formatoMoneda(form.controls.montoRecibido.value) }}
          </strong>
        </div>

        <div class="card-total total-final">
          <span>Total a Pagar</span>
          <strong>{{ formatoMoneda(totalVenta()) }}</strong>
        </div>

      </div>

      <div class="detalle-pago">

        <div>
          <label>Método de Pago</label>
          <p>{{ form.controls.tipoMoneda.value }}</p>
        </div>

        <div>
          <label>Banco</label>
          <p>{{ form.controls.bancoCorto.value || 'N/A' }}</p>
        </div>

        <div>
          <label>Cambio</label>
          <p>{{ formatoMoneda(montoSobrante()) }}</p>
        </div>

      </div>

      <div class="table-wrap">

        <table>

          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Importe</th>
            </tr>
          </thead>

          <tbody>

            @for (linea of lineas(); track $index) {

              <tr>

                <td>{{ linea.nombreProducto }}</td>

                <td>{{ linea.cantidad }}</td>

                <td>
                  {{ formatoMoneda(linea.precioUnitario) }}
                </td>

                <td>
                  {{ formatoMoneda(importeLinea(linea)) }}
                </td>

              </tr>

            }

          </tbody>

        </table>

      </div>

    </div>

    <div class="modal-footer">

      <button
        type="button"
        class="button button-secondary"
        (click)="cerrarConfirmacion()">

        Cancelar

      </button>

      <button
        type="button"
        class="button button-primary"
        (click)="confirmarVenta()">

        Confirmar Venta (F6)

      </button>

    </div>

  </div>

</div>

}



      <!-- COMPONENTE DEL TICKET AL FINAL -->
      <app-ticket-venta 
        [venta]="ventaParaTicket()" 
        [visible]="mostrarTicket()" 
        (cerrar)="mostrarTicket.set(false)">
      </app-ticket-venta>



</main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; color: #172b4d; background: #f4f7fb; font-family: "Segoe UI", sans-serif; }
    .page { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 48px 0 72px; }
    .page-header, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .page-header { align-items: start; margin-bottom: 24px; }
    .header-tools { display: grid; justify-items: end; gap: 12px; }
    .eyebrow, .section-kicker { margin: 0 0 6px; color: #1d4ed8; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(28px, 4vw, 36px); font-weight: 650; }
    h2 { margin: 0; color: #123b8a; font-size: 21px; font-weight: 650; }
    .page-description, .field-hint { color: #52637a; font-size: 14px; }
    .page-description { margin: 10px 0 0; }
    .field-hint { margin: 14px 0 0; }
    .back-link { color: #1d4ed8; font-weight: 600; text-decoration: none; }
    form, .sales-list { margin-bottom: 24px; padding: 26px; border: 1px solid #dbe4f0; border-radius: 14px; background: #fff; box-shadow: 0 10px 30px rgb(30 64 175 / 6%); }
    .section + .section { margin-top: 30px; padding-top: 26px; border-top: 1px solid #dbe4f0; }
    .section-heading { margin-bottom: 18px; }
    .section-kicker { color: #52637a; }
    .item-count { color: #52637a; font-size: 14px; font-weight: 600; }
    .sale-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .product-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .field { display: grid; align-content: start; gap: 7px; }
    label { font-size: 14px; font-weight: 650; }
    input, select { box-sizing: border-box; width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid #c5d0df; border-radius: 6px; color: #172b4d; background: #fff; font: inherit; }
    input[readonly] { background: #f7f9fc; font-weight: bold; }
    input:focus-visible, select:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
    .table-wrap { margin-top: 18px; overflow-x: auto; border: 1px solid #dbe4f0; border-radius: 8px; background: #fff; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #dbe4f0; font-size: 14px; }
    th { color: #123b8a; background: #eaf1ff; font-weight: 650; }
    .numeric { text-align: right; }
    .section-actions { display: flex; justify-content: end; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 16px; border: 1px solid transparent; border-radius: 7px; font: inherit; font-weight: 600; cursor: pointer; }
    .button-primary { color: #fff; background: #1d4ed8; }
    .button-secondary { border-color: #dbe4f0; color: #123b8a; background: #fff; }
    .form-actions { display: flex; justify-content: end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #dbe4f0; }
    .message { margin: 16px 0; color: #1d4ed8; }
    .message-error { color: #a23b2b; }
    .product-suggestions { display: grid; max-height: 200px; overflow-y: auto; margin: 0; padding: 4px; border: 1px solid #c5d0df; border-radius: 6px; background: #fff; box-shadow: 0 8px 18px rgb(23 43 77 / 12%); list-style: none; position: absolute; z-index: 10; width: 100%; box-sizing: border-box; }
    .product-suggestions li { padding: 10px 12px; border-radius: 4px; cursor: pointer; border-bottom: 1px solid #eee; }
    .product-suggestions li:hover, .product-suggestions li.active { background: #eaf1ff; }
    .suggestion-main { display: flex; flex-direction: column; gap: 4px; }
    .suggestion-main span { color: #52637a; font-size: 12px; }
    .suggestion-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-weight: bold; color: #123b8a; }
    .product-search-field { position: relative; }
    .no-suggestions { color: #52637a; cursor: default; text-align: center; }
    @media (max-width: 720px) { .sale-fields, .product-fields { grid-template-columns: 1fr; } }
    .modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:99999;
}

.modal-confirmacion{
  width:min(950px,95vw);
  max-height:90vh;
  overflow:auto;
  background:#fff;
  border-radius:16px;
  box-shadow:0 20px 60px rgba(0,0,0,.25);
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:20px;
  border-bottom:1px solid #dbe4f0;
}

.modal-body{
  padding:24px;
}

.modal-footer{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  padding:20px;
  border-top:1px solid #dbe4f0;
}

.btn-cerrar{
  border:none;
  background:none;
  font-size:28px;
  cursor:pointer;
}

.resumen-totales{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:16px;
  margin-bottom:24px;
}

.card-total{
  padding:14px;
  border:1px solid #dbe4f0;
  border-radius:10px;
  background:#f8fafc;
}

.card-total span{
  display:block;
  color:#64748b;
  font-size:12px;
  margin-bottom:8px;
}

.card-total strong{
  font-size:20px;
}

.total-final{
  background:#eaf1ff;
}

.total-final strong{
  color:#1d4ed8;
  font-size:28px;
}

.detalle-pago{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
  margin-bottom:20px;
}

.detalle-pago div{
  border:1px solid #dbe4f0;
  border-radius:10px;
  padding:12px;
}

.detalle-pago p{
  margin-top:8px;
  font-weight:bold;
}

@media(max-width:768px){

  .resumen-totales,
  .detalle-pago{
    grid-template-columns:1fr;
  }

}
  `,


})
export class VentaFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ventaService = inject(VentaService);
  private readonly productoBusquedaService = inject(ProductoBusquedaService);
  private readonly bancoService = inject(BancoService);
  private readonly clienteService = inject(ClienteService);


  readonly mostrarConfirmacion = signal(false);


  readonly ventas = signal<Venta[]>([]);
  readonly bancos = signal<Banco[]>([]);
  readonly lineas = signal<LineaVentaEditor[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly editorAbierto = signal(true);
  readonly editandoId = signal<number | null>(null);
  readonly mensaje = signal('');
  readonly errorFormulario = signal('');
  readonly errorAccion = signal('');

  // --- Búsqueda de Productos ---
  readonly busquedaProducto = new FormControl('', { nonNullable: true });
  readonly sugerencias = signal<ProductoBusqueda[]>([]);
  readonly productoSeleccionado = signal<ProductoBusqueda | null>(null);
  readonly sugerenciasAbiertas = signal(false);
  readonly indiceSugerenciaActiva = signal(-1);
  readonly cargandoProductos = signal(false);
  readonly errorBusqueda = signal('');
  readonly busquedaSuficiente = signal(false);

  // --- Búsqueda Predictiva de Clientes ---
  readonly busquedaCliente = new FormControl('', { nonNullable: true });
  readonly sugerenciasCliente = signal<Cliente[]>([]);
  readonly sugerenciasClienteAbiertas = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    estado: ['completada', [Validators.required]],
    descuento: [0, [Validators.required, Validators.min(0)]],
    iva: [0, [Validators.required, Validators.min(0)]],
    tipoMoneda: ['Pesos', [Validators.required]],
    bancoCorto: [''],
    montoRecibido: [0, [Validators.required, Validators.min(0)]],
  });

  readonly detalleForm = this.formBuilder.nonNullable.group({
    codigoBarras: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(0.01)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
  });

  private readonly descuentoVenta = toSignal(this.form.controls.descuento.valueChanges, { initialValue: 0 });
  private readonly ivaVenta = toSignal(this.form.controls.iva.valueChanges, { initialValue: 0 });
  private readonly tipoMonedaSignal = toSignal(this.form.controls.tipoMoneda.valueChanges, { initialValue: 'Pesos' });
  private readonly montoRecibidoSignal = toSignal(this.form.controls.montoRecibido.valueChanges, { initialValue: 0 });

readonly subtotal = computed(() =>
  this.redondear(
    this.lineas().reduce(
      (suma, linea) => suma + this.importeLinea(linea),
      0
    )
  )
);

readonly ivaCalculado = computed(() =>
  this.redondear(this.subtotal() * 0.16)
);

readonly totalVenta = computed(() =>
  this.redondear(
    this.subtotal()
    - Number(this.descuentoVenta())
    + this.ivaCalculado()
  )
);

  readonly esEfectivo = computed(() => this.tipoMonedaSignal() === 'Pesos');
  
/*   readonly montoSobrante = computed(() => {
    if (!this.esEfectivo()) return 0;
    const recibido = Number(this.montoRecibidoSignal());
    return Math.max(0, this.redondear(recibido - this.totalVenta()));
  }); */

protected readonly ventaParaTicket = signal<Venta | null>(null);
protected readonly mostrarTicket = signal(false);

  readonly montoSobrante = computed(() => {
  if (!this.esEfectivo()) return 0;

  const recibido = Number(this.montoRecibidoSignal() || 0);
  const total = Number(this.totalVenta() || 0);

  const cambio = recibido - total;

  return cambio <= 0
    ? 0
    : this.redondear(cambio);
});

constructor() {

  // Sincroniza IVA automáticamente al 16%
  effect(() => {
    const subtotal = this.subtotal();
    const ivaCalculado = this.redondear(subtotal * 0.16);

    this.form.controls.iva.setValue(
      ivaCalculado,
      { emitEvent: false }
    );
  });

  effect(() => {

    const total = this.totalVenta();
    const tipo = this.tipoMonedaSignal();
    const bancoControl = this.form.controls.bancoCorto;

    if (tipo !== 'Pesos') {

      this.form.controls.montoRecibido.setValue(
        total,
        { emitEvent: false }
      );

      bancoControl.setValidators([Validators.required]);

      if (!bancoControl.value && this.bancos().length > 0) {
        bancoControl.setValue(
          this.bancos()[0].nombreCorto,
          { emitEvent: false }
        );
      }

    } else {

      // En efectivo nunca permitir un monto menor al total
      const recibido = Number(
        this.form.controls.montoRecibido.value || 0
      );

      if (recibido < total) {
        this.form.controls.montoRecibido.setValue(
          total,
          { emitEvent: false }
        );
      }

      bancoControl.setValue('', { emitEvent: false });
      bancoControl.clearValidators();
    }

    bancoControl.updateValueAndValidity({
      emitEvent: false
    });

  });

}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarBancos();
    this.configurarBusquedaProducto();
    this.configurarBusquedaCliente();

    window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'F2') {
      event.preventDefault();
      this.agregarProducto();
    }

    if (event.key === 'F4') {
      event.preventDefault();
      this.abrirConfirmacion();
    }

    if (event.key === 'F6') {
          event.preventDefault();
          this.confirmarVenta();
    }

        if (event.key === 'F10') {
          event.preventDefault();
          this.nuevaVenta();
        }


    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelarEdicion();
    }
});

  }

  // --- LÓGICA RESTAURADA DE PRODUCTOS ---
  private configurarBusquedaProducto(): void {
    this.busquedaProducto.valueChanges.pipe(
       tap((termino) => console.log('1. El input de producto cambió a:', termino)), 
      map((termino) => termino.trim()),
      tap((termino) => {
        this.sugerencias.set([]);
        this.indiceSugerenciaActiva.set(-1);
        this.errorBusqueda.set('');
        this.busquedaSuficiente.set(termino.length >= 2);
        this.sugerenciasAbiertas.set(termino.length >= 2);
        this.cargandoProductos.set(termino.length >= 2);
        if (this.busquedaProducto.dirty) {
          this.productoSeleccionado.set(null);
          this.detalleForm.controls.codigoBarras.setValue('', { emitEvent: false });
          this.detalleForm.controls.precioUnitario.setValue(0, { emitEvent: false });
        }
      }),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((termino) => {
        if (termino.length < 2) return of([]);
        return this.productoBusquedaService.buscar(termino).pipe(
          catchError((error: unknown) => {
            this.errorBusqueda.set(
              error instanceof HttpErrorResponse && error.status === 404
                ? 'La búsqueda predictiva no está disponible.'
                : 'No fue posible buscar productos.'
            );
            this.sugerenciasAbiertas.set(false);
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((productos) => {
      this.sugerencias.set(productos);
      this.cargandoProductos.set(false);
      this.sugerenciasAbiertas.set(
        this.busquedaProducto.value.trim().length >= 2 && !this.errorBusqueda()
      );
    });
  }

  seleccionarProducto(producto: ProductoBusqueda): void {
    this.productoSeleccionado.set(producto);
    this.detalleForm.patchValue({
      codigoBarras: producto.codigoBarras,
      precioUnitario: Number(producto.precio),
    });
    this.busquedaProducto.setValue(producto.codigoBarras, { emitEvent: false });
    this.sugerencias.set([]);
    this.busquedaSuficiente.set(false);
    this.sugerenciasAbiertas.set(false);
    this.indiceSugerenciaActiva.set(-1);
    this.errorBusqueda.set('');
  }

  manejarTecladoBusqueda(event: KeyboardEvent): void {
    const count = this.sugerencias().length;
    if (event.key === 'Escape') {
      this.sugerenciasAbiertas.set(false);
      this.indiceSugerenciaActiva.set(-1);
      return;
    }
    if (count === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.sugerenciasAbiertas.set(true);
      this.indiceSugerenciaActiva.update((index) => Math.min(index + 1, count - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.indiceSugerenciaActiva.update((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && this.sugerenciasAbiertas()) {
      const activeProduct = this.sugerencias()[this.indiceSugerenciaActiva()];
      if (activeProduct) {
        event.preventDefault();
        this.seleccionarProducto(activeProduct);
      }
    }
  }
  // -------------------------------------

  cargarBancos(): void {
    this.bancoService.listar().subscribe({
      next: (data) => this.bancos.set(data),
      error: (err) => console.error('Error al cargar bancos', err)
    });
  }

  private configurarBusquedaCliente(): void {
    this.busquedaCliente.valueChanges.pipe(
      map((termino) => termino.trim()),
      tap((termino) => {
        this.sugerenciasClienteAbiertas.set(termino.length >= 1);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((termino) => {
        if (termino.length < 1) return of([]);
        return this.clienteService.buscar(termino).pipe(
          catchError(() => of([]))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((clientes) => {
      this.sugerenciasCliente.set(clientes);
    });
  }

  seleccionarCliente(cliente: Cliente): void {
    this.form.controls.clienteId.setValue(cliente.idCliente);
    this.busquedaCliente.setValue(cliente.nombre, { emitEvent: false });
    this.sugerenciasClienteAbiertas.set(false);
    this.sugerenciasCliente.set([]);
  }

abrirConfirmacion(): void {

  this.errorFormulario.set('');

  if (this.lineas().length === 0) {
    this.errorFormulario.set('Agrega al menos un producto.');
    return;
  }

  if (this.form.controls.clienteId.value === 0) {
    this.errorFormulario.set('Debes buscar y seleccionar un cliente.');
    return;
  }

  if (this.esEfectivo() &&
      this.form.controls.montoRecibido.value < this.totalVenta()) {
    this.errorFormulario.set(
      'El monto recibido no puede ser menor al total de la venta.'
    );
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.errorFormulario.set(
      'Revisa los campos marcados en rojo.'
    );
    return;
  }

  this.mostrarConfirmacion.set(true);
}

cerrarConfirmacion(): void {
  this.mostrarConfirmacion.set(false);
}

confirmarVenta(): void {
  this.mostrarConfirmacion.set(false);
  this.guardar();
}


  guardar(): void {
    this.errorFormulario.set('');
    if (this.lineas().length === 0) {
      this.errorFormulario.set('Agrega al menos un producto.');
      return;
    }
    if (this.form.controls.clienteId.value === 0) {
      this.errorFormulario.set('Debes buscar y seleccionar un cliente.');
      return;
    }
    if (this.esEfectivo() && this.form.controls.montoRecibido.value < this.totalVenta()) {
      this.errorFormulario.set('El monto recibido no puede ser menor al total de la venta.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorFormulario.set('Revisa los campos marcados en rojo.');
      return;
    }
const request: VentaRequest = {
  clienteId: this.form.controls.clienteId.value,
  descuento: Number(this.form.controls.descuento.value),
  iva: Number(this.form.controls.iva.value),
  estado: this.form.controls.estado.value,
  tipoMoneda: this.form.controls.tipoMoneda.value,
  bancoCorto: this.form.controls.bancoCorto.value || null,
  montoRecibido: Number(this.form.controls.montoRecibido.value),
  // montoSobrante: this.montoSobrante(),
   montoSobrante: Number(this.montoSobrante()) || 0,

  detalles: this.lineas().map((linea) => ({
    idProducto: linea.idProducto,
    codigoBarras: linea.codigoBarras,
    cantidad: linea.cantidad,
    precioUnitario: linea.precioUnitario,
    descuento: 0
  })),
};

    this.guardando.set(true);

/*     this.ventaService.crear(request).subscribe({
      next: (venta) => {
        this.ventas.update((v) => [...v, venta]);
        this.mensaje.set('Venta registrada correctamente.');
        this.guardando.set(false);
        this.resetEditor();
      },
      error: (err: HttpErrorResponse) => {
        this.errorFormulario.set('Error al guardar la venta: ' + err.message);
        this.guardando.set(false);
      }
    }); */

    this.ventaService.crear(request).subscribe({
      next: (venta) => {
        this.ventas.update((v) => [...v, venta]);
        this.mensaje.set('Venta registrada correctamente.');
        this.guardando.set(false);
        
        // ¡AQUÍ ABRIMOS EL TICKET AUTOMÁTICAMENTE!
        this.verTicket(venta); 
        
        this.resetEditor();
      },
      error: (err: HttpErrorResponse) => {
        console.log('STATUS:', err.status);
    console.log('STATUS TEXT:', err.statusText);
    console.log('ERROR:', err.error);
    console.log('FULL ERROR:', err);

    this.errorFormulario.set(
      err.error?.message ??
      err.error?.error ??
      'Error desconocido'
    );

    this.guardando.set(false);
  }
});


  }

  agregarProducto(): void {
    const codigoBarras = this.detalleForm.controls.codigoBarras;
    const cantidad = this.detalleForm.controls.cantidad;
    const precioUnitario = this.detalleForm.controls.precioUnitario;
    const producto = this.productoSeleccionado();
    
    if (codigoBarras.invalid || cantidad.invalid || precioUnitario.invalid || !producto) return;

     this.lineas.update((l) => [
    ...l,
    {
      idProducto: producto.idProducto,
      codigoBarras: codigoBarras.value.trim(),
      nombreProducto: producto.nombre,
      cantidad: Number(cantidad.value),
      precioUnitario: Number(precioUnitario.value)
    }
  ]);
    this.detalleForm.reset({ codigoBarras: '', cantidad: 1, precioUnitario: 0 });
    this.productoSeleccionado.set(null);
    this.busquedaProducto.setValue('');
  }

  quitarProducto(i: number) { this.lineas.update((l) => l.filter((_, idx) => idx !== i)); }
  importeLinea(l: LineaVentaEditor): number { return this.redondear(l.cantidad * l.precioUnitario); }
  formatoMoneda(v: number): string { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v); }
  private redondear(v: number): number { return Math.round((v + Number.EPSILON) * 100) / 100; }

  nuevaVenta() { this.resetEditor(); this.editorAbierto.set(true); }
  cancelarEdicion() { this.resetEditor(); }
  
  private resetEditor() {
    this.editandoId.set(null);
    this.form.reset({ clienteId: 0, estado: 'completada', descuento: 0, iva: 0, tipoMoneda: 'Pesos', bancoCorto: '', montoRecibido: 0 });
    this.busquedaCliente.setValue('');
    this.sugerenciasCliente.set([]);
    this.lineas.set([]);
    this.editorAbierto.set(false);
  }

  cargarVentas() { 
    this.ventaService.listar().subscribe(v => { this.ventas.set(v); this.cargando.set(false); });
  }
  
  editar(v: Venta) { /* Tu lógica original de edición */ }
  solicitarEliminacion(v: Venta) { /* Tu lógica original de eliminación */ }

    verTicket(venta: Venta): void {
    this.ventaParaTicket.set(venta);
    this.mostrarTicket.set(true);
  }


}