export interface CuentaPorCobrar {
  idCxc: number;
  clienteId: number;
  ventaId: number;
  fechaVenta: string;
  fechaVencimiento: string;
  importeOriginal: number;
  saldoPendiente: number;
  diasVencidos: number;
  limiteCredito: number;
  estatus: 'Pendiente' | 'Pagado' | 'Cancelado';
  fechaUltimoPago: string | null;
}

export interface CuentaPorCobrarRequest {
  clienteId: number;
  ventaId: number;
  fechaVenta: string;
  fechaVencimiento: string;
  importeOriginal: number;
  saldoPendiente: number;
  diasVencidos: number;
  limiteCredito: number;
  estatus: 'Pendiente' | 'Pagado' | 'Cancelado';
  fechaUltimoPago: string | null;
}

export type TipoMovimientoHistoria =
  | 'ALTA'
  | 'ABONO'
  | 'Cancelado'
  | 'PAGO_TOTAL'
  | 'REESTRUCTURA'
  | 'PRORROGA'
  | 'CANCELACION'
  | 'CASTIGO'
  | 'BLOQUEO_CREDITO'
  | 'DESBLOQUEO_CREDITO';

export interface CuentaPorCobrarHistoria {
  idHistoria: number;
  cuentaPorCobrarId: number;
  fechaMovimiento: string | null;
  tipoMovimiento: TipoMovimientoHistoria;
  importeOriginal: number | null;
  saldoAnterior: number | null;
  saldoNuevo: number | null;
  montoMovimiento: number | null;
  fechaVencimientoAnterior: string | null;
  fechaVencimientoNueva: string | null;
  diasVencidos: number | null;
  usuarioMovimiento: string | null;
  equipoMovimiento: string | null;
  observaciones: string | null;
  fechaLog: string | null;
}

export interface CuentaPorCobrarHistoriaRequest {
  idHistoria?: number;
  cuentaPorCobrarId: number;
  tipoMovimiento: TipoMovimientoHistoria;
  importeOriginal: number | null;
  saldoAnterior: number | null;
  saldoNuevo: number | null;
  montoMovimiento: number | null;
  fechaVencimientoAnterior: string | null;
  fechaVencimientoNueva: string | null;
  diasVencidos: number | null;
  usuarioMovimiento: string | null;
  equipoMovimiento: string | null;
  observaciones: string | null;
}
