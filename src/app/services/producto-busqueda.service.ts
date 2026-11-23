import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoBusqueda {
  idProducto: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
  stock: number;
}

interface ProductoCatalogo {
  idProducto: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
  stock: number;
  estado: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductoBusquedaService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = `${environment.apiUrl}/api/productos`;

  buscar(termino: string): Observable<ProductoBusqueda[]> {
    const query = termino.trim();
    const params = new HttpParams().set('termino', query);

    return this.http
      .get<ProductoBusqueda[]>(`${this.apiBaseUrl}/buscar/predictivo`, { params, withCredentials: true })
      .pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            return this.buscarEnCatalogoAnterior(query);
          }
          return throwError(() => error);
        }),
      );
  }

  private buscarEnCatalogoAnterior(termino: string): Observable<ProductoBusqueda[]> {
    const params = new HttpParams().set('nombre', termino);
    return this.http.get<ProductoCatalogo[]>(`${this.apiBaseUrl}/buscar`, { params, withCredentials: true }).pipe(
      map((productos) =>
        productos
          .filter((producto) => producto.estado?.toLowerCase() !== 'inactivo')
          .slice(0, 10)
          .map((producto) => ({
            idProducto: producto.idProducto,
            codigoBarras: producto.codigoBarras,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            categoria: producto.categoria,
            precio: Number(producto.precio),
            stock: producto.stock,
          })),
      ),
    );
  }
}