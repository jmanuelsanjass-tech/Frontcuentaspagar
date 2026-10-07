import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Cliente, ClienteUpdate } from '../models/cliente.model';
import { ClienteService } from '../services/cliente.service';

@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <p class="eyebrow">Directorio</p>
      <h1>Clientes</h1>
      <section class="client-list" aria-labelledby="clientes-title">
        <div class="section-heading">
          <div>
            <h2 id="clientes-title">Directorio de clientes</h2>
            <p>Información fiscal, de contacto y de pago.</p>
          </div>
          <div class="heading-actions">
            <button class="button" type="button" [disabled]="guardando()" (click)="iniciarNuevo()">
              Nuevo cliente
            </button>
            <a routerLink="/" class="button secondary">Volver al menú principal</a>
          </div>
        </div>

        @if (creando() || editandoId() !== null) {
          <form class="edit-form" [formGroup]="form" (ngSubmit)="guardarCliente()">
            <div class="edit-heading">
              @if (creando()) {
                <h3>Nuevo cliente</h3>
                <p>Completa la información para registrar un cliente.</p>
              } @else {
                <h3>Editar cliente #{{ editandoId() }}</h3>
                <p>Actualiza la información y guarda los cambios.</p>
              }
            </div>

            <div class="edit-fields">
              <div class="field">
                <label for="nombreComercial">Nombre comercial</label>
                <input id="nombreComercial" formControlName="nombreComercial" required />
              </div>
              <div class="field">
                <label for="razonSocial">Razón social</label>
                <input id="razonSocial" formControlName="razonSocial" required />
              </div>
              <div class="field">
                <label for="rfc">RFC</label>
                <input id="rfc" formControlName="rfc" required minlength="12" maxlength="13" />
              </div>
              <div class="field">
                <label for="situacionFiscal">Situación fiscal</label>
                <input id="situacionFiscal" formControlName="situacionFiscal" required />
              </div>
              <div class="field">
                <label for="tipoCliente">Tipo de cliente</label>
                <select id="tipoCliente" formControlName="tipoCliente" required>
                  <option value="Escuela privada">Escuela privada</option>
                  <option value="Persona física">Persona física</option>
                  <option value="Persona moral">Persona moral</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="field">
                <label for="direccion">Dirección</label>
                <input id="direccion" formControlName="direccion" />
              </div>
              <div class="field">
                <label for="colonia">Colonia</label>
                <input id="colonia" formControlName="colonia" />
              </div>
              <div class="field">
                <label for="ciudad">Ciudad</label>
                <input id="ciudad" formControlName="ciudad" />
              </div>
              <div class="field">
                <label for="contacto">Contacto</label>
                <input id="contacto" formControlName="contacto" />
              </div>
              <div class="field">
                <label for="banco">Banco</label>
                <input id="banco" formControlName="banco" />
              </div>
              <div class="field">
                <label for="cuentaBancaria">Cuenta bancaria</label>
                <input id="cuentaBancaria" formControlName="cuentaBancaria" />
              </div>
              <div class="field">
                <label for="clabe">CLABE</label>
                <input id="clabe" formControlName="clabe" minlength="18" maxlength="18" />
              </div>
              <div class="field">
                <label for="formaPago">Forma de pago</label>
                <input id="formaPago" formControlName="formaPago" />
              </div>
            </div>

            @if (errorEdicion()) {
              <p class="error edit-error" role="alert">{{ errorEdicion() }}</p>
            }

            <div class="edit-actions">
              <button class="button" type="submit" [disabled]="form.invalid || guardando()">
                {{ guardando() ? 'Guardando...' : creando() ? 'Crear cliente' : 'Guardar cambios' }}
              </button>
              <button class="button secondary" type="button" [disabled]="guardando()" (click)="cancelarEdicion()">
                Cancelar
              </button>
            </div>
          </form>
        }

        @if (cargando()) {
          <p class="status" role="status">Cargando clientes...</p>
        } @else if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        } @else if (clientes().length === 0) {
          <p class="status">No hay clientes registrados.</p>
        } @else {
          <div class="table-scroll" role="region" aria-label="Grid de clientes" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th scope="col">Acciones</th>
                  <th scope="col">ID</th>
                  <th scope="col">Nombre comercial</th>
                  <th scope="col">Razón social</th>
                  <th scope="col">RFC</th>
                  <th scope="col">Situación fiscal</th>
                  <th scope="col">Tipo de cliente</th>
                  <th scope="col">Dirección</th>
                  <th scope="col">Colonia</th>
                  <th scope="col">Ciudad</th>
                  <th scope="col">Contacto</th>
                  <th scope="col">Banco</th>
                  <th scope="col">Cuenta bancaria</th>
                  <th scope="col">CLABE</th>
                  <th scope="col">Forma de pago</th>
                  <th scope="col">Fecha de alta</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of clientes(); track cliente.id) {
                  <tr>
                    <td>
                      <button
                        class="edit-button"
                        type="button"
                        [disabled]="guardando()"
                        [attr.aria-label]="'Editar cliente ' + cliente.nombreComercial"
                        (click)="iniciarEdicion(cliente)"
                      >
                        Editar
                      </button>
                    </td>
                    <td>{{ cliente.id }}</td>
                    <td>{{ cliente.nombreComercial }}</td>
                    <td>{{ cliente.razonSocial }}</td>
                    <td>{{ cliente.rfc }}</td>
                    <td>{{ cliente.situacionFiscal }}</td>
                    <td>{{ cliente.tipoCliente }}</td>
                    <td>{{ cliente.direccion }}</td>
                    <td>{{ cliente.colonia }}</td>
                    <td>{{ cliente.ciudad }}</td>
                    <td>{{ cliente.contacto }}</td>
                    <td>{{ cliente.banco }}</td>
                    <td>{{ cliente.cuentaBancaria }}</td>
                    <td>{{ cliente.clabe }}</td>
                    <td>{{ cliente.formaPago }}</td>
                    <td>{{ cliente.fechaAlta }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
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

    .page {
      width: min(1400px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #843e22;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 650;
    }

    .client-list {
      margin-top: 32px;
      border: 1px solid #e8d8c8;
      border-radius: 14px;
      background: #fffdf9;
      box-shadow: 0 10px 30px rgb(88 52 30 / 6%);
    }

    .edit-form {
      display: grid;
      gap: 18px;
      padding: 24px;
      border-bottom: 1px solid #eadfd3;
      background: #fcf8f2;
    }

    .edit-heading h3 {
      margin: 0;
      font-size: 17px;
    }

    .edit-heading p {
      margin: 5px 0 0;
      color: #69564a;
      font-size: 14px;
    }

    .edit-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 14px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .field label {
      font-size: 13px;
      font-weight: 650;
    }

    .field input,
    .field select {
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      padding: 8px 10px;
      border: 1px solid #cbb8a7;
      border-radius: 4px;
      color: #34271f;
      background: #fffefa;
      font: inherit;
    }

    .field input:focus-visible,
    .field select:focus-visible {
      outline: 3px solid #984923;
      outline-offset: 2px;
    }

    .edit-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .edit-actions .button {
      margin-top: 0;
      border: 0;
      cursor: pointer;
      font: inherit;
      font-weight: 650;
    }

    .edit-actions .button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .edit-actions .secondary {
      color: #34271f;
      background: #f1e4d8;
    }

    .edit-button {
      padding: 6px 10px;
      border: 1px solid #984923;
      border-radius: 4px;
      color: #793719;
      background: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .edit-button:hover:not(:disabled) {
      background: #fbf1e6;
    }

    .edit-button:focus-visible,
    .edit-actions .button:focus-visible {
      outline: 3px solid #4a2c1e;
      outline-offset: 3px;
    }

    .edit-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .edit-error {
      padding: 0;
    }

    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px 24px;
      border-bottom: 1px solid #eadfd3;
    }

    .heading-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    h2 {
      margin: 0;
      font-size: 19px;
    }

    .section-heading p,
    .status,
    .error {
      margin: 0;
      color: #69564a;
      line-height: 1.5;
    }

    .section-heading p {
      margin-top: 4px;
      font-size: 14px;
    }

    .status,
    .error {
      padding: 24px;
    }

    .error {
      color: #a23b2b;
    }

    .table-scroll {
      overflow: auto;
      max-height: min(65vh, 680px);
    }

    .table-scroll:focus-visible {
      outline: 3px solid #984923;
      outline-offset: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      white-space: nowrap;
      font-size: 13px;
    }

    thead {
      position: sticky;
      top: 0;
      z-index: 1;
      color: #4a2c1e;
      background: #f8eadd;
    }

    th,
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #eee3d8;
    }

    th {
      font-weight: 700;
    }

    tbody tr:hover {
      background: #fcf8f2;
    }

    .button {
      display: inline-flex;
      min-height: 42px;
      align-items: center;
      margin-top: 8px;
      padding: 0 16px;
      border-radius: 4px;
      color: #fff;
      background: #843e22;
      font-weight: 650;
      text-decoration: none;
    }

    button.button {
      border: 0;
      cursor: pointer;
      font: inherit;
    }

    button.button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .button.secondary {
      color: #34271f;
      background: #f1e4d8;
    }

    .button:focus-visible {
      outline: 3px solid #4a2c1e;
      outline-offset: 3px;
    }

    @media (max-width: 640px) {
      .page {
        padding: 32px 0;
      }

      .section-heading {
        align-items: flex-start;
        flex-direction: column;
        padding: 18px;
      }
    }
  `,
})
export class ClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly editandoId = signal<number | null>(null);
  protected readonly creando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nombreComercial: ['', [Validators.required, Validators.maxLength(150)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(200)]],
    rfc: ['', [Validators.required, Validators.pattern(/^[\s\S]{12,13}$/)]],
    situacionFiscal: ['', [Validators.required, Validators.maxLength(100)]],
    tipoCliente: ['', [Validators.required, Validators.pattern(/^(Escuela privada|Persona física|Persona moral|Otro)$/)]],
    direccion: ['', Validators.maxLength(200)],
    colonia: ['', Validators.maxLength(100)],
    ciudad: ['', Validators.maxLength(100)],
    contacto: ['', Validators.maxLength(150)],
    banco: ['', Validators.maxLength(100)],
    cuentaBancaria: ['', Validators.maxLength(20)],
    clabe: ['', Validators.pattern(/^$|^[\s\S]{18}$/)],
    formaPago: ['', Validators.maxLength(50)],
  });

  ngOnInit(): void {
    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para cargar los clientes.'
            : `No fue posible cargar los clientes (HTTP ${response.status}).`,
        );
        this.cargando.set(false);
      },
    });
  }

  iniciarEdicion(cliente: Cliente): void {
    this.creando.set(false);
    this.form.patchValue({
      nombreComercial: cliente.nombreComercial,
      razonSocial: cliente.razonSocial,
      rfc: cliente.rfc,
      situacionFiscal: cliente.situacionFiscal,
      tipoCliente: cliente.tipoCliente,
      direccion: cliente.direccion,
      colonia: cliente.colonia,
      ciudad: cliente.ciudad,
      contacto: cliente.contacto,
      banco: cliente.banco,
      cuentaBancaria: cliente.cuentaBancaria,
      clabe: cliente.clabe,
      formaPago: cliente.formaPago,
    });
    this.errorEdicion.set('');
    this.editandoId.set(cliente.id);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.creando.set(false);
    this.errorEdicion.set('');
    this.form.reset();
  }

  iniciarNuevo(): void {
    this.form.reset({
      nombreComercial: '',
      razonSocial: '',
      rfc: '',
      situacionFiscal: '',
      tipoCliente: 'Escuela privada',
      direccion: '',
      colonia: '',
      ciudad: '',
      contacto: '',
      banco: '',
      cuentaBancaria: '',
      clabe: '',
      formaPago: 'Transferencia',
    });
    this.editandoId.set(null);
    this.errorEdicion.set('');
    this.creando.set(true);
  }

  guardarCliente(): void {
    const id = this.editandoId();
    const esNuevo = this.creando();
    if (this.form.invalid || this.guardando() || (!esNuevo && id === null)) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorEdicion.set('');
    const clienteActualizado = this.obtenerDatosCliente();

    if (esNuevo) {
      this.guardarSolicitud(this.clienteService.crear(clienteActualizado), null, true);
    } else if (id !== null) {
      this.guardarSolicitud(this.clienteService.actualizar(id, clienteActualizado), id, false);
    }
  }

  private guardarSolicitud(
    peticion: Observable<Cliente>,
    id: number | null,
    esNuevo: boolean,
  ): void {
    this.guardando.set(true);
    peticion.subscribe({
      next: (clienteGuardado) => {
        if (esNuevo) {
          this.clientes.update((clientes) => [...clientes, clienteGuardado]);
        } else if (id !== null) {
          this.clientes.update((clientes) =>
            clientes.map((cliente) => (cliente.id === id ? clienteGuardado : cliente)),
          );
        }
        this.guardando.set(false);
        this.cancelarEdicion();
      },
      error: (response: HttpErrorResponse) => {
        this.errorEdicion.set(
          response.status === 0
            ? 'No se pudo conectar con el backend. Confirma que esté activo en el puerto 8080 y reinicia ng serve para aplicar el proxy.'
            : response.status === 404
              ? 'El cliente ya no existe o no se encontró en el servidor.'
              : response.status === 403
                ? 'El backend rechazó la actualización (403). Reinicia el backend para cargar la regla que permite PUT /api/clientes/{id} y omite CSRF para esta ruta.'
              : response.status === 400
                ? 'El servidor rechazó los datos. Revisa el RFC, tipo de cliente y CLABE.'
                  : `No fue posible ${esNuevo ? 'crear el cliente' : 'guardar los cambios'} (HTTP ${response.status}).`,
        );
        this.guardando.set(false);
      },
    });
  }

  private obtenerDatosCliente(): ClienteUpdate {
    const value = this.form.getRawValue();
    return {
      nombreComercial: value.nombreComercial,
      razonSocial: value.razonSocial,
      rfc: value.rfc,
      situacionFiscal: value.situacionFiscal,
      tipoCliente: value.tipoCliente,
      direccion: value.direccion || null,
      colonia: value.colonia || null,
      ciudad: value.ciudad || null,
      contacto: value.contacto || null,
      banco: value.banco || null,
      cuentaBancaria: value.cuentaBancaria || null,
      clabe: value.clabe || null,
      formaPago: value.formaPago || null,
    };
  }
}
