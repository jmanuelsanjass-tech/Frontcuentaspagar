import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CuentaPorCobrar,
  CuentaPorCobrarHistoria,
  CuentaPorCobrarHistoriaRequest,
  CuentaPorCobrarRequest,
  TipoMovimientoHistoria,
} from '../models/cuenta-por-cobrar.model';
import { CuentaPorCobrarHistoriaService } from '../services/cuenta-por-cobrar-historia.service';
import { CuentaPorCobrarService } from '../services/cuenta-por-cobrar.service';
import { RouterLink } from '@angular/router';

type Seccion = 'cuentas' | 'historia';
type Editor = Seccion | null;
type Eliminable = { seccion: Seccion; id: number } | null;

@Component({
  selector: 'app-cuentas-por-cobrar',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Finanzas</p>
          <h1>Cuentas por Cobrar</h1>
          <p class="description">Administra saldos pendientes y los movimientos asociados.</p>
        </div>
        <a routerLink="/" class="back-link">Volver al menú</a>
      </header>

      <nav class="tabs" aria-label="Secciones de cuentas por cobrar">
        <button type="button" [class.active]="seccion() === 'cuentas'"
          [attr.aria-pressed]="seccion() === 'cuentas'"
          (click)="cambiarSeccion('cuentas')">Cuentas por cobrar</button>
        <button type="button" [class.active]="seccion() === 'historia'"
          [attr.aria-pressed]="seccion() === 'historia'"
          (click)="cambiarSeccion('historia')">Historia de movimientos</button>
      </nav>

      @if (mensaje()) {
        <p class="message" role="status">{{ mensaje() }}</p>
      }
      @if (errorAccion()) {
        <p class="message error" role="alert">{{ errorAccion() }}</p>
      }

      @if (seccion() === 'cuentas') {
        <section class="panel" aria-labelledby="cuentas-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Cuentas</p>
              <h2 id="cuentas-heading">Cuentas por cobrar registradas</h2>
            </div>
            <button type="button" class="button primary" (click)="nuevaCuenta()">Nueva cuenta</button>
          </div>

          @if (editor() === 'cuentas') {
            <form [formGroup]="cuentaForm" (ngSubmit)="guardarCuenta()" novalidate>
              <h3>{{ editandoId() === null ? 'Crear cuenta por cobrar' : 'Editar cuenta #' + editandoId() }}</h3>
              <div class="form-grid">
                <div class="field">
                  <label for="clienteId">ID del cliente <span aria-hidden="true">*</span></label>
                  <input id="clienteId" type="number" min="1" step="1" formControlName="clienteId" required
                    [attr.aria-invalid]="cuentaForm.controls.clienteId.invalid && cuentaForm.controls.clienteId.touched"
                    aria-describedby="clienteId-error" />
                  @if (cuentaForm.controls.clienteId.invalid && cuentaForm.controls.clienteId.touched) {
                    <p class="field-error" id="clienteId-error">Ingresa un ID de cliente válido.</p>
                  }
                </div>
                <div class="field">
                  <label for="ventaId">ID de la venta <span aria-hidden="true">*</span></label>
                  <input id="ventaId" type="number" min="1" step="1" formControlName="ventaId" required
                    [attr.aria-invalid]="cuentaForm.controls.ventaId.invalid && cuentaForm.controls.ventaId.touched"
                    aria-describedby="ventaId-error" />
                  @if (cuentaForm.controls.ventaId.invalid && cuentaForm.controls.ventaId.touched) {
                    <p class="field-error" id="ventaId-error">Ingresa un ID de venta válido.</p>
                  }
                </div>
                <div class="field">
                  <label for="fechaVenta">Fecha de venta <span aria-hidden="true">*</span></label>
                  <input id="fechaVenta" type="date" formControlName="fechaVenta" required />
                </div>
                <div class="field">
                  <label for="fechaVencimiento">Fecha de vencimiento <span aria-hidden="true">*</span></label>
                  <input id="fechaVencimiento" type="date" formControlName="fechaVencimiento" required />
                </div>
                <div class="field">
                  <label for="importeOriginal">Importe original</label>
                  <input id="importeOriginal" type="number" min="0" step="0.01" formControlName="importeOriginal" />
                </div>
                <div class="field">
                  <label for="saldoPendiente">Saldo pendiente</label>
                  <input id="saldoPendiente" type="number" min="0" step="0.01" formControlName="saldoPendiente" />
                </div>
                <div class="field">
                  <label for="diasVencidos">Días vencidos</label>
                  <input id="diasVencidos" type="number" min="0" step="1" formControlName="diasVencidos" />
                </div>
                <div class="field">
                  <label for="limiteCredito">Límite de crédito</label>
                  <input id="limiteCredito" type="number" min="0" step="0.01" formControlName="limiteCredito" />
                </div>
                <div class="field">
                  <label for="estatus">Estatus</label>
                  <select id="estatus" formControlName="estatus">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div class="field">
                  <label for="fechaUltimoPago">Fecha del último pago</label>
                  <input id="fechaUltimoPago" type="date" formControlName="fechaUltimoPago" />
                </div>
              </div>
              <p class="field-hint">El cliente y la venta deben existir, y la venta debe pertenecer al cliente indicado. Los importes y días vencidos vacíos se envían como 0.</p>
              @if (errorFormulario()) {
                <p class="message error" role="alert">{{ errorFormulario() }}</p>
              }
              <div class="form-actions">
                <button type="button" class="button secondary" [disabled]="guardando()" (click)="cancelarEdicion()">Cancelar</button>
                <button type="submit" class="button primary" [disabled]="guardando()">
                  {{ guardando() ? 'Guardando...' : editandoId() === null ? 'Crear cuenta' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          }

          @if (cargandoCuentas()) {
            <p class="message" role="status">Cargando cuentas...</p>
          } @else if (errorCuentas()) {
            <p class="message error" role="alert">{{ errorCuentas() }}</p>
          } @else if (cuentas().length === 0) {
            <p class="message">No hay cuentas por cobrar registradas.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <caption>Cuentas por cobrar registradas</caption>
                <thead>
                  <tr>
                    <th scope="col">ID</th><th scope="col">Cliente</th><th scope="col">Venta</th>
                    <th scope="col">Fecha venta</th><th scope="col">Vencimiento</th>
                    <th scope="col">Importe</th><th scope="col">Saldo pendiente</th>
                    <th scope="col">Días vencidos</th><th scope="col">Límite crédito</th>
                    <th scope="col">Estatus</th><th scope="col">Último pago</th><th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cuenta of cuentas(); track cuenta.idCxc) {
                    <tr>
                      <td>{{ cuenta.idCxc }}</td><td>{{ cuenta.clienteId }}</td><td>{{ cuenta.ventaId }}</td>
                      <td>{{ cuenta.fechaVenta }}</td><td>{{ cuenta.fechaVencimiento }}</td>
                      <td class="numeric">{{ moneda(cuenta.importeOriginal) }}</td>
                      <td class="numeric">{{ moneda(cuenta.saldoPendiente) }}</td>
                      <td class="numeric">{{ cuenta.diasVencidos }}</td>
                      <td class="numeric">{{ moneda(cuenta.limiteCredito) }}</td>
                      <td>{{ cuenta.estatus }}</td><td>{{ cuenta.fechaUltimoPago || '—' }}</td>
                      <td class="actions">
                        <button type="button" [disabled]="cargandoDetalleId() !== null"
                          [attr.aria-label]="'Consultar cuenta ' + cuenta.idCxc" (click)="consultarCuenta(cuenta.idCxc)">Ver</button>
                        <button type="button" [disabled]="guardando()" [attr.aria-label]="'Editar cuenta ' + cuenta.idCxc"
                          (click)="editarCuenta(cuenta.idCxc)">Editar</button>
                        @if (confirmandoEliminar()?.seccion === 'cuentas' && confirmandoEliminar()?.id === cuenta.idCxc) {
                          <button type="button" class="delete" [disabled]="eliminando() !== null"
                            (click)="eliminarCuenta(cuenta)">Confirmar</button>
                          <button type="button" [disabled]="eliminando() !== null" (click)="cancelarEliminacion()">Cancelar</button>
                        } @else {
                          <button type="button" class="delete" [disabled]="eliminando() !== null"
                            [attr.aria-label]="'Eliminar cuenta ' + cuenta.idCxc" (click)="solicitarEliminacion('cuentas', cuenta.idCxc)">Eliminar</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (cargandoDetalleId() !== null && seccion() === 'cuentas') {
            <p class="message" role="status">Consultando registro...</p>
          }
          @if (detalleCuenta(); as cuenta) {
            <section class="detail" aria-labelledby="detalle-cuenta-heading">
              <div class="section-heading">
                <h3 id="detalle-cuenta-heading">Cuenta #{{ cuenta.idCxc }}</h3>
                <button type="button" class="button secondary" (click)="detalleCuenta.set(null)">Cerrar</button>
              </div>
              <dl class="detail-grid">
                <div><dt>Cliente</dt><dd>{{ cuenta.clienteId }}</dd></div>
                <div><dt>Venta</dt><dd>{{ cuenta.ventaId }}</dd></div>
                <div><dt>Fecha de venta</dt><dd>{{ cuenta.fechaVenta }}</dd></div>
                <div><dt>Vencimiento</dt><dd>{{ cuenta.fechaVencimiento }}</dd></div>
                <div><dt>Importe original</dt><dd>{{ moneda(cuenta.importeOriginal) }}</dd></div>
                <div><dt>Saldo pendiente</dt><dd>{{ moneda(cuenta.saldoPendiente) }}</dd></div>
                <div><dt>Días vencidos</dt><dd>{{ cuenta.diasVencidos }}</dd></div>
                <div><dt>Límite de crédito</dt><dd>{{ moneda(cuenta.limiteCredito) }}</dd></div>
                <div><dt>Estatus</dt><dd>{{ cuenta.estatus }}</dd></div>
                <div><dt>Último pago</dt><dd>{{ cuenta.fechaUltimoPago || '—' }}</dd></div>
              </dl>
            </section>
          }
        </section>
      } @else {
        <section class="panel" aria-labelledby="historia-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Movimientos</p>
              <h2 id="historia-heading">Historia de cuentas por cobrar</h2>
            </div>
            <button type="button" class="button primary" (click)="nuevoMovimiento()">Nuevo movimiento</button>
          </div>

          <p class="field-hint">Registrar un movimiento en esta sección no actualiza automáticamente el saldo de la cuenta.</p>

          @if (editor() === 'historia') {
            <form [formGroup]="historiaForm" (ngSubmit)="guardarMovimiento()" novalidate>
              <h3>{{ editandoId() === null ? 'Registrar movimiento' : 'Editar movimiento #' + editandoId() }}</h3>
              <div class="form-grid">
                <div class="field">
                  <label for="idHistoria">ID de historia <span aria-hidden="true">*</span></label>
                  <input id="idHistoria" type="number" min="1" step="1" formControlName="idHistoria"
                    [readonly]="editandoId() !== null" [required]="editandoId() === null"
                    [attr.aria-invalid]="historiaForm.controls.idHistoria.invalid && historiaForm.controls.idHistoria.touched"
                    aria-describedby="idHistoria-error" />
                  @if (editandoId() === null && historiaForm.controls.idHistoria.invalid && historiaForm.controls.idHistoria.touched) {
                    <p class="field-error" id="idHistoria-error">El ID es obligatorio y debe ser mayor que cero.</p>
                  }
                </div>
                <div class="field">
                  <label for="cuentaPorCobrarId">ID de cuenta <span aria-hidden="true">*</span></label>
                  <input id="cuentaPorCobrarId" type="number" min="1" step="1" formControlName="cuentaPorCobrarId" required
                    [attr.aria-invalid]="historiaForm.controls.cuentaPorCobrarId.invalid && historiaForm.controls.cuentaPorCobrarId.touched"
                    aria-describedby="cuentaHistoria-error" />
                  @if (historiaForm.controls.cuentaPorCobrarId.invalid && historiaForm.controls.cuentaPorCobrarId.touched) {
                    <p class="field-error" id="cuentaHistoria-error">Ingresa un ID de cuenta válido.</p>
                  }
                </div>
                <div class="field">
                  <label for="tipoMovimiento">Tipo de movimiento <span aria-hidden="true">*</span></label>
                  <select id="tipoMovimiento" formControlName="tipoMovimiento" required>
                    @for (tipo of tiposMovimiento; track tipo) {
                      <option [value]="tipo">{{ tipo }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label for="historiaImporteOriginal">Importe original</label>
                  <input id="historiaImporteOriginal" type="number" min="0" step="0.01" formControlName="importeOriginal" />
                </div>
                <div class="field">
                  <label for="saldoAnterior">Saldo anterior</label>
                  <input id="saldoAnterior" type="number" min="0" step="0.01" formControlName="saldoAnterior" />
                </div>
                <div class="field">
                  <label for="saldoNuevo">Saldo nuevo</label>
                  <input id="saldoNuevo" type="number" min="0" step="0.01" formControlName="saldoNuevo" />
                </div>
                <div class="field">
                  <label for="montoMovimiento">Monto del movimiento</label>
                  <input id="montoMovimiento" type="number" min="0" step="0.01" formControlName="montoMovimiento" />
                </div>
                <div class="field">
                  <label for="fechaVencimientoAnterior">Vencimiento anterior</label>
                  <input id="fechaVencimientoAnterior" type="date" formControlName="fechaVencimientoAnterior" />
                </div>
                <div class="field">
                  <label for="fechaVencimientoNueva">Vencimiento nuevo</label>
                  <input id="fechaVencimientoNueva" type="date" formControlName="fechaVencimientoNueva" />
                </div>
                <div class="field">
                  <label for="historiaDiasVencidos">Días vencidos</label>
                  <input id="historiaDiasVencidos" type="number" min="0" step="1" formControlName="diasVencidos" />
                </div>
                <div class="field">
                  <label for="usuarioMovimiento">Usuario</label>
                  <input id="usuarioMovimiento" maxlength="100" formControlName="usuarioMovimiento" />
                </div>
                <div class="field">
                  <label for="equipoMovimiento">Equipo</label>
                  <input id="equipoMovimiento" maxlength="100" formControlName="equipoMovimiento" />
                </div>
                <div class="field full-width">
                  <label for="observaciones">Observaciones</label>
                  <textarea id="observaciones" maxlength="500" rows="3" formControlName="observaciones"></textarea>
                </div>
              </div>
              @if (errorFormulario()) {
                <p class="message error" role="alert">{{ errorFormulario() }}</p>
              }
              <div class="form-actions">
                <button type="button" class="button secondary" [disabled]="guardando()" (click)="cancelarEdicion()">Cancelar</button>
                <button type="submit" class="button primary" [disabled]="guardando()">
                  {{ guardando() ? 'Guardando...' : editandoId() === null ? 'Crear movimiento' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          }

          @if (cargandoHistoria()) {
            <p class="message" role="status">Cargando historia...</p>
          } @else if (errorHistoria()) {
            <p class="message error" role="alert">{{ errorHistoria() }}</p>
          } @else if (movimientos().length === 0) {
            <p class="message">No hay movimientos registrados.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <caption>Movimientos históricos de las cuentas por cobrar</caption>
                <thead>
                  <tr>
                    <th scope="col">ID historia</th><th scope="col">ID cuenta</th><th scope="col">Fecha</th>
                    <th scope="col">Tipo</th><th scope="col">Saldo anterior</th><th scope="col">Saldo nuevo</th>
                    <th scope="col">Monto</th><th scope="col">Vencimiento nuevo</th>
                    <th scope="col">Días vencidos</th><th scope="col">Usuario</th><th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (movimiento of movimientos(); track movimiento.idHistoria) {
                    <tr>
                      <td>{{ movimiento.idHistoria }}</td><td>{{ movimiento.cuentaPorCobrarId }}</td>
                      <td>{{ movimiento.fechaMovimiento || '—' }}</td><td>{{ movimiento.tipoMovimiento }}</td>
                      <td class="numeric">{{ moneda(movimiento.saldoAnterior) }}</td>
                      <td class="numeric">{{ moneda(movimiento.saldoNuevo) }}</td>
                      <td class="numeric">{{ moneda(movimiento.montoMovimiento) }}</td>
                      <td>{{ movimiento.fechaVencimientoNueva || '—' }}</td>
                      <td class="numeric">{{ movimiento.diasVencidos ?? '—' }}</td>
                      <td>{{ movimiento.usuarioMovimiento || '—' }}</td>
                      <td class="actions">
                        <button type="button" [disabled]="cargandoDetalleId() !== null"
                          [attr.aria-label]="'Consultar movimiento ' + movimiento.idHistoria"
                          (click)="consultarMovimiento(movimiento.idHistoria)">Ver</button>
                        <button type="button" [disabled]="guardando()"
                          [attr.aria-label]="'Editar movimiento ' + movimiento.idHistoria"
                          (click)="editarMovimiento(movimiento.idHistoria)">Editar</button>
                        @if (confirmandoEliminar()?.seccion === 'historia' && confirmandoEliminar()?.id === movimiento.idHistoria) {
                          <button type="button" class="delete" [disabled]="eliminando() !== null"
                            (click)="eliminarMovimiento(movimiento)">Confirmar</button>
                          <button type="button" [disabled]="eliminando() !== null" (click)="cancelarEliminacion()">Cancelar</button>
                        } @else {
                          <button type="button" class="delete" [disabled]="eliminando() !== null"
                            [attr.aria-label]="'Eliminar movimiento ' + movimiento.idHistoria"
                            (click)="solicitarEliminacion('historia', movimiento.idHistoria)">Eliminar</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (cargandoDetalleId() !== null && seccion() === 'historia') {
            <p class="message" role="status">Consultando movimiento...</p>
          }
          @if (detalleHistoria(); as movimiento) {
            <section class="detail" aria-labelledby="detalle-historia-heading">
              <div class="section-heading">
                <h3 id="detalle-historia-heading">Movimiento #{{ movimiento.idHistoria }}</h3>
                <button type="button" class="button secondary" (click)="detalleHistoria.set(null)">Cerrar</button>
              </div>
              <dl class="detail-grid">
                <div><dt>Cuenta</dt><dd>{{ movimiento.cuentaPorCobrarId }}</dd></div>
                <div><dt>Fecha de movimiento</dt><dd>{{ movimiento.fechaMovimiento || '—' }}</dd></div>
                <div><dt>Tipo</dt><dd>{{ movimiento.tipoMovimiento }}</dd></div>
                <div><dt>Importe original</dt><dd>{{ moneda(movimiento.importeOriginal) }}</dd></div>
                <div><dt>Saldo anterior</dt><dd>{{ moneda(movimiento.saldoAnterior) }}</dd></div>
                <div><dt>Saldo nuevo</dt><dd>{{ moneda(movimiento.saldoNuevo) }}</dd></div>
                <div><dt>Monto</dt><dd>{{ moneda(movimiento.montoMovimiento) }}</dd></div>
                <div><dt>Vencimiento anterior</dt><dd>{{ movimiento.fechaVencimientoAnterior || '—' }}</dd></div>
                <div><dt>Vencimiento nuevo</dt><dd>{{ movimiento.fechaVencimientoNueva || '—' }}</dd></div>
                <div><dt>Días vencidos</dt><dd>{{ movimiento.diasVencidos ?? '—' }}</dd></div>
                <div><dt>Usuario</dt><dd>{{ movimiento.usuarioMovimiento || '—' }}</dd></div>
                <div><dt>Equipo</dt><dd>{{ movimiento.equipoMovimiento || '—' }}</dd></div>
                <div class="full-width"><dt>Observaciones</dt><dd>{{ movimiento.observaciones || '—' }}</dd></div>
                <div><dt>Fecha de log</dt><dd>{{ movimiento.fechaLog || '—' }}</dd></div>
              </dl>
            </section>
          }
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
      width: min(1400px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0 72px;
    }

    .page-header,
    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .page-header {
      align-items: start;
      margin-bottom: 24px;
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
    }

    h3 {
      margin: 0 0 18px;
      font-size: 18px;
    }

    .description,
    .field-hint,
    .message {
      color: #52637a;
      line-height: 1.5;
    }

    .description {
      margin: 9px 0 0;
    }

    .back-link {
      color: #1d4ed8;
      font-weight: 600;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 18px;
      border-bottom: 1px solid #cbd5e1;
    }

    .tabs button {
      padding: 11px 16px;
      border: 0;
      border-bottom: 3px solid transparent;
      color: #334155;
      background: transparent;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .tabs button.active {
      border-bottom-color: #1d4ed8;
      color: #123b8a;
    }

    .panel,
    form,
    .detail {
      padding: 24px;
      border: 1px solid #dbe4f0;
      border-radius: 12px;
      background: #fff;
    }

    form {
      margin: 22px 0;
      background: #f8fafc;
    }

    .section-heading {
      margin-bottom: 18px;
    }

    .section-kicker {
      color: #52637a;
    }

    .form-grid,
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
    dt {
      font-size: 14px;
      font-weight: 650;
    }

    input,
    select,
    textarea {
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

    textarea {
      resize: vertical;
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    button:focus-visible,
    a:focus-visible {
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

    .field-hint {
      margin: 14px 0;
      font-size: 14px;
    }

    .form-actions,
    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 9px;
    }

    .form-actions {
      justify-content: end;
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid #dbe4f0;
    }

    .button {
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      border: 1px solid transparent;
      border-radius: 6px;
      font: inherit;
      font-weight: 650;
      text-decoration: none;
      cursor: pointer;
    }

    .primary {
      color: #fff;
      background: #1d4ed8;
    }

    .secondary {
      border-color: #cbd5e1;
      color: #172b4d;
      background: #fff;
    }

    .button:disabled,
    .actions button:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid #dbe4f0;
      border-radius: 8px;
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
      clip-path: inset(50%);
      white-space: nowrap;
    }

    th,
    td {
      padding: 11px 12px;
      border-bottom: 1px solid #dbe4f0;
      font-size: 13px;
    }

    th {
      color: #123b8a;
      background: #eaf1ff;
      font-weight: 700;
    }

    .numeric {
      text-align: right;
    }

    .actions button {
      padding: 4px 2px;
      border: 0;
      color: #1d4ed8;
      background: transparent;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .actions .delete,
    .error {
      color: #a23b2b;
    }

    .message {
      margin: 14px 0;
    }

    .detail {
      margin-top: 20px;
      background: #f8fafc;
    }

    .detail-grid {
      margin: 12px 0 0;
    }

    dd {
      margin: 4px 0 0;
      overflow-wrap: anywhere;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    @media (max-width: 760px) {
      .page {
        width: min(100% - 28px, 1400px);
        padding: 32px 0;
      }

      .page-header,
      .section-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .form-grid,
      .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .panel,
      form,
      .detail {
        padding: 18px;
      }
    }

    @media (max-width: 460px) {
      .form-grid,
      .detail-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .full-width {
        grid-column: auto;
      }

      .tabs button {
        padding-inline: 8px;
        font-size: 13px;
      }
    }
  `,
})
export class CuentasPorCobrarComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly cuentasService = inject(CuentaPorCobrarService);
  private readonly historiaService = inject(CuentaPorCobrarHistoriaService);

  readonly tiposMovimiento: TipoMovimientoHistoria[] = [
    'ALTA',
    'ABONO',
    'Cancelado',
    'PAGO_TOTAL',
    'REESTRUCTURA',
    'PRORROGA',
    'CANCELACION',
    'CASTIGO',
    'BLOQUEO_CREDITO',
    'DESBLOQUEO_CREDITO',
  ];

  readonly seccion = signal<Seccion>('cuentas');
  readonly editor = signal<Editor>(null);
  readonly editandoId = signal<number | null>(null);
  readonly cuentas = signal<CuentaPorCobrar[]>([]);
  readonly movimientos = signal<CuentaPorCobrarHistoria[]>([]);
  readonly detalleCuenta = signal<CuentaPorCobrar | null>(null);
  readonly detalleHistoria = signal<CuentaPorCobrarHistoria | null>(null);
  readonly cargandoCuentas = signal(true);
  readonly cargandoHistoria = signal(true);
  readonly cargandoDetalleId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly eliminando = signal<Eliminable>(null);
  readonly confirmandoEliminar = signal<Eliminable>(null);
  readonly errorCuentas = signal('');
  readonly errorHistoria = signal('');
  readonly errorFormulario = signal('');
  readonly errorAccion = signal('');
  readonly mensaje = signal('');

  readonly cuentaForm = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    ventaId: [0, [Validators.required, Validators.min(1)]],
    fechaVenta: [this.fechaHoy(), Validators.required],
    fechaVencimiento: [this.fechaHoy(), Validators.required],
    importeOriginal: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    saldoPendiente: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    diasVencidos: [0, [Validators.min(0), Validators.pattern(/^\d+$/)]],
    limiteCredito: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    estatus: ['Pendiente' as CuentaPorCobrarRequest['estatus'], Validators.required],
    fechaUltimoPago: [''],
  });

  readonly historiaForm = this.formBuilder.nonNullable.group({
    idHistoria: [0, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    cuentaPorCobrarId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    tipoMovimiento: ['ALTA' as TipoMovimientoHistoria, Validators.required],
    importeOriginal: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    saldoAnterior: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    saldoNuevo: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    montoMovimiento: [0, [Validators.min(0), Validators.pattern(/^\d{1,16}(?:\.\d{1,2})?$/)]],
    fechaVencimientoAnterior: [''],
    fechaVencimientoNueva: [''],
    diasVencidos: [0, [Validators.min(0), Validators.pattern(/^\d+$/)]],
    usuarioMovimiento: ['', Validators.maxLength(100)],
    equipoMovimiento: ['', Validators.maxLength(100)],
    observaciones: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarHistoria();
  }

  cambiarSeccion(seccion: Seccion): void {
    this.seccion.set(seccion);
    this.mensaje.set('');
    this.errorAccion.set('');
  }

  nuevaCuenta(): void {
    this.resetForms();
    this.cuentaForm.reset({
      clienteId: 0,
      ventaId: 0,
      fechaVenta: this.fechaHoy(),
      fechaVencimiento: this.fechaHoy(),
      importeOriginal: 0,
      saldoPendiente: 0,
      diasVencidos: 0,
      limiteCredito: 0,
      estatus: 'Pendiente',
      fechaUltimoPago: '',
    });
    this.editor.set('cuentas');
    this.seccion.set('cuentas');
  }

  nuevoMovimiento(): void {
    this.resetForms();
    this.historiaForm.reset({
      idHistoria: 0,
      cuentaPorCobrarId: 0,
      tipoMovimiento: 'ALTA',
      importeOriginal: 0,
      saldoAnterior: 0,
      saldoNuevo: 0,
      montoMovimiento: 0,
      fechaVencimientoAnterior: '',
      fechaVencimientoNueva: '',
      diasVencidos: 0,
      usuarioMovimiento: '',
      equipoMovimiento: '',
      observaciones: '',
    });
    this.editor.set('historia');
    this.seccion.set('historia');
  }

  editarCuenta(id: number): void {
    this.cargandoDetalleId.set(id);
    this.errorFormulario.set('');
    this.cuentasService.obtenerPorId(id).subscribe({
      next: (cuenta) => {
        this.cuentaForm.patchValue({
          clienteId: cuenta.clienteId,
          ventaId: cuenta.ventaId,
          fechaVenta: cuenta.fechaVenta,
          fechaVencimiento: cuenta.fechaVencimiento,
          importeOriginal: cuenta.importeOriginal,
          saldoPendiente: cuenta.saldoPendiente,
          diasVencidos: cuenta.diasVencidos,
          limiteCredito: cuenta.limiteCredito,
          estatus: cuenta.estatus,
          fechaUltimoPago: cuenta.fechaUltimoPago ?? '',
        });
        this.editandoId.set(id);
        this.editor.set('cuentas');
        this.seccion.set('cuentas');
        this.detalleCuenta.set(null);
        this.cargandoDetalleId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(this.errorHttp(response, 'consultar', 'la cuenta'));
        this.cargandoDetalleId.set(null);
      },
    });
  }

  consultarCuenta(id: number): void {
    this.cargandoDetalleId.set(id);
    this.errorAccion.set('');
    this.cuentasService.obtenerPorId(id).subscribe({
      next: (cuenta) => {
        this.detalleCuenta.set(cuenta);
        this.detalleHistoria.set(null);
        this.cargandoDetalleId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(this.errorHttp(response, 'consultar', 'la cuenta'));
        this.cargandoDetalleId.set(null);
      },
    });
  }

  guardarCuenta(): void {
    this.errorFormulario.set('');
    if (this.cuentaForm.invalid) {
      this.cuentaForm.markAllAsTouched();
      return;
    }
    const value = this.cuentaForm.getRawValue();
    const request: CuentaPorCobrarRequest = {
      clienteId: Number(value.clienteId),
      ventaId: Number(value.ventaId),
      fechaVenta: value.fechaVenta,
      fechaVencimiento: value.fechaVencimiento,
      importeOriginal: Number(value.importeOriginal || 0),
      saldoPendiente: Number(value.saldoPendiente || 0),
      diasVencidos: Number(value.diasVencidos || 0),
      limiteCredito: Number(value.limiteCredito || 0),
      estatus: value.estatus,
      fechaUltimoPago: value.fechaUltimoPago || null,
    };

    this.guardando.set(true);
    const id = this.editandoId();
    const request$ = id === null
      ? this.cuentasService.crear(request)
      : this.cuentasService.actualizar(id, request);
    request$.subscribe({
      next: (cuenta) => {
        this.cuentas.update((cuentas) => id === null
          ? [...cuentas, cuenta]
          : cuentas.map((item) => item.idCxc === id ? cuenta : item));
        this.mensaje.set(id === null ? 'Cuenta creada correctamente.' : 'Cuenta actualizada correctamente.');
        this.guardando.set(false);
        this.resetForms();
      },
      error: (response: HttpErrorResponse) => {
        this.errorFormulario.set(response.status === 400
          ? 'El servidor rechazó los datos. Verifica que la venta pertenezca al cliente indicado y revisa fechas e importes.'
          : this.errorHttp(response, id === null ? 'crear' : 'actualizar', 'la cuenta'));
        this.guardando.set(false);
      },
    });
  }

  editarMovimiento(id: number): void {
    this.cargandoDetalleId.set(id);
    this.errorFormulario.set('');
    this.historiaService.obtenerPorId(id).subscribe({
      next: (movimiento) => {
        this.patchHistoria(movimiento);
        this.editandoId.set(id);
        this.editor.set('historia');
        this.seccion.set('historia');
        this.detalleHistoria.set(null);
        this.cargandoDetalleId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(this.errorHttp(response, 'consultar', 'el movimiento'));
        this.cargandoDetalleId.set(null);
      },
    });
  }

  consultarMovimiento(id: number): void {
    this.cargandoDetalleId.set(id);
    this.errorAccion.set('');
    this.historiaService.obtenerPorId(id).subscribe({
      next: (movimiento) => {
        this.detalleHistoria.set(movimiento);
        this.detalleCuenta.set(null);
        this.cargandoDetalleId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(this.errorHttp(response, 'consultar', 'el movimiento'));
        this.cargandoDetalleId.set(null);
      },
    });
  }

  guardarMovimiento(): void {
    this.errorFormulario.set('');
    if (this.historiaForm.invalid) {
      this.historiaForm.markAllAsTouched();
      return;
    }
    const value = this.historiaForm.getRawValue();
    const id = this.editandoId();
    const request: CuentaPorCobrarHistoriaRequest = {
      ...(id === null ? { idHistoria: Number(value.idHistoria) } : {}),
      cuentaPorCobrarId: Number(value.cuentaPorCobrarId),
      tipoMovimiento: value.tipoMovimiento,
      importeOriginal: this.numeroOpcional(value.importeOriginal),
      saldoAnterior: this.numeroOpcional(value.saldoAnterior),
      saldoNuevo: this.numeroOpcional(value.saldoNuevo),
      montoMovimiento: this.numeroOpcional(value.montoMovimiento),
      fechaVencimientoAnterior: value.fechaVencimientoAnterior || null,
      fechaVencimientoNueva: value.fechaVencimientoNueva || null,
      diasVencidos: this.enteroOpcional(value.diasVencidos),
      usuarioMovimiento: value.usuarioMovimiento.trim() || null,
      equipoMovimiento: value.equipoMovimiento.trim() || null,
      observaciones: value.observaciones.trim() || null,
    };

    this.guardando.set(true);
    const request$ = id === null
      ? this.historiaService.crear(request)
      : this.historiaService.actualizar(id, request);
    request$.subscribe({
      next: (movimiento) => {
        this.movimientos.update((movimientos) => id === null
          ? [...movimientos, movimiento]
          : movimientos.map((item) => item.idHistoria === id ? movimiento : item));
        this.mensaje.set(id === null ? 'Movimiento creado correctamente.' : 'Movimiento actualizado correctamente.');
        this.guardando.set(false);
        this.resetForms();
      },
      error: (response: HttpErrorResponse) => {
        this.errorFormulario.set(response.status === 409
          ? 'Ya existe un movimiento con ese ID de historia.'
          : response.status === 400
            ? 'El servidor rechazó el movimiento. Revisa el ID de historia, la cuenta y los datos ingresados.'
            : this.errorHttp(response, id === null ? 'crear' : 'actualizar', 'el movimiento'));
        this.guardando.set(false);
      },
    });
  }

  solicitarEliminacion(seccion: Seccion, id: number): void {
    this.confirmandoEliminar.set({ seccion, id });
    this.errorAccion.set('');
    this.mensaje.set('');
  }

  cancelarEliminacion(): void {
    this.confirmandoEliminar.set(null);
  }

  eliminarCuenta(cuenta: CuentaPorCobrar): void {
    if (this.confirmandoEliminar()?.seccion !== 'cuentas' ||
      this.confirmandoEliminar()?.id !== cuenta.idCxc ||
      this.eliminando() !== null) {
      return;
    }

    this.eliminando.set({ seccion: 'cuentas', id: cuenta.idCxc });
    this.cuentasService.eliminar(cuenta.idCxc).subscribe({
      next: () => {
        this.cuentas.update((cuentas) => cuentas.filter((item) => item.idCxc !== cuenta.idCxc));
        if (this.detalleCuenta()?.idCxc === cuenta.idCxc) {
          this.detalleCuenta.set(null);
        }
        this.confirmandoEliminar.set(null);
        this.eliminando.set(null);
        this.mensaje.set(`Cuenta #${cuenta.idCxc} eliminada correctamente.`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(response.status === 404
          ? 'La cuenta no se encontró en el servidor.'
          : response.status === 409 || response.status === 500
            ? 'No se pudo eliminar la cuenta. Puede tener movimientos de historia asociados; elimina esos movimientos antes de volver a intentarlo.'
            : this.errorHttp(response, 'eliminar', 'la cuenta'));
        this.eliminando.set(null);
      },
    });
  }

  eliminarMovimiento(movimiento: CuentaPorCobrarHistoria): void {
    if (this.confirmandoEliminar()?.seccion !== 'historia' ||
      this.confirmandoEliminar()?.id !== movimiento.idHistoria ||
      this.eliminando() !== null) {
      return;
    }

    this.eliminando.set({ seccion: 'historia', id: movimiento.idHistoria });
    this.historiaService.eliminar(movimiento.idHistoria).subscribe({
      next: () => {
        this.movimientos.update((items) => items.filter((item) => item.idHistoria !== movimiento.idHistoria));
        if (this.detalleHistoria()?.idHistoria === movimiento.idHistoria) {
          this.detalleHistoria.set(null);
        }
        this.confirmandoEliminar.set(null);
        this.eliminando.set(null);
        this.mensaje.set(`Movimiento #${movimiento.idHistoria} eliminado correctamente.`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(this.errorHttp(response, 'eliminar', 'el movimiento'));
        this.eliminando.set(null);
      },
    });
  }

  moneda(valor: number | null): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor ?? 0);
  }

  cancelarEdicion(): void {
    this.resetForms();
    this.mensaje.set('');
  }

  private cargarCuentas(): void {
    this.cuentasService.listar().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargandoCuentas.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.errorCuentas.set(this.errorHttp(response, 'cargar', 'las cuentas'));
        this.cargandoCuentas.set(false);
      },
    });
  }

  private cargarHistoria(): void {
    this.historiaService.listar().subscribe({
      next: (movimientos) => {
        this.movimientos.set(movimientos);
        this.cargandoHistoria.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.errorHistoria.set(this.errorHttp(response, 'cargar', 'la historia'));
        this.cargandoHistoria.set(false);
      },
    });
  }

  private patchHistoria(movimiento: CuentaPorCobrarHistoria): void {
    this.historiaForm.patchValue({
      idHistoria: movimiento.idHistoria,
      cuentaPorCobrarId: movimiento.cuentaPorCobrarId,
      tipoMovimiento: movimiento.tipoMovimiento,
      importeOriginal: movimiento.importeOriginal ?? 0,
      saldoAnterior: movimiento.saldoAnterior ?? 0,
      saldoNuevo: movimiento.saldoNuevo ?? 0,
      montoMovimiento: movimiento.montoMovimiento ?? 0,
      fechaVencimientoAnterior: movimiento.fechaVencimientoAnterior ?? '',
      fechaVencimientoNueva: movimiento.fechaVencimientoNueva ?? '',
      diasVencidos: movimiento.diasVencidos ?? 0,
      usuarioMovimiento: movimiento.usuarioMovimiento ?? '',
      equipoMovimiento: movimiento.equipoMovimiento ?? '',
      observaciones: movimiento.observaciones ?? '',
    });
  }

  private resetForms(): void {
    this.editor.set(null);
    this.editandoId.set(null);
    this.errorFormulario.set('');
    this.cuentaForm.reset({
      clienteId: 0,
      ventaId: 0,
      fechaVenta: this.fechaHoy(),
      fechaVencimiento: this.fechaHoy(),
      importeOriginal: 0,
      saldoPendiente: 0,
      diasVencidos: 0,
      limiteCredito: 0,
      estatus: 'Pendiente',
      fechaUltimoPago: '',
    });
    this.historiaForm.reset({
      idHistoria: 0,
      cuentaPorCobrarId: 0,
      tipoMovimiento: 'ALTA',
      importeOriginal: 0,
      saldoAnterior: 0,
      saldoNuevo: 0,
      montoMovimiento: 0,
      fechaVencimientoAnterior: '',
      fechaVencimientoNueva: '',
      diasVencidos: 0,
      usuarioMovimiento: '',
      equipoMovimiento: '',
      observaciones: '',
    });
  }

  private numeroOpcional(value: number): number | null {
    return value === null || value === undefined || value === 0 ? null : Number(value);
  }

  private enteroOpcional(value: number): number | null {
    return value === null || value === undefined || value === 0 ? null : Number(value);
  }

  private fechaHoy(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  private errorHttp(response: HttpErrorResponse, accion: string, entidad: string): string {
    if (response.status === 0) {
      return `No fue posible conectar con el servidor para ${accion} ${entidad}.`;
    }
    if (response.status === 404) {
      return `${entidad.charAt(0).toUpperCase()}${entidad.slice(1)} o uno de sus registros relacionados no se encontró (HTTP 404).`;
    }
    return `No fue posible ${accion} ${entidad} (HTTP ${response.status}).`;
  }
}
