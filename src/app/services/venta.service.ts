import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venta, VentaRequest } from '../models/venta.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly apiUrl = `${environment.apiUrl}/api/ventas`;
  private readonly http = inject(HttpClient);

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl, { withCredentials: true });
  }

  obtenerPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  crear(venta: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta, { withCredentials: true });
  }

  actualizar(id: number, venta: VentaRequest): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/${id}`, venta, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}