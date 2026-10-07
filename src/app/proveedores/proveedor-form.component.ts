import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../services/proveedor.service';

@Component({
  selector: 'app-proveedor-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Directorio</p>
          <h1>{{ editando() ? 'Editar proveedor' : 'Nuevo proveedor' }}</h1>
        </div>
        <a routerLink="/proveedores" class="back-link">Volver al listado</a>
      </header>

      @if (cargando()) {
        <p class="message" role="status">Cargando proveedor...</p>
      } @else if (error()) {
        <p class="message message-error" role="alert">{{ error() }}</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="nombre">Nombre <span aria-hidden="true">*</span></label>
              <input id="nombre" formControlName="nombre" autocomplete="organization" required
                [attr.aria-invalid]="form.controls.nombre.invalid && form.controls.nombre.touched"
                aria-describedby="nombre-error" />
              @if (form.controls.nombre.hasError('required') && form.controls.nombre.touched) {
                <p class="field-error" id="nombre-error">El nombre es obligatorio.</p>
              }
            </div>

            <div class="field">
              <label for="ruc">RUC <span aria-hidden="true">*</span></label>
              <input id="ruc" formControlName="ruc" autocomplete="off" required
                [attr.aria-invalid]="form.controls.ruc.invalid && form.controls.ruc.touched"
                aria-describedby="ruc-error" />
              @if (form.controls.ruc.touched && form.controls.ruc.invalid) {
                <p class="field-error" id="ruc-error">
                  @if (form.controls.ruc.hasError('required')) {
                    El RUC es obligatorio.
                  } @else if (form.controls.ruc.hasError('minlength')) {
                    El RUC debe tener al menos 11 caracteres.
                  }
                </p>
              }
            </div>

            <div class="field">
              <label for="telefono">Teléfono <span aria-hidden="true">*</span></label>
              <input id="telefono" type="tel" formControlName="telefono" autocomplete="tel" required
                [attr.aria-invalid]="form.controls.telefono.invalid && form.controls.telefono.touched"
                aria-describedby="telefono-error" />
              @if (form.controls.telefono.hasError('required') && form.controls.telefono.touched) {
                <p class="field-error" id="telefono-error">El teléfono es obligatorio.</p>
              }
            </div>

            <div class="field">
              <label for="email">Email <span aria-hidden="true">*</span></label>
              <input id="email" type="email" formControlName="email" autocomplete="email" required
                [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched"
                aria-describedby="email-error" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <p class="field-error" id="email-error">
                  @if (form.controls.email.hasError('required')) {
                    El email es obligatorio.
                  } @else if (form.controls.email.hasError('email')) {
                    Ingresa un email válido.
                  }
                </p>
              }
            </div>

            <div class="field field-wide">
              <label for="direccion">Dirección</label>
              <input id="direccion" formControlName="direccion" autocomplete="street-address" />
            </div>
          </div>

          @if (error()) {
            <p class="message message-error" role="alert">{{ error() }}</p>
          }

          <div class="form-actions">
            <a routerLink="/proveedores" class="button button-secondary">Cancelar</a>
            <button type="submit" class="button button-primary" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : 'Guardar proveedor' }}
            </button>
          </div>
        </form>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      color: #34271f;
      background: #fbf5ed;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(760px, calc(100% - 40px));
      margin: 0 auto;
      padding: 56px 0 72px;
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
      color: #843e22;
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
      color: #843e22;
      font-weight: 600;
      text-decoration: none;
    }

    form {
      padding: 30px;
      border: 1px solid #e8d8c8;
      border-radius: 14px;
      background: #fffdf9;
      box-shadow: 0 10px 30px rgb(88 52 30 / 6%);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
    }

    .field {
      display: grid;
      align-content: start;
      gap: 7px;
    }

    .field-wide {
      grid-column: 1 / -1;
    }

    label {
      font-size: 14px;
      font-weight: 650;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: 42px;
      padding: 9px 11px;
      border: 1px solid #cbb8a7;
      border-radius: 6px;
      color: #34271f;
      background: #fffefa;
      font: inherit;
    }

    input:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid #984923;
      outline-offset: 2px;
    }

    input[aria-invalid="true"] {
      border-color: #a23b2b;
    }

    .field-error {
      margin: 0;
      color: #a23b2b;
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #eee3d8;
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
      background: #843e22;
    }

    .button-primary:hover:not(:disabled) {
      background: #6d3019;
    }

    .button-primary:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .button-secondary {
      border-color: #e2d2c1;
      color: #4a2c1e;
      background: #fffdf9;
    }

    .message {
      color: #69564a;
    }

    .message-error {
      color: #a23b2b;
    }

    @media (max-width: 600px) {
      .page {
        width: min(100% - 28px, 760px);
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
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .field-wide {
        grid-column: auto;
      }
    }
  `
})
export class ProveedorFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(ProveedorService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    ruc: ['', [Validators.required, Validators.minLength(11)]],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['']
  });

  readonly editando = signal(false);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  private id?: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      return;
    }

    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('El identificador del proveedor no es válido.');
      return;
    }

    this.id = id;
    this.editando.set(true);
    this.cargando.set(true);
    this.service.obtener(id).subscribe({
      next: (proveedor) => {
        this.form.patchValue(proveedor);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar el proveedor.');
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const proveedor = this.form.getRawValue();
    if (this.editando() && this.id !== undefined) {
      this.guardando.set(true);
      this.service.actualizar(this.id, proveedor).subscribe({
        next: () => this.router.navigate(['/proveedores']),
        error: () => {
          this.error.set('No fue posible actualizar el proveedor.');
          this.guardando.set(false);
        }
      });
      return;
    }

    this.guardando.set(true);
    this.service.crear(proveedor).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: () => {
        this.error.set('No fue posible guardar el proveedor.');
        this.guardando.set(false);
      }
    });
  }
}