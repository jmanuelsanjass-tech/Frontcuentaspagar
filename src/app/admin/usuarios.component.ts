import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  EventoBitacoraUsuario,
  RolUsuario,
  UsuarioAdministracion,
  UsuarioAdminService,
} from '../services/usuario-admin.service';

@Component({
  selector: 'app-usuarios',
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <main class="admin-page">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Administración</p>
          <h1>Usuarios</h1>
          <p class="intro">Administra cuentas, estados, contraseñas y roles.</p>
        </div>
        <button class="secondary-button" type="button" (click)="nuevoUsuario()">
          Nuevo usuario
        </button>
      </header>

      @if (mensaje()) {
        <p class="notice" role="status">{{ mensaje() }}</p>
      }
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      <section class="panel" aria-labelledby="users-heading">
        <div class="section-heading">
          <h2 id="users-heading">Cuentas registradas</h2>
          @if (cargando()) {
            <p role="status">Cargando usuarios…</p>
          }
        </div>
        @if (usuarios().length > 0) {
          <div class="table-scroll" role="region" aria-label="Usuarios registrados" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Roles</th>
                  <th scope="col">Alta</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (usuario of usuarios(); track usuario.idUsuario) {
                  <tr>
                    <th scope="row">{{ usuario.username }}</th>
                    <td>
                      <span class="status" [class.status-inactive]="!usuario.activo">
                        {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>{{ nombresRoles(usuario.roles) }}</td>
                    <td>{{ usuario.fechaAlta ? (usuario.fechaAlta | date: 'mediumDate') : '—' }}</td>
                    <td>
                      <div class="row-actions">
                        <button
                          class="text-button"
                          type="button"
                          [disabled]="ocupado()"
                          (click)="editarUsuario(usuario)"
                        >Modificar</button>
                        <button
                          class="text-button"
                          type="button"
                          [disabled]="ocupado()"
                          (click)="abrirCambioPassword(usuario)"
                        >Cambiar contraseña</button>
                        <button
                          class="text-button"
                          type="button"
                          [disabled]="ocupado()"
                          (click)="cambiarEstado(usuario)"
                        >{{ usuario.activo ? 'Desactivar' : 'Activar' }}</button>
                      </div>
                    </td>
                  </tr>
                  @if (usuarioPasswordId() === usuario.idUsuario) {
                    <tr>
                      <td colspan="5">
                        <form class="password-form" [formGroup]="passwordForm" (ngSubmit)="guardarPassword()">
                          <label [for]="'new-password-' + usuario.idUsuario">
                            Nueva contraseña para {{ usuario.username }}
                          </label>
                          <input
                            [id]="'new-password-' + usuario.idUsuario"
                            type="password"
                            formControlName="password"
                            autocomplete="new-password"
                            required
                          />
                          <button type="submit" [disabled]="passwordForm.invalid || ocupado()">
                            Guardar contraseña
                          </button>
                          <button class="text-button" type="button" (click)="cerrarCambioPassword()">
                            Cancelar
                          </button>
                        </form>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        } @else if (!cargando()) {
          <p class="empty-state">No hay usuarios registrados.</p>
        }
      </section>

      @if (formVisible()) {
        <section class="panel form-panel" aria-labelledby="form-heading">
          <div class="section-heading">
            <h2 id="form-heading">
              {{ usuarioEdicionId() === null ? 'Alta de usuario' : 'Modificar usuario' }}
            </h2>
            <button class="text-button" type="button" (click)="cancelarEdicion()">Cancelar</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="guardarUsuario()">
            <div class="form-grid">
              <div class="field">
                <label for="username">Nombre de usuario</label>
                <input id="username" formControlName="username" autocomplete="off" required />
              </div>
              @if (usuarioEdicionId() === null) {
                <div class="field">
                  <label for="initial-password">Contraseña inicial</label>
                  <input
                    id="initial-password"
                    type="password"
                    formControlName="password"
                    autocomplete="new-password"
                    required
                  />
                </div>
              } @else {
                <label class="checkbox-field">
                  <input type="checkbox" formControlName="activo" />
                  Usuario activo
                </label>
              }
            </div>
            <fieldset>
              <legend>Roles asignados</legend>
              @if (roles().length > 0) {
                <div class="roles-grid">
                  @for (rol of roles(); track rol.idRol) {
                    <label class="checkbox-field" [for]="'role-' + rol.idRol">
                      <input
                        [id]="'role-' + rol.idRol"
                        type="checkbox"
                        [checked]="form.controls.roles.value.includes(rol.idRol)"
                        (change)="alternarRol(rol.idRol, $event)"
                      />
                      <span>{{ rol.nombre }}</span>
                      @if (rol.descripcion) {
                        <small>{{ rol.descripcion }}</small>
                      }
                    </label>
                  }
                </div>
              } @else {
                <p class="empty-state">No hay roles disponibles.</p>
              }
            </fieldset>
            <div class="form-actions">
              <button type="submit" [disabled]="form.invalid || ocupado()">
                {{ guardando() ? 'Guardando…' : 'Guardar usuario' }}
              </button>
              <button class="secondary-button" type="button" (click)="cancelarEdicion()">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      }

      <section class="panel" aria-labelledby="audit-heading">
        <div class="section-heading">
          <div>
            <h2 id="audit-heading">Bitácora de administración</h2>
            <p class="subheading">Últimos {{ bitacora().length }} eventos.</p>
          </div>
          <button class="secondary-button" type="button" [disabled]="cargando()" (click)="cargarDatos()">
            Actualizar
          </button>
        </div>
        @if (bitacora().length > 0) {
          <div class="table-scroll" role="region" aria-label="Eventos de administración" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Administrador</th>
                  <th scope="col">Usuario afectado</th>
                  <th scope="col">Acción</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                @for (evento of bitacora(); track evento.idEvento) {
                  <tr>
                    <td>{{ evento.fechaEvento ? (evento.fechaEvento | date: 'short') : '—' }}</td>
                    <td>{{ evento.administrador }}</td>
                    <td>{{ evento.usernameObjetivo }}</td>
                    <td>{{ etiquetaAccion(evento.accion) }}</td>
                    <td>{{ evento.detalle || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!cargando()) {
          <p class="empty-state">La bitácora aún no contiene eventos.</p>
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

    .admin-page {
      display: grid;
      width: min(1200px, calc(100% - 40px));
      gap: 20px;
      margin: 0 auto;
      padding: 38px 0 64px;
    }

    .page-heading,
    .section-heading,
    .form-actions,
    .row-actions,
    .password-form {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-heading,
    .section-heading {
      justify-content: space-between;
    }

    .eyebrow {
      margin: 0 0 6px;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1,
    h2,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 6px;
      font-size: clamp(28px, 4vw, 36px);
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
    }

    .intro,
    .subheading {
      margin-bottom: 0;
      color: #52637a;
    }

    .panel {
      min-width: 0;
      padding: 22px;
      border: 1px solid #dbe4f0;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 5px 18px rgb(30 64 175 / 4%);
    }

    .section-heading {
      margin-bottom: 16px;
    }

    .table-scroll {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th,
    td {
      padding: 12px 10px;
      border-bottom: 1px solid #e5eaf2;
      vertical-align: top;
    }

    thead th {
      color: #52637a;
      font-size: 13px;
      font-weight: 700;
    }

    tbody th {
      font-weight: 650;
    }

    .status {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      color: #166534;
      background: #dcfce7;
      font-size: 12px;
      font-weight: 700;
    }

    .status-inactive {
      color: #8b1d19;
      background: #fff0e9;
    }

    .row-actions {
      flex-wrap: wrap;
    }

    button,
    input {
      font: inherit;
    }

    button {
      min-height: 40px;
      padding: 0 13px;
      border: 0;
      border-radius: 5px;
      color: #fff;
      background: #1d4ed8;
      font-weight: 650;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: #1e40af;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .secondary-button {
      border: 1px solid #c5d0df;
      color: #1d4ed8;
      background: #fff;
    }

    .secondary-button:hover:not(:disabled) {
      background: #eaf1ff;
    }

    .text-button {
      min-height: 34px;
      padding: 0 6px;
      color: #1d4ed8;
      background: transparent;
      font-size: 13px;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .text-button:hover:not(:disabled) {
      color: #1e40af;
      background: #eaf1ff;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .field {
      display: grid;
      gap: 7px;
    }

    .field label,
    .password-form label {
      font-weight: 650;
    }

    input:not([type="checkbox"]) {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 9px 11px;
      border: 1px solid #c5d0df;
      border-radius: 5px;
      color: #172b4d;
      background: #fff;
    }

    fieldset {
      margin: 0;
      padding: 14px;
      border: 1px solid #dbe4f0;
      border-radius: 8px;
    }

    legend {
      padding: 0 6px;
      font-weight: 700;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
    }

    .checkbox-field {
      display: flex;
      min-width: 0;
      align-items: center;
      flex-wrap: wrap;
      gap: 7px;
    }

    .checkbox-field input {
      width: 18px;
      height: 18px;
      accent-color: #1d4ed8;
    }

    .checkbox-field small {
      flex-basis: 100%;
      padding-left: 25px;
      color: #52637a;
    }

    .form-actions {
      margin-top: 18px;
    }

    .password-form {
      flex-wrap: wrap;
    }

    .password-form label {
      flex-basis: 100%;
    }

    .password-form input {
      max-width: 300px;
    }

    .notice,
    .error {
      margin: 0;
      padding: 12px 14px;
      border-radius: 6px;
    }

    .notice {
      color: #166534;
      background: #dcfce7;
    }

    .error {
      color: #8b1d19;
      background: #fff0e9;
    }

    .empty-state {
      margin-bottom: 0;
      color: #52637a;
    }

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .page-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .panel {
        padding: 16px;
      }
    }
  `,
})
export class UsuariosComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(UsuarioAdminService);

  protected readonly usuarios = signal<UsuarioAdministracion[]>([]);
  protected readonly roles = signal<RolUsuario[]>([]);
  protected readonly bitacora = signal<EventoBitacoraUsuario[]>([]);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly accionandoId = signal<number | null>(null);
  protected readonly usuarioEdicionId = signal<number | null>(null);
  protected readonly usuarioPasswordId = signal<number | null>(null);
  protected readonly formVisible = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly ocupado = computed(
    () => this.cargando() || this.guardando() || this.accionandoId() !== null,
  );
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    activo: true,
    roles: this.formBuilder.nonNullable.control<number[]>([]),
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    password: ['', Validators.required],
  });

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      usuarios: this.service.listarUsuarios(),
      roles: this.service.listarRoles(),
      bitacora: this.service.listarBitacora(),
    }).subscribe({
      next: (resultado) => {
        this.usuarios.set(resultado.usuarios);
        this.roles.set(resultado.roles);
        this.bitacora.set(resultado.bitacora);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.mensajeError(error, 'No se pudieron cargar usuarios, roles y bitácora.'));
        this.cargando.set(false);
      },
    });
  }

  nuevoUsuario(): void {
    this.usuarioEdicionId.set(null);
    this.form.reset({ username: '', password: '', activo: true, roles: [] });
    this.form.controls.password.addValidators(Validators.required);
    this.form.controls.password.updateValueAndValidity();
    this.formVisible.set(true);
    this.mensaje.set('');
  }

  editarUsuario(usuario: UsuarioAdministracion): void {
    this.usuarioEdicionId.set(usuario.idUsuario);
    this.form.reset({
      username: usuario.username,
      password: '',
      activo: usuario.activo,
      roles: usuario.roles.map((rol) => rol.idRol),
    });
    this.form.controls.password.removeValidators(Validators.required);
    this.form.controls.password.updateValueAndValidity();
    this.formVisible.set(true);
    this.mensaje.set('');
  }

  cancelarEdicion(): void {
    this.formVisible.set(false);
    this.usuarioEdicionId.set(null);
  }

  alternarRol(idRol: number, event: Event): void {
    const seleccionado = (event.target as HTMLInputElement).checked;
    const rolesActuales = this.form.controls.roles.value;
    this.form.controls.roles.setValue(
      seleccionado
        ? [...rolesActuales, idRol]
        : rolesActuales.filter((rol) => rol !== idRol),
    );
  }

  guardarUsuario(): void {
    if (this.form.invalid || this.ocupado()) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.guardando.set(true);
    const valor = this.form.getRawValue();
    const id = this.usuarioEdicionId();
    const solicitud = id === null
      ? this.service.crearUsuario({
          username: valor.username.trim(),
          password: valor.password,
          activo: valor.activo,
          roles: valor.roles,
        })
      : this.service.actualizarUsuario(id, {
          username: valor.username.trim(),
          activo: valor.activo,
          roles: valor.roles,
        });

    solicitud.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set(id === null ? 'Usuario creado.' : 'Usuario actualizado.');
        this.cancelarEdicion();
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.error.set(this.mensajeError(error, 'No se pudo guardar el usuario.'));
        this.guardando.set(false);
      },
    });
  }

  cambiarEstado(usuario: UsuarioAdministracion): void {
    if (this.ocupado()) {
      return;
    }
    this.error.set('');
    this.mensaje.set('');
    this.accionandoId.set(usuario.idUsuario);
    const nuevoEstado = !usuario.activo;
    this.service.cambiarEstado(usuario.idUsuario, nuevoEstado).subscribe({
      next: () => {
        this.accionandoId.set(null);
        this.mensaje.set(nuevoEstado ? 'Usuario activado.' : 'Usuario desactivado.');
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.error.set(this.mensajeError(error, 'No se pudo cambiar el estado del usuario.'));
        this.accionandoId.set(null);
      },
    });
  }

  abrirCambioPassword(usuario: UsuarioAdministracion): void {
    this.usuarioPasswordId.set(usuario.idUsuario);
    this.passwordForm.reset({ password: '' });
    this.error.set('');
  }

  cerrarCambioPassword(): void {
    this.usuarioPasswordId.set(null);
    this.passwordForm.reset({ password: '' });
  }

  guardarPassword(): void {
    const id = this.usuarioPasswordId();
    if (id === null || this.passwordForm.invalid || this.ocupado()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.accionandoId.set(id);
    this.service.cambiarPassword(id, this.passwordForm.getRawValue().password).subscribe({
      next: () => {
        this.accionandoId.set(null);
        this.cerrarCambioPassword();
        this.mensaje.set('Contraseña actualizada.');
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.error.set(this.mensajeError(error, 'No se pudo cambiar la contraseña.'));
        this.accionandoId.set(null);
      },
    });
  }

  nombresRoles(roles: RolUsuario[]): string {
    return roles.map((rol) => rol.nombre).join(', ') || 'Sin roles';
  }

  etiquetaAccion(accion: string): string {
    const etiquetas: Record<string, string> = {
      USER_CREATED: 'Alta',
      USER_UPDATED: 'Modificación',
      PASSWORD_CHANGED: 'Cambio de contraseña',
      USER_ACTIVATED: 'Activación',
      USER_DEACTIVATED: 'Desactivación',
      ROLES_CHANGED: 'Asignación de roles',
      USER_DELETED: 'Eliminación',
    };
    return etiquetas[accion] ?? accion;
  }

  private mensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Tu sesión no tiene autorización para administrar usuarios.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      if (
        typeof error.error === 'object' &&
        error.error !== null &&
        'detail' in error.error &&
        typeof error.error.detail === 'string'
      ) {
        return error.error.detail;
      }
    }
    return fallback;
  }
}
