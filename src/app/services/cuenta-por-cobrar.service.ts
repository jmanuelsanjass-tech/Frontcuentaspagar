import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CuentaPorCobrar, CuentaPorCobrarRequest } from '../models/cuenta-por-cobrar.model';

@Injectable({
  providedIn: 'root',
})
export class CuentaPorCobrarService {
  private readonly apiUrl = `${environment.apiUrl}/api/cuentas-por-cobrar`;
  private readonly http = inject(HttpClient);

  listar(): Observable<CuentaPorCobrar[]> {
    return this.http.get<CuentaPorCobrar[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<CuentaPorCobrar> {
    return this.http.get<CuentaPorCobrar>(`${this.apiUrl}/${id}`);
  }

  crear(cuenta: CuentaPorCobrarRequest): Observable<CuentaPorCobrar> {
    return this.http.post<CuentaPorCobrar>(this.apiUrl, cuenta);
  }

  actualizar(id: number, cuenta: CuentaPorCobrarRequest): Observable<CuentaPorCobrar> {
    return this.http.put<CuentaPorCobrar>(`${this.apiUrl}/${id}`, cuenta);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
