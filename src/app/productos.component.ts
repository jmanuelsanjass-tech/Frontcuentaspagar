import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  activo: boolean;
  fechaAlta: string;
}

@Component({
  selector: 'app-productos',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    <main class="page">
      <p class="eyebrow">Inventario</p>
      <h1>Productos</h1>

      <section class="product-list" aria-labelledby="productos-title">
        <div class="section-heading">
          <div>
            <h2 id="productos-title">Catálogo de productos</h2>
            <p>Administra el inventario, precios y disponibilidad.</p>
          </div>
          <div class="heading-actions">
            <button class="button" type="button" [disabled]="guardando()" (click)="iniciarNuevo()">
              Nuevo producto
            </button>
            <a routerLink="/" class="button secondary">Volver al menú principal</a>
          </div>
        </div>

        @if (creando() || editandoId() !== null) {
          <form class="edit-form" [formGroup]="form" (ngSubmit)="guardarProducto()">
            <div class="edit-heading">
              @if (creando()) {
                <h3>Nuevo producto</h3>
                <p>Registra un nuevo artículo para tu inventario.</p>
              } @else {
                <h3>Editar producto #{{ editandoId() }}</h3>
                <p>Actualiza la información del producto y guarda los cambios.</p>
              }
            </div>

            <div class="edit-fields">
              <div class="field">
                <label for="nombre">Nombre</label>
                <input id="nombre" formControlName="nombre" required />
              </div>

              <div class="field">
                <label for="categoria">Categoría</label>
                <input id="categoria" formControlName="categoria" required />
              </div>

              <div class="field">
                <label for="precio">Precio</label>
                <input id="precio" type="number" min="0" step="0.01" formControlName="precio" required />
              </div>

              <div class="field">
                <label for="stock">Stock</label>
                <input id="stock" type="number" min="0" step="1" formControlName="stock" required />
              </div>

              <div class="field field-wide">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" rows="4" formControlName="descripcion"></textarea>
              </div>

              <div class="field checkbox-field">
                <label for="activo">
                  <input id="activo" type="checkbox" formControlName="activo" />
                  Producto activo
                </label>
              </div>
            </div>

            @if (errorEdicion()) {
              <p class="error edit-error" role="alert">{{ errorEdicion() }}</p>
            }

            <div class="edit-actions">
              <button class="button" type="submit" [disabled]="form.invalid || guardando()">
                {{ guardando() ? 'Guardando...' : creando() ? 'Crear producto' : 'Guardar cambios' }}
              </button>
              <button class="button secondary" type="button" [disabled]="guardando()" (click)="cancelarEdicion()">
                Cancelar
              </button>
            </div>
          </form>
        }

        @if (productos().length === 0) {
          <p class="status">No hay productos registrados.</p>
        } @else {
          <div class="table-scroll" role="region" aria-label="Grid de productos" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th scope="col">Acciones</th>
                  <th scope="col">ID</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha de alta</th>
                </tr>
              </thead>
              <tbody>
                @for (producto of productos(); track producto.id) {
                  <tr>
                    <td>
                      <button
                        class="edit-button"
                        type="button"
                        [disabled]="guardando()"
                        [attr.aria-label]="'Editar producto ' + producto.nombre"
                        (click)="iniciarEdicion(producto)"
                      >
                        Editar
                      </button>
                    </td>
                    <td>{{ producto.id }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.categoria }}</td>
                    <td>{{ producto.descripcion || '—' }}</td>
                    <td>{{ producto.precio | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
                    <td>{{ producto.stock }}</td>
                    <td>
                      <span class="status-pill" [class.inactive]="!producto.activo">
                        {{ producto.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>{{ producto.fechaAlta }}</td>
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
      padding: 32px 0 48px;
      color: #34271f;
      background: #fbf5ed;
      font-family: 'Segoe UI', sans-serif;
    }

    .page {
      width: min(1180px, calc(100% - 40px));
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: #843e22;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(30px, 4vw, 40px);
      font-weight: 650;
    }

    .product-list {
      margin-top: 24px;
      border: 1px solid #e8d8c8;
      border-radius: 14px;
      background: #fffdf9;
      overflow: hidden;
      box-shadow: 0 10px 30px rgb(88 52 30 / 6%);
    }

    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px 24px;
      border-bottom: 1px solid #eadfd3;
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

    h2 {
      margin: 0;
      font-size: 19px;
    }

    .heading-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .button {
      display: inline-flex;
      min-height: 42px;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border: 0;
      border-radius: 4px;
      color: #fff;
      background: #843e22;
      font-weight: 650;
      text-decoration: none;
      cursor: pointer;
    }

    .button.secondary {
      color: #34271f;
      background: #f1e4d8;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .button:focus-visible {
      outline: 3px solid #4a2c1e;
      outline-offset: 3px;
    }

    .edit-form {
      padding: 24px;
      border-bottom: 1px solid #eadfd3;
      background: #fcf8f2;
    }

    .edit-heading h3 {
      margin: 0;
      font-size: 20px;
    }

    .edit-heading p {
      margin: 6px 0 20px;
      color: #69564a;
    }

    .edit-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-wide {
      grid-column: 1 / -1;
    }

    .checkbox-field {
      justify-content: flex-end;
    }

    .checkbox-field label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }

    label {
      font-size: 14px;
      font-weight: 600;
    }

    input,
    textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #cbb8a7;
      border-radius: 4px;
      color: #34271f;
      background: #fffefa;
      font: inherit;
    }

    textarea {
      resize: vertical;
      min-height: 110px;
    }

    input:focus-visible,
    textarea:focus-visible {
      outline: 3px solid #984923;
      outline-offset: 2px;
    }

    .edit-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }

    .error {
      color: #a12622;
    }

    .edit-error {
      margin-top: 16px;
    }

    .table-scroll {
      overflow: auto;
      max-height: min(70vh, 720px);
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

    .edit-button:focus-visible {
      outline: 3px solid #4a2c1e;
      outline-offset: 3px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 999px;
      background: #f8eadd;
      color: #793719;
      font-size: 12px;
      font-weight: 700;
    }

    .status-pill.inactive {
      background: #f3f5f3;
      color: #5d665f;
    }

    .status {
      padding: 24px;
    }

    @media (max-width: 640px) {
      .section-heading {
        flex-direction: column;
        align-items: flex-start;
        padding: 18px;
      }

      .edit-fields {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProductosComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly productos = signal<Producto[]>([
    {
      id: 1,
      nombre: 'Cuaderno Profesional',
      descripcion: 'Cuaderno de 100 hojas, tapa dura, rayado.',
      categoria: 'Papelería',
      precio: 95,
      stock: 32,
      activo: true,
      fechaAlta: '2026-10-01',
    },
    {
      id: 2,
      nombre: 'Bolsa de tinta negra',
      descripcion: 'Cartucho recargable para impresora láser.',
      categoria: 'Consumibles',
      precio: 220,
      stock: 12,
      activo: true,
      fechaAlta: '2026-10-02',
    },
    {
      id: 3,
      nombre: 'Mouse inalámbrico',
      descripcion: 'Ergonómico para oficina, 2.4 GHz.',
      categoria: 'Tecnología',
      precio: 420,
      stock: 8,
      activo: false,
      fechaAlta: '2026-10-03',
    },
  ]);

  protected readonly editandoId = signal<number | null>(null);
  protected readonly creando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.maxLength(250)]],
    categoria: ['', [Validators.required, Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    activo: [true],
  });

  iniciarNuevo(): void {
    this.form.reset({
      nombre: '',
      descripcion: '',
      categoria: 'Papelería',
      precio: 0,
      stock: 0,
      activo: true,
    });
    this.errorEdicion.set('');
    this.editandoId.set(null);
    this.creando.set(true);
  }

  iniciarEdicion(producto: Producto): void {
    this.creando.set(false);
    this.form.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      activo: producto.activo,
    });
    this.errorEdicion.set('');
    this.editandoId.set(producto.id);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.creando.set(false);
    this.errorEdicion.set('');
    this.form.reset();
  }

  guardarProducto(): void {
    const id = this.editandoId();
    const esNuevo = this.creando();

    if (this.form.invalid || this.guardando() || (!esNuevo && id === null)) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set('');
    const productoActual = this.obtenerDatosProducto();

    if (esNuevo) {
      const nuevoProducto: Producto = {
        ...productoActual,
        id: this.obtenerSiguienteId(),
        fechaAlta: new Date().toISOString().slice(0, 10),
      };
      this.productos.update((productos) => [nuevoProducto, ...productos]);
      this.guardando.set(false);
      this.cancelarEdicion();
      return;
    }

    if (id !== null) {
      this.productos.update((productos) =>
        productos.map((producto) =>
          producto.id === id
            ? { ...producto, ...productoActual, fechaAlta: producto.fechaAlta }
            : producto,
        ),
      );
      this.guardando.set(false);
      this.cancelarEdicion();
    }
  }

  private obtenerSiguienteId(): number {
    return this.productos().reduce((max, producto) => Math.max(max, producto.id), 0) + 1;
  }

  private obtenerDatosProducto(): Omit<Producto, 'id' | 'fechaAlta'> {
    const value = this.form.getRawValue();
    return {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
      categoria: value.categoria.trim(),
      precio: Number(value.precio),
      stock: Number(value.stock),
      activo: value.activo,
    };
  }
}
