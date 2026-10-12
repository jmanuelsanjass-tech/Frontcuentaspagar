import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ClienteUpdate } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/api/clientes`;
  private readonly http = inject(HttpClient);

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  crear(cliente: ClienteUpdate): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: ClienteUpdate): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }
}
