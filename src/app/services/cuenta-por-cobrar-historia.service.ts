import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CuentaPorCobrarHistoria,
  CuentaPorCobrarHistoriaRequest,
} from '../models/cuenta-por-cobrar.model';

@Injectable({
  providedIn: 'root',
})
export class CuentaPorCobrarHistoriaService {
  private readonly apiUrl = `${environment.apiUrl}/api/cuentas-por-cobrar-historia`;
  private readonly http = inject(HttpClient);

  listar(): Observable<CuentaPorCobrarHistoria[]> {
    return this.http.get<CuentaPorCobrarHistoria[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<CuentaPorCobrarHistoria> {
    return this.http.get<CuentaPorCobrarHistoria>(`${this.apiUrl}/${id}`);
  }

  crear(movimiento: CuentaPorCobrarHistoriaRequest): Observable<CuentaPorCobrarHistoria> {
    return this.http.post<CuentaPorCobrarHistoria>(this.apiUrl, movimiento);
  }

  actualizar(
    id: number,
    movimiento: CuentaPorCobrarHistoriaRequest,
  ): Observable<CuentaPorCobrarHistoria> {
    return this.http.put<CuentaPorCobrarHistoria>(`${this.apiUrl}/${id}`, movimiento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
