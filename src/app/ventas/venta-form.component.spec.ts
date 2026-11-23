import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { ClienteService } from '../services/cliente.service';
import { ProductoBusquedaService } from '../services/producto-busqueda.service';
import { VentaService } from '../services/venta.service';
import { VentaFormComponent } from './venta-form.component';

describe('VentaFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ClienteService,
          useValue: {
            listar: () => of([]),
          },
        },
        {
          provide: VentaService,
          useValue: {
            listar: () => of([]),
            obtenerPorId: () => EMPTY,
            crear: () => EMPTY,
            actualizar: () => EMPTY,
            eliminar: () => EMPTY,
          },
        },
        {
          provide: ProductoBusquedaService,
          useValue: {
            buscar: () => of([]),
          },
        },
      ],
    }).compileComponents();
  });

  it('estimates subtotal and total using the entered discount and IVA', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    const linea = {
      codigoBarras: '7501234567890',
      nombreProducto: 'Café molido',
      precioUnitario: 12.5,
      cantidad: 3,
    };
    component.lineas.set([linea]);
    component.form.controls.descuento.setValue(2.5);
    component.form.controls.iva.setValue(6);

    expect(component.importeLinea(linea)).toBe(37.5);
    expect(component.subtotal()).toBe(37.5);
    expect(component.totalVenta()).toBe(41);
  });

  it('selects a suggested product and fills its barcode and price', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    const product = {
      idProducto: 12,
      codigoBarras: '7501234567890',
      nombre: 'Café molido',
      descripcion: 'Bolsa de 500 g',
      categoria: 'Abarrotes',
      precio: 89.5,
      stock: 7,
    };

    component.seleccionarProducto(product);

    expect(component.detalleForm.controls.codigoBarras.value).toBe('7501234567890');
    expect(component.busquedaProducto.value).toBe('7501234567890');
    expect(component.detalleForm.controls.precioUnitario.value).toBe(89.5);
    expect(component.productoSeleccionado()).toEqual(product);
    expect(component.sugerenciasAbiertas()).toBe(false);
  });

  it('adds the selected product name to the product table row', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    const product = {
      idProducto: 12,
      codigoBarras: '7501234567890',
      nombre: 'Café molido',
      descripcion: 'Bolsa de 500 g',
      categoria: 'Abarrotes',
      precio: 89.5,
      stock: 7,
    };

    component.seleccionarProducto(product);
    component.agregarProducto();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.table-wrap tbody tr') as HTMLTableRowElement;
    expect(component.lineas()[0].nombreProducto).toBe('Café molido');
    expect(row.cells).toHaveLength(6);
    expect(row.cells[1].textContent?.trim()).toBe('Café molido');
  });

  it('uses the barcode field as an accessible predictive product search', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    fixture.detectChanges();

    const barcodeInput = fixture.nativeElement.querySelector('#codigoBarras') as HTMLInputElement;

    expect(barcodeInput.getAttribute('role')).toBe('combobox');
    expect(barcodeInput.getAttribute('aria-autocomplete')).toBe('list');
    expect(barcodeInput.getAttribute('placeholder')).toContain('código');
  });

  it('suggests clients by name or ID and assigns the selected client ID', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    const client: Cliente = {
      idCliente: 27,
      nombre: 'José García',
      telefono: '5551234567',
      correo: 'jose@example.com',
      direccion: null,
      estadoDireccion: 'Jalisco',
      fechaRegistro: null,
      estado: 'activo',
      historialCompras: null,
      fechaAuditoria: null,
      usuarioAuditoria: null,
      qrCode: null,
    };
    component.clientesDisponibles.set([client]);

    component.actualizarSugerenciasClientes('jose');
    expect(component.clientesSugeridos()).toEqual([client]);
    expect(component.sugerenciasClientesAbiertas()).toBe(true);

    component.seleccionarCliente(client);

    expect(component.form.controls.clienteId.value).toBe(27);
    expect(component.busquedaCliente.value).toContain('José García');
    expect(component.clienteSeleccionado()).toEqual(client);
    expect(component.sugerenciasClientesAbiertas()).toBe(false);
  });

  it('uses the client ID field as an accessible predictive search', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    fixture.detectChanges();

    const clientInput = fixture.nativeElement.querySelector('#clienteId') as HTMLInputElement;

    expect(clientInput.getAttribute('role')).toBe('combobox');
    expect(clientInput.getAttribute('aria-autocomplete')).toBe('list');
    expect(clientInput.getAttribute('placeholder')).toContain('nombre');
  });

  it('calculates change for cash and charges the exact total for credit card', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    component.lineas.set([{
      codigoBarras: '7501234567890',
      nombreProducto: 'Café molido',
      cantidad: 1,
      precioUnitario: 84.5,
    }]);
    component.form.controls.montoRecibido.setValue(100);

    expect(component.montoRecibidoCalculado()).toBe(100);
    expect(component.montoSobranteEstimado()).toBe(15.5);

    component.form.controls.tipoMoneda.setValue('Tarjeta de Crédito');

    expect(component.montoRecibidoCalculado()).toBe(84.5);
    expect(component.montoSobranteEstimado()).toBe(0);
  });
});
