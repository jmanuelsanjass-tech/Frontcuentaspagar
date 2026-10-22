import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VentaFormComponent } from './venta-form.component';

describe('VentaFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaFormComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('calculates detail and sale totals with separate discounts', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    component.lineas.set([{
      id_producto: 1,
      codigoBarras: '',
      descripcion: 'Producto',
      precio_unitario: 100,
      cantidad: 2,
      descuento: 10,
    }]);

    expect(component.subtotal()).toBe(200);
    expect(component.iva()).toBe(30.4);
    expect(component.totalVenta()).toBe(220.4);

    component.form.controls.descuento.setValue(20);

    expect(component.descuentoTotal()).toBe(30);
    expect(component.iva()).toBe(27.2);
    expect(component.totalVenta()).toBe(197.2);
  });
});
