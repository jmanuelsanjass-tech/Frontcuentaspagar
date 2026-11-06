export interface VentaDetalle {
  detalleId: number;
  codigoBarras: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface Venta {
  ventaId: number;
  clienteId: number;
  fechaVenta: string;
  subtotal: number;
  descuento: number | null;
  iva: number;
  total: number;
  estado: string | null;
  usuarioAuditoria: string | null;
  fechaAuditoria: string | null;
  qrCode: string | null;
  detalles: VentaDetalle[];
}

export interface VentaDetalleRequest {
  codigoBarras: string;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaRequest {
  clienteId: number;
  descuento: number;
  iva: number;
  estado: string;
  detalles: VentaDetalleRequest[];
}
