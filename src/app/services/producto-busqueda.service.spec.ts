import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductoBusquedaService } from './producto-busqueda.service';

describe('ProductoBusquedaService', () => {
  let service: ProductoBusquedaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductoBusquedaService,
      ],
    });
    service = TestBed.inject(ProductoBusquedaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the predictive endpoint and trims the search term', () => {
    let response: unknown;
    service.buscar(' arroz ').subscribe((result) => (response = result));

    const request = http.expectOne(
      (candidate) =>
        candidate.url.endsWith('/api/productos/buscar/predictivo') &&
        candidate.params.get('termino') === 'arroz',
    );
    request.flush([]);

    expect(response).toEqual([]);
  });

  it('falls back to the existing name search when the predictive route is missing', () => {
    let response: unknown;
    service.buscar('arroz').subscribe((result) => (response = result));

    http.expectOne((request) => request.url.endsWith('/api/productos/buscar/predictivo'))
      .flush(null, { status: 404, statusText: 'Not Found' });

    http.expectOne(
      (request) =>
        request.url.endsWith('/api/productos/buscar') &&
        request.params.get('nombre') === 'arroz',
    ).flush([
      {
        idProducto: 1,
        codigoBarras: '7501234567890',
        nombre: 'Arroz',
        descripcion: null,
        categoria: 'Abarrotes',
        precio: '32.50',
        stock: 5,
        estado: 'activo',
      },
    ]);

    expect(response).toEqual([
      {
        idProducto: 1,
        codigoBarras: '7501234567890',
        nombre: 'Arroz',
        descripcion: null,
        categoria: 'Abarrotes',
        precio: 32.5,
        stock: 5,
      },
    ]);
  });
});
