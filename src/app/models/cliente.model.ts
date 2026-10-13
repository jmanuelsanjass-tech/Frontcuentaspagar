export interface Cliente {
  id: number;
  nombreComercial: string;
  razonSocial: string;
  rfc: string;
  situacionFiscal: string;
  tipoCliente: string;
  direccion: string;
  colonia: string;
  ciudad: string;
  contacto: string;
  banco: string;
  cuentaBancaria: string;
  clabe: string;
  formaPago: string;
  fechaAlta: string;
}

export interface ClienteUpdate {
  nombreComercial: string;
  razonSocial: string;
  rfc: string;
  situacionFiscal: string;
  tipoCliente: string;
  direccion: string | null;
  colonia: string | null;
  ciudad: string | null;
  contacto: string | null;
  banco: string | null;
  cuentaBancaria: string | null;
  clabe: string | null;
  formaPago: string | null;
}
