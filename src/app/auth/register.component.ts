import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

function getRegistrationErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No se pudo completar el registro. Inténtalo de nuevo.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté activo en el puerto 8080.';
  }

  if (error.status === 404) {
    return 'El servidor no encontró /api/auth/register. Verifica la ruta de registro del backend.';
  }

  if (error.status === 400 || error.status === 409) {
    return (
      getServerMessage(error.error) ??
      'Los datos no fueron aceptados. Verifica el usuario y si ya existe una cuenta con ese nombre.'
    );
  }

  if (error.status === 401 || error.status === 403) {
    return 'El servidor rechazó el registro por falta de autorización. Verifica la configuración de seguridad del backend.';
  }

  return (
    getServerMessage(error.error) ??
    `El servidor no pudo completar el registro (HTTP ${error.status}).`
  );
}

function getServerMessage(body: unknown): string | undefined {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (!isRecord(body)) {
    return undefined;
  }

  for (const key of ['message', 'error', 'detail'] as const) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

@Component({
  selector: 'app-register',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink],
  template: `
    <main class="register-page">
      <section class="register-card" aria-labelledby="register-title">
        <div class="register-card-header">
          <a class="brand" routerLink="/" aria-label="Volver al menú principal">
            <span class="brand-mark" aria-hidden="true">ERP</span>
            <span>Zapaterías León</span>
          </a>
          <img
            class="erp-illustration"
            ngSrc="/erp-dashboard.svg"
            width="96"
            height="70"
            alt="Ilustración de un panel de gestión ERP"
            priority
          />
        </div>
        <p class="eyebrow">Crear una cuenta</p>
        <h1 id="register-title">Registrar usuario</h1>
        <p class="intro">Completa los datos para crear una cuenta.</p>

        <form [formGroup]="form" (ngSubmit)="register()" novalidate>
          <div class="field">
            <label for="username">Usuario</label>
            <input
              id="username"
              formControlName="username"
              autocomplete="username"
              required
              [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
              aria-describedby="username-error"
            />
            @if (form.controls.username.hasError('required') && form.controls.username.touched) {
              <p class="field-error" id="username-error">El usuario es obligatorio.</p>
            }
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              required
              [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
              aria-describedby="password-error"
            />
            @if (form.controls.password.hasError('required') && form.controls.password.touched) {
              <p class="field-error" id="password-error">La contraseña es obligatoria.</p>
            }
          </div>

          <div class="field">
            <label for="rol">Rol</label>
            <select id="rol" formControlName="rol" required>
              <option value="ROLE_USER">Usuario</option>
              <option value="ROLE_ADMIN">Administrador</option>
            </select>
          </div>

          @if (error()) {
            <p class="register-error" role="alert">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || cargando()">
            {{ cargando() ? 'Registrando...' : 'Registrar' }}
          </button>
        </form>

        <p class="login-link">¿Ya tienes una cuenta? <a routerLink="/login">Inicia sesión</a></p>
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

    .register-page {
      display: grid;
      min-height: calc(100vh - 76px);
      place-items: center;
      padding: 32px 20px;
    }

    .register-card {
      box-sizing: border-box;
      width: min(460px, 100%);
      padding: 32px;
      border: 1px solid #e8d8c8;
      border-radius: 14px;
      background: #fffdf9;
      box-shadow: 0 16px 40px rgb(88 52 30 / 10%);
    }

    .register-card-header {
      display: flex;
      min-height: 70px;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 24px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      margin-top: 2px;
      color: inherit;
      font-size: 14px;
      font-weight: 750;
      text-decoration: none;
    }

    .erp-illustration {
      display: block;
      width: 96px;
      height: 70px;
      object-fit: contain;
    }

    .brand-mark {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border-radius: 9px;
      color: #fff;
      background: #843e22;
      font-size: 12px;
    }

    .brand:focus-visible,
    a:focus-visible {
      outline: 3px solid #843e22;
      outline-offset: 3px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #793719;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 650;
    }

    .intro {
      margin: 10px 0 26px;
      color: #69564a;
      font-size: 14px;
    }

    form,
    .field {
      display: grid;
      gap: 8px;
    }

    form {
      gap: 18px;
    }

    label {
      font-size: 14px;
      font-weight: 650;
    }

    input,
    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border: 1px solid #cbb8a7;
      border-radius: 4px;
      color: #34271f;
      background: #fffefa;
      font: inherit;
    }

    input:focus-visible,
    select:focus-visible {
      outline: 3px solid #984923;
      outline-offset: 2px;
    }

    .field-error,
    .register-error {
      margin: 0;
      color: #a12622;
      font-size: 13px;
    }

    .register-error {
      padding: 10px 12px;
      border-radius: 4px;
      background: #fff0e9;
      line-height: 1.45;
    }

    button {
      min-height: 44px;
      border: 0;
      border-radius: 4px;
      color: #fff;
      background: #843e22;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: #6d3019;
    }

    button:focus-visible {
      outline: 3px solid #4a2c1e;
      outline-offset: 3px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .login-link {
      margin: 22px 0 0;
      color: #69564a;
      font-size: 14px;
      text-align: center;
    }

    .login-link a {
      color: #793719;
      font-weight: 650;
    }
  `,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rol: ['ROLE_USER', Validators.required],
  });

  register(): void {
    if (this.form.invalid || this.cargando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.cargando.set(true);
    const { username, password, rol } = this.form.getRawValue();

    this.auth.register(username, password, rol).subscribe({
      next: () => {
        globalThis.alert('Usuario registrado correctamente');
        void this.router.navigate(['/login']).finally(() => this.cargando.set(false));
      },
      error: (error: unknown) => {
        this.error.set(getRegistrationErrorMessage(error));
        this.cargando.set(false);
      },
    });
  }
}
