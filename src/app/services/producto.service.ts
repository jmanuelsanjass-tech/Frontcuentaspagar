import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoResponse {
  idProducto: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: string | null;

  idProveedor: number | null;
  nombreProveedor?: string;
}

export interface ProductoRequest {
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: string;

  idProveedor: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/productos`;

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(
      this.apiUrl,
      { withCredentials: true }
    );
  }

  crear(
    producto: ProductoRequest
  ): Observable<ProductoResponse> {

    return this.http.post<ProductoResponse>(
      this.apiUrl,
      producto,
      { withCredentials: true }
    );
  }

  actualizar(
    id: number,
    producto: ProductoRequest
  ): Observable<ProductoResponse> {

    return this.http.put<ProductoResponse>(
      `${this.apiUrl}/id/${id}`,
      producto,
      { withCredentials: true }
    );
  }
}