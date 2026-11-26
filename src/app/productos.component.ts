import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoResponse, ProductoRequest, ProductoService } from './services/producto.service';
import { ProveedorService } from '../app/services/proveedor.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Adaptamos la interfaz al backend
interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  activo: boolean;
  fechaAlta: string;

  idProveedor: number | null;
  nombreProveedor: string;
}

  interface ProveedorBusqueda {
  idProveedor: number;
  nombre: string;
  telefono?: string;
  correo?: string;
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
              <!-- NUEVO CAMPO DE CÓDIGO DE BARRAS -->
              <div class="field">
                <label for="codigoBarras">Código de barras <span aria-hidden="true">*</span></label>
                <input id="codigoBarras" formControlName="codigoBarras" required maxlength="13" placeholder="Ej. 7501234567890" />
              </div>

              <div class="field">
                <label for="nombre">Nombre <span aria-hidden="true">*</span></label>
                <input id="nombre" formControlName="nombre" required />
              </div>

              <div class="field">
                <label for="categoria">Categoría <span aria-hidden="true">*</span></label>
                <select id="categoria" formControlName="categoria" required>
                  <option value="" disabled>Selecciona una categoría</option>
                  <option value="Abarrotes secos y enlatados">Abarrotes secos y enlatados</option>
                  <option value="Refrigerados y lácteos">Refrigerados y lácteos</option>
                  <option value="Frutas, verduras y panadería">Frutas, verduras y panadería</option>
                  <option value="Bebidas y botanas">Bebidas y botanas</option>
                  <option value="Limpieza e higiene personal">Limpieza e higiene personal</option>
                </select>
              </div>


              <div class="field provider-field">

            <label for="proveedor">
              Proveedor
              <span aria-hidden="true">*</span>
            </label>

            <input
              id="proveedor"
              type="text"
              formControlName="proveedorNombre"
              placeholder="Buscar proveedor..."
              autocomplete="off"
              (input)="buscarProveedor($event)"
            />

            @if (mostrarProveedores()) {

              <div class="provider-results">

                @for (
                  proveedor of proveedores();
                  track proveedor.idProveedor
                ) {

                  <button
                    type="button"
                    class="provider-item"
                    (click)="seleccionarProveedor(proveedor)">

                    <strong>
                      {{ proveedor.nombre }}
                    </strong>

                    <small>
                      {{ proveedor.telefono }}
                    </small>

                  </button>

                }

              </div>

            }

          </div>

              <div class="field">
                <label for="precio">Precio <span aria-hidden="true">*</span></label>
                <input id="precio" type="number" min="0" step="0.01" formControlName="precio" required />
              </div>

              <div class="field">
                <label for="stock">Stock <span aria-hidden="true">*</span></label>
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
          <p class="status">No hay productos registrados o cargando...</p>
        } @else {
          <div class="table-scroll" role="region" aria-label="Grid de productos" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th scope="col">Acciones</th>
                  <th scope="col">Código de barras</th> <!-- NUEVA COLUMNA -->
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
                    <td>{{ producto.codigoBarras }}</td> <!-- NUEVO DATO -->
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
    :host { display: block; min-height: calc(100vh - 76px); padding: 32px 0 48px; color: #172b4d; background: #f4f7fb; font-family: 'Segoe UI', sans-serif; }
    .page { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }
    .eyebrow { margin: 0 0 10px; color: #1d4ed8; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(30px, 4vw, 40px); font-weight: 650; }
    .product-list { margin-top: 24px; border: 1px solid #dbe4f0; border-radius: 14px; background: #ffffff; overflow: hidden; box-shadow: 0 10px 30px rgb(30 64 175 / 6%); }
    .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 24px; border-bottom: 1px solid #dbe4f0; }
    .section-heading p, .status, .error { margin: 0; color: #52637a; line-height: 1.5; }
    .section-heading p { margin-top: 4px; font-size: 14px; }
    h2 { margin: 0; font-size: 19px; }
    .heading-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; padding: 0 16px; border: 0; border-radius: 4px; color: #fff; background: #1d4ed8; font-weight: 650; text-decoration: none; cursor: pointer; }
    .button.secondary { color: #172b4d; background: #eaf1ff; }
    .button:disabled { cursor: not-allowed; opacity: 0.65; }
    .button:focus-visible { outline: 3px solid #123b8a; outline-offset: 3px; }
    .edit-form { padding: 24px; border-bottom: 1px solid #dbe4f0; background: #f7f9fc; }
    .edit-heading h3 { margin: 0; font-size: 20px; }
    .edit-heading p { margin: 6px 0 20px; color: #52637a; }
    .edit-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 8px; }
    .field-wide { grid-column: 1 / -1; }
    .checkbox-field { justify-content: flex-end; }
    .checkbox-field label { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; }
    label { font-size: 14px; font-weight: 600; }
    input, textarea, select { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #c5d0df; border-radius: 4px; color: #172b4d; background: #ffffff; font: inherit; }
    textarea { resize: vertical; min-height: 110px; }
    input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
    .edit-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
    .error { color: #a12622; }
    .edit-error { margin-top: 16px; }
    .table-scroll { overflow: auto; max-height: min(70vh, 720px); }
    .table-scroll:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
    table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; font-size: 13px; }
    thead { position: sticky; top: 0; z-index: 1; color: #123b8a; background: #eaf1ff; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #dbe4f0; }
    th { font-weight: 700; }
    tbody tr:hover { background: #f7f9fc; }
    .edit-button { padding: 6px 10px; border: 1px solid #1d4ed8; border-radius: 4px; color: #1d4ed8; background: #fff; font: inherit; font-weight: 650; cursor: pointer; }
    .edit-button:hover:not(:disabled) { background: #eff6ff; }
    .edit-button:focus-visible { outline: 3px solid #123b8a; outline-offset: 3px; }
    .status-pill { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 999px; background: #eaf1ff; color: #1d4ed8; font-size: 12px; font-weight: 700; }
    .status-pill.inactive { background: #f3f5f3; color: #5d665f; }
    .status { padding: 24px; }
    @media (max-width: 640px) { .section-heading { flex-direction: column; align-items: flex-start; padding: 18px; } .edit-fields { grid-template-columns: 1fr; } }
  .provider-field {
  position: relative;
}

.provider-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dbe4f0;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,.12);
}

.provider-item {
  width: 100%;
  border: none;
  background: white;
  text-align: left;
  padding: 10px;
  cursor: pointer;
}

.provider-item:hover {
  background: #eff6ff;
}`
  ,

  
})
export class ProductosComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly creando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorEdicion = signal('');
  protected readonly proveedores = signal<ProveedorBusqueda[]>([]);
  protected readonly mostrarProveedores = signal(false);
  private readonly proveedorSearch$ =
  new Subject<string>();
  private readonly proveedorService = inject(ProveedorService);

protected readonly form = this.formBuilder.group({

  codigoBarras: [
    '',
    [Validators.required, Validators.maxLength(13)]
  ],

  nombre: [
    '',
    [Validators.required, Validators.maxLength(120)]
  ],

  descripcion: [
    '',
    [Validators.maxLength(250)]
  ],

  categoria: [
    '',
    [Validators.required]
  ],

  precio: [
    0,
    [Validators.required, Validators.min(0)]
  ],

  stock: [
    0,
    [Validators.required, Validators.min(0)]
  ],

idProveedor: [null as number | null, Validators.required],

  proveedorNombre: [
    ''
  ],

  activo: [true]

});


  ngOnInit(): void {

  this.cargarProductos();

  this.proveedorSearch$
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(texto => {

      if (texto.length < 2) {

        this.proveedores.set([]);
        this.mostrarProveedores.set(false);

        return;
      }

      this.proveedorService
        .buscarPredictivo(texto)
        .subscribe({

         next: (proveedores: ProveedorBusqueda[]) => {

            this.proveedores.set(proveedores);

            this.mostrarProveedores.set(
              proveedores.length > 0
            );
          },

          error: (err: unknown) => {

            console.error(err);

            this.proveedores.set([]);
            this.mostrarProveedores.set(false);
          }

        });

    });

}


  iniciarNuevo(): void {
   this.form.reset({
  codigoBarras: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: 0,
  stock: 0,
  idProveedor: null,
  proveedorNombre: '',
  activo: true,
});
    this.errorEdicion.set('');
    this.editandoId.set(null);
    this.creando.set(true);
  }

  iniciarEdicion(producto: Producto): void {
    this.creando.set(false);
    this.form.patchValue({
      codigoBarras: producto.codigoBarras,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      activo: producto.activo,
      idProveedor: producto.idProveedor,
      proveedorNombre: producto.nombreProveedor,
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

buscarProveedor(event: Event): void {

  const texto =
    (event.target as HTMLInputElement)
      .value
      .trim();

  this.proveedorSearch$.next(texto);

}

seleccionarProveedor(
  proveedor: ProveedorBusqueda
): void {

  this.form.patchValue({

    idProveedor: proveedor.idProveedor,

    proveedorNombre: proveedor.nombre

  });

  this.mostrarProveedores.set(false);

}

cargarProductos(): void {
  this.productoService.listar().subscribe({

    next: (data) => {

      const mappedData: Producto[] = data.map(p => ({

        id: p.idProducto,
        codigoBarras: p.codigoBarras,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        categoria: p.categoria,
        precio: p.precio,
        stock: p.stock,
        activo: p.estado !== 'inactivo',
        fechaAlta: new Date().toISOString().slice(0, 10),

        idProveedor: p.idProveedor,
        nombreProveedor: p.nombreProveedor ?? ''

      }));

      this.productos.set(mappedData);

    },

    error: err => {

      console.error(err);

      this.errorEdicion.set(
        'No se pudieron cargar los productos.'
      );

    }

  });

}
    guardarProducto(): void {

  const id = this.editandoId();
  const esNuevo = this.creando();

  if (
    this.form.invalid ||
    this.guardando() ||
    (!esNuevo && id === null)
  ) {

    this.form.markAllAsTouched();
    return;

  }

  this.guardando.set(true);
  this.errorEdicion.set('');

  const value = this.form.getRawValue();

  const request: ProductoRequest = {

    codigoBarras:
      value.codigoBarras?.trim() ?? '',

    nombre:
      value.nombre?.trim() ?? '',

    descripcion:
      value.descripcion?.trim() ?? '',

    categoria:
      value.categoria?.trim() ?? '',

    precio:
      Number(value.precio),

    stock:
      Number(value.stock),

    idProveedor:
      Number(value.idProveedor),

    estado:
      value.activo
        ? 'activo'
        : 'inactivo'

  };

  if (esNuevo) {

    this.productoService
      .crear(request)
      .subscribe({

        next: () => {

          this.cargarProductos();

          this.guardando.set(false);

          this.cancelarEdicion();

        },

        error: (err: unknown) => {

          console.error(err);

          this.errorEdicion.set(
            'Error al guardar el producto.'
          );

          this.guardando.set(false);

        }

      });

  } else if (id !== null) {

    this.productoService
      .actualizar(id, request)
      .subscribe({

        next: () => {

          this.cargarProductos();

          this.guardando.set(false);

          this.cancelarEdicion();

        },

        error: (err: unknown) => {

          console.error(err);

          this.errorEdicion.set(
            'Error al actualizar el producto.'
          );

          this.guardando.set(false);

        }

      });

    }

  }
  
}
