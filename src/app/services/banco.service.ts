import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banco } from '../models/banco.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BancoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/bancos`; 

  listar(): Observable<Banco[]> {
    // ¡ESTA ES LA LÍNEA CLAVE!
    return this.http.get<Banco[]>(this.apiUrl, { withCredentials: true });
  }
}