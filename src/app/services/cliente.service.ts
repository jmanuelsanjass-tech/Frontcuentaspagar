import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Cliente, ClienteRequest } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/api/clientes`;
  private readonly http = inject(HttpClient);

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl, { withCredentials: true });
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  crear(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente, { withCredentials: true });
  }

  actualizar(id: number, cliente: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente, { withCredentials: true });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  buscar(termino: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/buscar?q=${termino}`, { withCredentials: true });
  }
}