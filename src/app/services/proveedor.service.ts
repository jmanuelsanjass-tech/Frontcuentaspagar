/* import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';
<<<<<<< HEAD
import { environment } from '../../environments/environment';
=======
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e



@Service()
export class ProveedorService {
  private readonly apiUrl = '/api/proveedores';
  private readonly http = inject(HttpClient);

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crear(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  actualizar(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} */

  import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';
<<<<<<< HEAD
import { environment } from '../../environments/environment';
=======
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
<<<<<<< HEAD
  private readonly apiUrl = `${environment.apiUrl}/api/proveedores`;
=======
  private readonly apiUrl = 'http://localhost:8080/api/proveedores';
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
  private readonly http = inject(HttpClient);

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  obtener(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crear(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  actualizar(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
