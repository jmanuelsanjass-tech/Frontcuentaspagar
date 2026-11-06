import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProveedorRequest } from '../models/proveedor.model';
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
      } @else if (errorCarga()) {
        <p class="message message-error" role="alert">{{ errorCarga() }}</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="nombre">Nombre <span aria-hidden="true">*</span></label>
              <input id="nombre" formControlName="nombre" autocomplete="organization" required
                [attr.aria-invalid]="form.controls.nombre.invalid && form.controls.nombre.touched"
                aria-describedby="nombre-error" />
              @if (form.controls.nombre.invalid && form.controls.nombre.touched) {
                <p class="field-error" id="nombre-error">El nombre es obligatorio y no debe exceder 100 caracteres.</p>
              }
            </div>

            <div class="field">
              <label for="telefono">Teléfono <span aria-hidden="true">*</span></label>
              <input id="telefono" type="tel" inputmode="numeric" maxlength="10"
                formControlName="telefono" autocomplete="tel" required
                [attr.aria-invalid]="form.controls.telefono.invalid && form.controls.telefono.touched"
                aria-describedby="telefono-error" />
              @if (form.controls.telefono.invalid && form.controls.telefono.touched) {
                <p class="field-error" id="telefono-error">El teléfono debe tener exactamente 10 dígitos.</p>
              }
            </div>

            <div class="field">
              <label for="correo">Correo electrónico <span aria-hidden="true">*</span></label>
              <input id="correo" type="email" maxlength="100" formControlName="correo" autocomplete="email" required
                [attr.aria-invalid]="form.controls.correo.invalid && form.controls.correo.touched"
                aria-describedby="correo-error" />
              @if (form.controls.correo.invalid && form.controls.correo.touched) {
                <p class="field-error" id="correo-error">
                  @if (form.controls.correo.hasError('required')) {
                    El correo es obligatorio.
                  } @else {
                    Ingresa un correo válido de máximo 100 caracteres. Debe ser único.
                  }
                </p>
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
              <label for="estado">Estado del proveedor <span aria-hidden="true">*</span></label>
              <select id="estado" formControlName="estado" required
                [attr.aria-invalid]="form.controls.estado.invalid && form.controls.estado.touched"
                aria-describedby="estado-error">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              @if (form.controls.estado.invalid && form.controls.estado.touched) {
                <p class="field-error" id="estado-error">El estado debe ser activo o inactivo.</p>
              }
            </div>

            <div class="field">
              <label for="direccion">Dirección</label>
              <input id="direccion" maxlength="200" formControlName="direccion" autocomplete="street-address"
                [attr.aria-invalid]="form.controls.direccion.invalid && form.controls.direccion.touched"
                aria-describedby="direccion-error" />
              @if (form.controls.direccion.invalid && form.controls.direccion.touched) {
                <p class="field-error" id="direccion-error">La dirección no debe exceder 200 caracteres.</p>
              }
            </div>

            <div class="field field-wide">
              <label for="productosSuministrados">Productos suministrados</label>
              <textarea id="productosSuministrados" formControlName="productosSuministrados" rows="3"></textarea>
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
      color: #172b4d;
      background: #f4f7fb;
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

    .back-link {
      color: #1d4ed8;
      font-weight: 600;
      text-decoration: none;
    }

    form {
      padding: 30px;
      border: 1px solid #dbe4f0;
      border-radius: 14px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgb(30 64 175 / 6%);
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
      background: #ffffff;
      font: inherit;
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }

    input[aria-invalid="true"],
    select[aria-invalid="true"] {
      border-color: #a23b2b;
    }

    textarea {
      resize: vertical;
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
      border-top: 1px solid #dbe4f0;
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
      background: #1d4ed8;
    }

    .button-primary:hover:not(:disabled) {
      background: #1e40af;
    }

    .button-primary:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    .button-secondary {
      border-color: #dbe4f0;
      color: #123b8a;
      background: #ffffff;
    }

    .message {
      color: #52637a;
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
    estado: this.formBuilder.nonNullable.control<'activo' | 'inactivo'>('activo', Validators.required),
    productosSuministrados: [''],
  });

  readonly estadosDireccion = [
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
  readonly editando = signal(false);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorCarga = signal<string | null>(null);
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
        this.form.patchValue({
          nombre: proveedor.nombre,
          telefono: proveedor.telefono,
          correo: proveedor.correo,
          direccion: proveedor.direccion ?? '',
          estadoDireccion: proveedor.estadoDireccion,
          estado: proveedor.estado === 'inactivo' ? 'inactivo' : 'activo',
          productosSuministrados: proveedor.productosSuministrados ?? '',
        });
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.errorCarga.set(
          response.status === 0
            ? 'No fue posible conectar con el servidor para cargar el proveedor.'
            : response.status === 404
              ? 'El proveedor no se encontró en el servidor.'
              : `No fue posible cargar el proveedor (HTTP ${response.status}).`,
        );
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const value = this.form.getRawValue();
    const proveedor: ProveedorRequest = {
      nombre: value.nombre,
      telefono: value.telefono,
      correo: value.correo,
      direccion: value.direccion || null,
      estadoDireccion: value.estadoDireccion,
      estado: value.estado,
      productosSuministrados: value.productosSuministrados || null,
    };
    if (this.editando() && this.id !== undefined) {
      this.guardando.set(true);
      this.service.actualizar(this.id, proveedor).subscribe({
        next: () => this.router.navigate(['/proveedores']),
        error: (response: HttpErrorResponse) => {
          this.error.set(this.mensajeError(response, 'actualizar'));
          this.guardando.set(false);
        }
      });
      return;
    }

    this.guardando.set(true);
    this.service.crear(proveedor).subscribe({
      next: () => this.router.navigate(['/proveedores']),
      error: (response: HttpErrorResponse) => {
        this.error.set(this.mensajeError(response, 'crear'));
        this.guardando.set(false);
      }
    });
  }

  private mensajeError(response: HttpErrorResponse, accion: string): string {
    if (response.status === 0) {
      return 'No fue posible conectar con el servidor. Verifica que el backend esté disponible.';
    }
    if (response.status === 404) {
      return 'El proveedor no se encontró en el servidor.';
    }
    if (response.status === 409 || response.status === 400) {
      return 'El servidor rechazó los datos. Verifica que el correo sea válido y único y que los demás campos cumplan las reglas.';
    }
    return `No fue posible ${accion} el proveedor (HTTP ${response.status}).`;
  }
}