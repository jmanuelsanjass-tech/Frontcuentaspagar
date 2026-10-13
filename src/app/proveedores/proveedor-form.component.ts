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
<<<<<<< HEAD
      color: #172b4d;
      background: #f4f7fb;
=======
      color: #202a24;
      background: #f5f7f4;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(760px, calc(100% - 40px));
      margin: 0 auto;
<<<<<<< HEAD
      padding: 56px 0 72px;
=======
      padding: 48px 0;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
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
<<<<<<< HEAD
      color: #1d4ed8;
=======
      color: #467458;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
<<<<<<< HEAD
      font-size: clamp(28px, 4vw, 36px);
=======
      font-size: 30px;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-weight: 650;
    }

    .back-link {
<<<<<<< HEAD
      color: #1d4ed8;
=======
      color: #286744;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-weight: 600;
      text-decoration: none;
    }

    form {
<<<<<<< HEAD
      padding: 30px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
=======
      padding: 24px;
      border: 1px solid #d9e0da;
      border-radius: 4px;
      background: #fff;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
<<<<<<< HEAD
      gap: 22px;
=======
      gap: 20px;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
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
<<<<<<< HEAD
      border: 1px solid #c5d0df;
      border-radius: 6px;
      color: #172b4d;
      background: #ffffff;
=======
      border: 1px solid #aebbb1;
      border-radius: 3px;
      color: #202a24;
      background: #fff;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font: inherit;
    }

    input:focus-visible,
    a:focus-visible,
    button:focus-visible {
<<<<<<< HEAD
      outline: 3px solid #1d4ed8;
=======
      outline: 3px solid #d18b2c;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      outline-offset: 2px;
    }

    input[aria-invalid="true"] {
<<<<<<< HEAD
      border-color: #a23b2b;
=======
      border-color: #a33d35;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .field-error {
      margin: 0;
<<<<<<< HEAD
      color: #a23b2b;
=======
      color: #a33d35;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      justify-content: end;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
<<<<<<< HEAD
      border-top: 1px solid #dbe4f0;
=======
      border-top: 1px solid #e6ebe6;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid transparent;
<<<<<<< HEAD
      border-radius: 7px;
=======
      border-radius: 4px;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
      font: inherit;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .button-primary {
      color: #fff;
<<<<<<< HEAD
      background: #1d4ed8;
    }

    .button-primary:hover:not(:disabled) {
      background: #1e40af;
=======
      background: #286744;
    }

    .button-primary:hover:not(:disabled) {
      background: #1d5235;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    }

    .button-primary:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .button-secondary {
<<<<<<< HEAD
      border-color: #dbe4f0;
      color: #123b8a;
      background: #ffffff;
    }

    .message {
      color: #52637a;
    }

    .message-error {
      color: #a23b2b;
=======
      border-color: #aebbb1;
      color: #34443a;
      background: #fff;
    }

    .message {
      color: #536258;
    }

    .message-error {
      color: #a33d35;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
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
<<<<<<< HEAD
        padding: 20px;
=======
        padding: 18px;
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
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