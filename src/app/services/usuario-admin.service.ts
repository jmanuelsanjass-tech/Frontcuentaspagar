import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RolUsuario {
  idRol: number;
  nombre: string;
  descripcion: string | null;
}

export interface UsuarioAdministracion {
  idUsuario: number;
  username: string;
  activo: boolean;
  fechaAlta: string | null;
  roles: RolUsuario[];
}

export interface EventoBitacoraUsuario {
  idEvento: number;
  administrador: string;
  idUsuarioObjetivo: number | null;
  usernameObjetivo: string;
  accion: string;
  detalle: string | null;
  fechaEvento: string | null;
}

export interface CrearUsuarioRequest {
  username: string;
  password: string;
  activo: boolean;
  roles: number[];
}

export interface ActualizarUsuarioRequest {
  username: string;
  activo: boolean;
  roles: number[];
}

@Injectable({ providedIn: 'root' })
export class UsuarioAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api`;

  listarUsuarios(): Observable<UsuarioAdministracion[]> {
    return this.http.get<UsuarioAdministracion[]>(`${this.apiUrl}/usuarios`);
  }

  listarRoles(): Observable<RolUsuario[]> {
    return this.http.get<RolUsuario[]>(`${this.apiUrl}/roles`);
  }

  listarBitacora(): Observable<EventoBitacoraUsuario[]> {
    return this.http.get<EventoBitacoraUsuario[]>(
      `${this.apiUrl}/bitacora/usuarios`,
    );
  }

  crearUsuario(request: CrearUsuarioRequest): Observable<UsuarioAdministracion> {
    return this.http.post<UsuarioAdministracion>(`${this.apiUrl}/usuarios`, request);
  }

  actualizarUsuario(
    id: number,
    request: ActualizarUsuarioRequest,
  ): Observable<UsuarioAdministracion> {
    return this.http.put<UsuarioAdministracion>(
      `${this.apiUrl}/usuarios/${id}`,
      request,
    );
  }

  cambiarEstado(
    id: number,
    activo: boolean,
  ): Observable<UsuarioAdministracion> {
    return this.http.patch<UsuarioAdministracion>(
      `${this.apiUrl}/usuarios/${id}/estado`,
      { activo },
    );
  }

  cambiarPassword(
    id: number,
    password: string,
  ): Observable<UsuarioAdministracion> {
    return this.http.put<UsuarioAdministracion>(
      `${this.apiUrl}/usuarios/${id}/password`,
      { password },
    );
  }
}
