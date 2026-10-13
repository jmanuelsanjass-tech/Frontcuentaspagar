import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { deploymentVersion } from '../../environments/deployment-version';

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page">
      <section class="login-card" aria-labelledby="login-title">
        <div class="login-card-header">
          <a class="brand" routerLink="/" aria-label="Volver al menú principal">
            <span class="brand-mark" aria-hidden="true">ERP</span>
            <span>Zapaterías León</span>
          </a>
          <img
            class="erp-illustration"
            ngSrc="/erp-dashboard.svg"
            width="120"
            height="88"
            alt="Ilustración de un panel de gestión ERP"
            priority
          />
        </div>
        <p class="eyebrow">Acceso al sistema</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p class="intro">Ingresa tus credenciales para continuar.</p>

        <form [formGroup]="form" (ngSubmit)="login()" novalidate>
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
              autocomplete="current-password"
              required
              [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
              aria-describedby="password-error"
            />
            @if (form.controls.password.hasError('required') && form.controls.password.touched) {
              <p class="field-error" id="password-error">La contraseña es obligatoria.</p>
            }
          </div>

          @if (error()) {
            <p class="login-error" role="alert">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || cargando()">
            {{ cargando() ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
        <div class="register-footer">
          <p class="register-link">
            ¿No tienes una cuenta? <a routerLink="/register">Regístrate</a>
          </p>
          <span class="version-badge">Version {{ deploymentVersion }}</span>
        </div>
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

    .login-page {
      display: grid;
      min-height: calc(100vh - 76px);
      place-items: center;
      padding: 32px 20px;
    }

    .login-card {
      box-sizing: border-box;
      width: min(420px, 100%);
      padding: 32px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 16px 40px rgb(30 64 175 / 10%);
    }

    .login-card-header {
      display: flex;
      min-height: 88px;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 24px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      margin-top: 2px;
      color: inherit;
      font-size: 15px;
      font-weight: 750;
      text-decoration: none;
    }

    .erp-illustration {
      display: block;
      width: 120px;
      height: 88px;
      object-fit: contain;
    }

    .brand-mark {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border-radius: 9px;
      color: #fff;
      background: #1d4ed8;
      font-size: 12px;
    }

    .brand:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #1d4ed8;
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
      color: #52637a;
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

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border: 1px solid #c5d0df;
      border-radius: 4px;
      color: #172b4d;
      background: #ffffff;
      font: inherit;
    }

    input:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    .field-error,
    .login-error {
      margin: 0;
      color: #a12622;
      font-size: 13px;
    }

    .login-error {
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
      background: #1d4ed8;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: #1e40af;
    }

    button:focus-visible {
      outline: 3px solid #123b8a;
      outline-offset: 3px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .register-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
      margin-top: 22px;
    }

    .register-link {
      margin: 0;
      color: #52637a;
      font-size: 14px;
    }

    .register-link a {
      color: #1d4ed8;
      font-weight: 650;
    }

    .version-badge {
      padding: 4px 8px;
      border: 1px solid #c5d0df;
      border-radius: 999px;
      color: #52637a;
      font-size: 12px;
      font-weight: 650;
      white-space: nowrap;
    }
  `,
})
export class LoginComponent {
  protected readonly deploymentVersion = deploymentVersion;
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.form.invalid || this.cargando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.cargando.set(true);
    const { username, password } = this.form.getRawValue();

    this.auth.login(username, password).subscribe({
      next: () => {
        this.auth.markAuthenticated();
        void this.router.navigate(['/']).finally(() => this.cargando.set(false));
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 401 || response.status === 403
            ? 'Credenciales inválidas. Verifica tu usuario y contraseña.'
            : 'No fue posible iniciar sesión. Verifica que el servidor esté disponible e inténtalo de nuevo.',
        );
        this.cargando.set(false);
      },
    });
  }
}
