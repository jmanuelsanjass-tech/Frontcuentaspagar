import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Cliente, ClienteRequest } from '../models/cliente.model';
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
            <p>Consulta y administra tus clientes.</p>
          </div>
          <div class="heading-actions">
            <button class="button" type="button" [disabled]="guardando() || eliminandoId() !== null" (click)="iniciarNuevo()">
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
                <p>Completa los datos para registrar un cliente.</p>
              } @else {
                <h3>Editar cliente #{{ editandoId() }}</h3>
                <p>Actualiza la información y guarda los cambios.</p>
              }
            </div>

            <div class="edit-fields">
              <div class="field">
                <label for="nombre">Nombre <span aria-hidden="true">*</span></label>
                <input id="nombre" formControlName="nombre" autocomplete="name" required
                  [attr.aria-invalid]="form.controls.nombre.invalid && form.controls.nombre.touched"
                  aria-describedby="nombre-error" />
                @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
                  <p class="field-error" id="nombre-error">El nombre es obligatorio (máximo 100 caracteres).</p>
                }
              </div>
              <div class="field">
                <label for="telefono">Teléfono <span aria-hidden="true">*</span></label>
                <input id="telefono" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10"
                  formControlName="telefono" required
                  [attr.aria-invalid]="form.controls.telefono.invalid && form.controls.telefono.touched"
                  aria-describedby="telefono-error" />
                @if (form.controls.telefono.invalid && form.controls.telefono.touched) {
                  <p class="field-error" id="telefono-error">El teléfono debe tener exactamente 10 dígitos.</p>
                }
              </div>
              <div class="field">
                <label for="correo">Correo electrónico <span aria-hidden="true">*</span></label>
                <input id="correo" type="email" formControlName="correo" autocomplete="email" required
                  [attr.aria-invalid]="form.controls.correo.invalid && form.controls.correo.touched"
                  aria-describedby="correo-error" />
                @if (form.controls.correo.invalid && form.controls.correo.touched) {
                  <p class="field-error" id="correo-error">Ingresa un correo electrónico válido (máximo 100 caracteres).</p>
                }
              </div>
              <div class="field">
                <label for="direccion">Dirección</label>
                <input id="direccion" formControlName="direccion" autocomplete="street-address"
                  [attr.aria-invalid]="form.controls.direccion.invalid && form.controls.direccion.touched"
                  aria-describedby="direccion-error" />
                @if (form.controls.direccion.invalid && form.controls.direccion.touched) {
                  <p class="field-error" id="direccion-error">La dirección no puede exceder 200 caracteres.</p>
                }
              </div>
              <div class="field">
                <label for="estadoDireccion">Estado de dirección <span aria-hidden="true">*</span></label>
                <select id="estadoDireccion" formControlName="estadoDireccion" required
                  [attr.aria-invalid]="form.controls.estadoDireccion.invalid && form.controls.estadoDireccion.touched"
                  aria-describedby="estadoDireccion-error">
                  <option value="" disabled>Selecciona un estado</option>
                  @for (estado of estadosDireccion; track estado) {
                    <option [value]="estado">{{ estado }}</option>
                  }
                </select>
                @if (form.controls.estadoDireccion.invalid && form.controls.estadoDireccion.touched) {
                  <p class="field-error" id="estadoDireccion-error">Selecciona uno de los 32 estados admitidos.</p>
                }
              </div>
              <div class="field">
                <label for="estado">Estado del cliente <span aria-hidden="true">*</span></label>
                <select id="estado" formControlName="estado" required
                  [attr.aria-invalid]="form.controls.estado.invalid && form.controls.estado.touched"
                  aria-describedby="estado-error">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="prospecto">Prospecto</option>
                </select>
                @if (form.controls.estado.invalid && form.controls.estado.touched) {
                  <p class="field-error" id="estado-error">Selecciona activo, inactivo o prospecto.</p>
                }
              </div>
              <div class="field">
                <label for="historialCompras">Historial de compras</label>
                <textarea id="historialCompras" formControlName="historialCompras" rows="3"></textarea>
              </div>
              <div class="field">
                <label for="qrCode">Código QR en Base64 (opcional)</label>
                <textarea id="qrCode" formControlName="qrCode" rows="3"
                  [attr.aria-invalid]="form.controls.qrCode.invalid && form.controls.qrCode.touched"
                  aria-describedby="qrCode-help qrCode-error"></textarea>
                <p class="field-help" id="qrCode-help">Pega aquí el contenido Base64, sin encabezado de data URL.</p>
                @if (form.controls.qrCode.invalid && form.controls.qrCode.touched) {
                  <p class="field-error" id="qrCode-error">El código QR debe ser una cadena Base64 válida.</p>
                }
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

        @if (consultandoId() !== null) {
          <p class="status" role="status">Consultando cliente #{{ consultandoId() }}...</p>
        }

        @if (errorConsulta()) {
          <p class="error" role="alert">{{ errorConsulta() }}</p>
        }

        @if (detalleCliente(); as detalle) {
          <section class="client-detail" aria-labelledby="detalle-title">
            <div class="detail-heading">
              <h3 id="detalle-title">Detalle del cliente #{{ detalle.idCliente }}</h3>
              <button class="edit-button" type="button" (click)="cerrarDetalle()">Cerrar detalle</button>
            </div>
            <dl>
              <div><dt>Nombre</dt><dd>{{ detalle.nombre }}</dd></div>
              <div><dt>Teléfono</dt><dd>{{ detalle.telefono }}</dd></div>
              <div><dt>Correo</dt><dd>{{ detalle.correo }}</dd></div>
              <div><dt>Dirección</dt><dd>{{ detalle.direccion || '—' }}</dd></div>
              <div><dt>Estado de dirección</dt><dd>{{ detalle.estadoDireccion }}</dd></div>
              <div><dt>Estado del cliente</dt><dd>{{ detalle.estado || '—' }}</dd></div>
              <div><dt>Historial de compras</dt><dd>{{ detalle.historialCompras || '—' }}</dd></div>
              <div><dt>Fecha de registro</dt><dd>{{ detalle.fechaRegistro || '—' }}</dd></div>
              <div><dt>Auditoría</dt><dd>{{ detalle.fechaAuditoria || '—' }} {{ detalle.usuarioAuditoria || '' }}</dd></div>
              <div><dt>Código QR</dt><dd>{{ detalle.qrCode ? 'Base64 disponible' : 'No registrado' }}</dd></div>
            </dl>
          </section>
        }

        @if (mensajeAccion()) {
          <p class="status" role="status">{{ mensajeAccion() }}</p>
        }

        @if (errorAccion()) {
          <p class="error" role="alert">{{ errorAccion() }}</p>
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
                  <th scope="col">Nombre</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Dirección</th>
                  <th scope="col">Estado de dirección</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha de registro</th>
                </tr>
              </thead>
              <tbody>
                @for (cliente of clientes(); track cliente.idCliente) {
                  <tr>
                    <td>
                      <button
                        class="edit-button"
                        type="button"
                        [disabled]="guardando() || consultandoId() !== null || eliminandoId() !== null"
                        [attr.aria-label]="'Consultar cliente ' + cliente.nombre"
                        (click)="consultar(cliente)"
                      >
                        Ver
                      </button>
                      <button
                        class="edit-button"
                        type="button"
                        [disabled]="guardando() || eliminandoId() !== null"
                        [attr.aria-label]="'Editar cliente ' + cliente.nombre"
                        (click)="iniciarEdicion(cliente)"
                      >
                        Editar
                      </button>
                      @if (confirmandoEliminarId() === cliente.idCliente) {
                        <button class="delete-button" type="button"
                          [disabled]="eliminandoId() !== null"
                          [attr.aria-label]="'Confirmar eliminación del cliente ' + cliente.nombre"
                          (click)="eliminarCliente(cliente)">
                          {{ eliminandoId() === cliente.idCliente ? 'Eliminando...' : 'Confirmar' }}
                        </button>
                        <button class="edit-button" type="button"
                          [disabled]="eliminandoId() !== null"
                          (click)="cancelarEliminacion()">Cancelar</button>
                      } @else {
                        <button class="delete-button" type="button"
                          [disabled]="guardando() || eliminandoId() !== null"
                          [attr.aria-label]="'Eliminar cliente ' + cliente.nombre"
                          (click)="solicitarEliminacion(cliente)">
                          Eliminar
                        </button>
                      }
                    </td>
                    <td>{{ cliente.idCliente }}</td>
                    <td>{{ cliente.nombre }}</td>
                    <td>{{ cliente.telefono }}</td>
                    <td>{{ cliente.correo }}</td>
                    <td>{{ cliente.direccion || '—' }}</td>
                    <td>{{ cliente.estadoDireccion }}</td>
                    <td>{{ cliente.estado || '—' }}</td>
                    <td>{{ cliente.fechaRegistro || '—' }}</td>
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
      color: #172b4d;
      background: #f4f7fb;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(1400px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0;
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
      font-size: 30px;
      font-weight: 650;
    }

    .client-list {
      margin-top: 32px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
    }

    .edit-form {
      display: grid;
      gap: 18px;
      padding: 24px;
      border-bottom: 1px solid #dbe4f0;
      background: #f7f9fc;
    }

    .edit-heading h3 {
      margin: 0;
      font-size: 17px;
    }

    .edit-heading p {
      margin: 5px 0 0;
      color: #52637a;
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
    .field select,
    .field textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      padding: 8px 10px;
      border: 1px solid #c5d0df;
      border-radius: 4px;
      color: #172b4d;
      background: #ffffff;
      font: inherit;
    }

    .field input:focus-visible,
    .field select:focus-visible,
    .field textarea:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    .field textarea {
      resize: vertical;
    }

    .field-error,
    .field-help {
      margin: 0;
      font-size: 13px;
    }

    .field-error {
      color: #a23b2b;
    }

    .field-help {
      color: #52637a;
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
      color: #172b4d;
      background: #eaf1ff;
    }

    .edit-button {
      padding: 6px 10px;
      border: 1px solid #1d4ed8;
      border-radius: 4px;
      color: #1d4ed8;
      background: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .edit-button:hover:not(:disabled) {
      background: #eff6ff;
    }

    .edit-button:focus-visible,
    .edit-actions .button:focus-visible {
      outline: 3px solid #123b8a;
      outline-offset: 3px;
    }

    .edit-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .delete-button {
      margin-left: 6px;
      padding: 6px 10px;
      border: 1px solid #a23b2b;
      border-radius: 4px;
      color: #a23b2b;
      background: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .delete-button:focus-visible {
      outline: 3px solid #123b8a;
      outline-offset: 3px;
    }

    .delete-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .client-detail {
      padding: 20px 24px;
      border-bottom: 1px solid #dbe4f0;
      background: #f7f9fc;
    }

    .detail-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .detail-heading h3 {
      margin: 0;
      font-size: 17px;
    }

    .client-detail dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 14px;
      margin: 18px 0 0;
    }

    .client-detail dl div {
      min-width: 0;
    }

    .client-detail dt {
      font-weight: 700;
    }

    .client-detail dd {
      margin: 4px 0 0;
      overflow-wrap: anywhere;
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
      border-bottom: 1px solid #dbe4f0;
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
      color: #52637a;
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
      outline: 3px solid #1d4ed8;
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
      color: #123b8a;
      background: #eaf1ff;
    }

    th,
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #dbe4f0;
    }

    th {
      font-weight: 700;
    }

    tbody tr:hover {
      background: #f7f9fc;
    }

    .button {
      display: inline-flex;
      min-height: 42px;
      align-items: center;
      margin-top: 8px;
      padding: 0 16px;
      border-radius: 4px;
      color: #fff;
      background: #1d4ed8;
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
      color: #172b4d;
      background: #eaf1ff;
    }

    .button:focus-visible {
      outline: 3px solid #123b8a;
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

  protected readonly estadosDireccion = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Coahuila',
    'Colima',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'México',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ];
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly editandoId = signal<number | null>(null);
  protected readonly creando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal('');
  protected readonly consultandoId = signal<number | null>(null);
  protected readonly detalleCliente = signal<Cliente | null>(null);
  protected readonly errorConsulta = signal('');
  protected readonly confirmandoEliminarId = signal<number | null>(null);
  protected readonly eliminandoId = signal<number | null>(null);
  protected readonly mensajeAccion = signal('');
  protected readonly errorAccion = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    correo: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/),
      ],
    ],
    direccion: ['', Validators.maxLength(200)],
    estadoDireccion: ['', Validators.required],
    estado: ['activo', [Validators.required, Validators.pattern(/^(activo|inactivo|prospecto)$/)]],
    historialCompras: [''],
    qrCode: ['', Validators.pattern(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)],
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
    this.detalleCliente.set(null);
    this.errorConsulta.set('');
    this.mensajeAccion.set('');
    this.errorAccion.set('');
    this.form.patchValue({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion ?? '',
      estadoDireccion: cliente.estadoDireccion,
      estado: cliente.estado ?? 'activo',
      historialCompras: cliente.historialCompras ?? '',
      qrCode: cliente.qrCode ?? '',
    });
    this.errorEdicion.set('');
    this.editandoId.set(cliente.idCliente);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.creando.set(false);
    this.errorEdicion.set('');
    this.form.reset();
  }

  iniciarNuevo(): void {
    this.form.reset({
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      estadoDireccion: '',
      estado: 'activo',
      historialCompras: '',
      qrCode: '',
    });
    this.editandoId.set(null);
    this.errorEdicion.set('');
    this.mensajeAccion.set('');
    this.errorAccion.set('');
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
            clientes.map((cliente) => (cliente.idCliente === id ? clienteGuardado : cliente)),
          );
        }
        this.guardando.set(false);
        this.cancelarEdicion();
        this.mensajeAccion.set(esNuevo ? 'Cliente creado correctamente.' : 'Cliente actualizado correctamente.');
      },
      error: (response: HttpErrorResponse) => {
        this.errorEdicion.set(
          response.status === 0
            ? 'No se pudo conectar con el backend. Confirma que esté activo en el puerto 8080 y reinicia ng serve para aplicar el proxy.'
            : response.status === 404
              ? 'El cliente ya no existe o no se encontró en el servidor.'
              : response.status === 400
                ? 'El servidor rechazó los datos. Revisa el nombre, correo, teléfono, estado de dirección y código QR.'
                : `No fue posible ${esNuevo ? 'crear el cliente' : 'guardar los cambios'} (HTTP ${response.status}).`,
        );
        this.guardando.set(false);
      },
    });
  }

  consultar(cliente: Cliente): void {
    this.consultandoId.set(cliente.idCliente);
    this.detalleCliente.set(null);
    this.errorConsulta.set('');
    this.clienteService.obtenerPorId(cliente.idCliente).subscribe({
      next: (detalle) => {
        this.detalleCliente.set(detalle);
        this.consultandoId.set(null);
      },
      error: (response: HttpErrorResponse) => {
        this.errorConsulta.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para consultar el cliente.'
            : response.status === 404
              ? 'El cliente no se encontró en el servidor.'
              : `No fue posible consultar el cliente (HTTP ${response.status}).`,
        );
        this.consultandoId.set(null);
      },
    });
  }

  cerrarDetalle(): void {
    this.detalleCliente.set(null);
    this.errorConsulta.set('');
  }

  solicitarEliminacion(cliente: Cliente): void {
    this.confirmandoEliminarId.set(cliente.idCliente);
    this.mensajeAccion.set('');
    this.errorAccion.set('');
  }

  cancelarEliminacion(): void {
    this.confirmandoEliminarId.set(null);
  }

  eliminarCliente(cliente: Cliente): void {
    if (this.confirmandoEliminarId() !== cliente.idCliente || this.eliminandoId() !== null) {
      return;
    }

    this.eliminandoId.set(cliente.idCliente);
    this.errorAccion.set('');
    this.clienteService.eliminar(cliente.idCliente).subscribe({
      next: () => {
        this.clientes.update((clientes) => clientes.filter((item) => item.idCliente !== cliente.idCliente));
        if (this.editandoId() === cliente.idCliente) {
          this.cancelarEdicion();
        }
        if (this.detalleCliente()?.idCliente === cliente.idCliente) {
          this.cerrarDetalle();
        }
        this.confirmandoEliminarId.set(null);
        this.eliminandoId.set(null);
        this.mensajeAccion.set(`Cliente ${cliente.nombre} eliminado correctamente.`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorAccion.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para eliminar el cliente.'
            : response.status === 404
              ? 'El cliente no se encontró en el servidor y no pudo eliminarse.'
              : `No fue posible eliminar el cliente (HTTP ${response.status}).`,
        );
        this.eliminandoId.set(null);
      },
    });
  }

  private obtenerDatosCliente(): ClienteRequest {
    const value = this.form.getRawValue();
    const request: ClienteRequest = {
      nombre: value.nombre,
      telefono: value.telefono,
      correo: value.correo,
      direccion: value.direccion || null,
      estadoDireccion: value.estadoDireccion,
      estado: value.estado,
      historialCompras: value.historialCompras || null,
    };
    if (value.qrCode) {
      request.qrCode = value.qrCode;
    }
    return request;
  }
}
