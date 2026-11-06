export interface Cliente {
  idCliente: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estadoDireccion: string;
  fechaRegistro: string | null;
  estado: string | null;
  historialCompras: string | null;
  fechaAuditoria: string | null;
  usuarioAuditoria: string | null;
  qrCode: string | null;
}

export interface ClienteRequest {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estadoDireccion: string;
  estado: string;
  historialCompras: string | null;
  qrCode?: string;
}
