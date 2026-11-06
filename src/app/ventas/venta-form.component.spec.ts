import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { VentaService } from '../services/venta.service';
import { VentaFormComponent } from './venta-form.component';

describe('VentaFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaFormComponent],
      providers: [
        provideRouter([]),
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
      ],
    }).compileComponents();
  });

  it('estimates subtotal and total using the entered discount and IVA', () => {
    const fixture = TestBed.createComponent(VentaFormComponent);
    const component = fixture.componentInstance;
    const linea = {
      codigoBarras: '7501234567890',
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
});
