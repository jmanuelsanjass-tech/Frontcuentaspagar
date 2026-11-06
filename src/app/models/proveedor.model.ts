export interface Proveedor {
  idProveedor: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estadoDireccion: string;
  fechaRegistro: string | null;
  estado: string | null;
  productosSuministrados: string | null;
  fechaAuditoria: string | null;
  usuarioAuditoria: string | null;
  qrCode: string | null;
}

export interface ProveedorRequest {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estadoDireccion: string;
  estado: 'activo' | 'inactivo';
  productosSuministrados: string | null;
}
