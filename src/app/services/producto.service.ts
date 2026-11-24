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
}

// Interfaz para enviar datos al backend
export interface ProductoRequest {
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/productos`;

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // NUEVO MÉTODO PARA CREAR
  crear(producto: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.apiUrl, producto, { withCredentials: true });
  }

  // NUEVO MÉTODO PARA ACTUALIZAR
 actualizar(id: number, producto: ProductoRequest): Observable<ProductoResponse> {
    // Agregamos "/id/" antes del ID
    return this.http.put<ProductoResponse>(`${this.apiUrl}/id/${id}`, producto, { withCredentials: true });
  }
}