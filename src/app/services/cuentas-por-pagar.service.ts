import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type PayablesSectionId =
  | 'accounts'
  | 'orders'
  | 'receipts'
  | 'invoices'
  | 'payments'
  | 'policies'
  | 'audit';

export interface PayablesSection {
  id: PayablesSectionId;
  label: string;
  title: string;
  columns: readonly string[];
  detailColumns?: readonly string[];
  roles: readonly string[];
}

export interface PayablesRow {
  id: string;
  cells: readonly string[];
}

export const payablesSections: readonly PayablesSection[] = [
  {
    id: 'accounts',
    label: 'Cuentas contables',
    title: 'Catálogo de cuentas contables',
    columns: ['Código', 'Nombre', 'Tipo', 'Estado', 'Creada'],
    roles: ['ADMIN', 'COMPRAS', 'CONTABILIDAD', 'INVENTARIOS'],
  },
  {
    id: 'orders',
    label: 'Órdenes de compra',
    title: 'Órdenes de compra',
    columns: ['Número', 'Proveedor', 'Fecha', 'Estado', 'Moneda', 'Total'],
    detailColumns: ['Línea', 'Descripción', 'Cantidad', 'Precio unitario', 'Recibido', 'Cuenta'],
    roles: ['ADMIN', 'COMPRAS', 'INVENTARIOS'],
  },
  {
    id: 'receipts',
    label: 'Recepciones',
    title: 'Recepciones de mercancía',
    columns: ['Número', 'Orden', 'Fecha', 'Recibido por', 'Creada'],
    detailColumns: ['Línea de orden', 'Cantidad recibida', 'Notas'],
    roles: ['ADMIN', 'RECEPCION', 'INVENTARIOS'],
  },
  {
    id: 'invoices',
    label: 'Facturas',
    title: 'Facturas de proveedor',
    columns: ['Factura', 'Proveedor', 'Emisión', 'Vencimiento', 'Total', 'Saldo', 'Estado'],
    detailColumns: ['Línea', 'Descripción', 'Cantidad', 'Neto', 'Impuestos', 'Cuenta'],
    roles: ['ADMIN', 'CONTABILIDAD'],
  },
  {
    id: 'payments',
    label: 'Pagos',
    title: 'Pagos a proveedores',
    columns: ['Número', 'Proveedor', 'Factura', 'Fecha', 'Monto', 'Método', 'Estado'],
    roles: ['ADMIN', 'TESORERIA', 'CONTABILIDAD'],
  },
  {
    id: 'policies',
    label: 'Políticas',
    title: 'Políticas de aprobación',
    columns: ['Transacción', 'Monto mínimo', 'Monto máximo', 'Rol requerido', 'Secuencia', 'Estado'],
    roles: ['ADMIN'],
  },
  {
    id: 'audit',
    label: 'Auditoría',
    title: 'Bitácora de auditoría',
    columns: [
      'Fecha',
      'Tabla',
      'Operación',
      'Registro',
      'Usuario',
      'Transacción',
      'Datos anteriores',
      'Datos nuevos',
    ],
    roles: ['ADMIN', 'AUDITOR'],
  },
];

export function getVisiblePayablesSections(roles: readonly string[]): PayablesSection[] {
  const normalizedRoles = roles.map((role) => {
    const normalizedRole = role.trim().toUpperCase();
    return normalizedRole.startsWith('ROLE_') ? normalizedRole.slice(5) : normalizedRole;
  });

  return payablesSections.filter((section) =>
    section.roles.some((role) => normalizedRoles.includes(role)),
  );
}

interface CuentaContableDto {
  id: string;
  codigoCuenta: string;
  nombreCuenta: string;
  tipoCuenta: string;
  activo: boolean;
  creadoEn: string;
}

interface OrdenCompraDto {
  idOrdenCompra: string;
  numeroOc: string;
  proveedorId: number;
  fechaOrden: string;
  estado: string;
  moneda: string;
  montoTotal: number;
}

interface OrdenCompraLineaDto {
  idOrdenCompraLinea: string;
  numeroLinea: number;
  descripcion: string;
  cantidadOrdenada: number;
  precioUnitario: number;
  cantidadRecibida: number;
  cuentaContableId: string;
}

interface RecepcionDto {
  id: string;
  numeroRecepcion: string;
  ordenCompraId: string;
  fechaRecepcion: string;
  recibidoPor: string;
  creadoEn: string;
}

interface RecepcionLineaDto {
  id: string;
  ordenCompraLineaId: string;
  cantidadRecibida: number;
  notas: string | null;
}

interface FacturaProveedorDto {
  id: string;
  numeroFactura: string;
  proveedorId: number;
  fechaFactura: string;
  fechaVencimiento: string;
  moneda: string;
  montoTotal: number;
  saldoPendiente: number;
  estado: string;
}

interface FacturaLineaDto {
  id: string;
  numeroLinea: number;
  descripcion: string;
  cantidad: number;
  montoNeto: number;
  montoImpuestos: number;
  cuentaContableId: string;
}

interface PagoDto {
  id: string;
  numeroPago: string;
  proveedorId: number;
  facturaId: string | null;
  fechaPago: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  estado: string;
}

interface PoliticaDto {
  id: string;
  tipoTransaccion: string;
  montoMinimo: number;
  montoMaximo: number | null;
  rolRequerido: string;
  ordenSecuencia: number;
  activo: boolean;
}

interface BitacoraDto {
  id: number;
  tabla: string;
  operacion: string;
  registroId: string;
  cambiadoEn: string;
  cambiadoPor: string;
  idTransaccion: number;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class CuentasPorPagarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api`;

  listar(section: PayablesSectionId): Observable<PayablesRow[]> {
    switch (section) {
      case 'accounts':
        return this.http.get<CuentaContableDto[]>(`${this.apiUrl}/cuentas-contables`).pipe(
          map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.codigoCuenta,
              item.nombreCuenta,
              item.tipoCuenta,
              item.activo ? 'Activa' : 'Inactiva',
              formatTimestamp(item.creadoEn),
            ],
          }))),
        );
      case 'orders':
        return this.http.get<OrdenCompraDto[]>(`${this.apiUrl}/ordenes-compra`).pipe(
          map((items) => items.map((item) => ({
            id: item.idOrdenCompra,
            cells: [
              item.numeroOc,
              String(item.proveedorId),
              item.fechaOrden,
              item.estado,
              item.moneda,
              `${item.montoTotal} ${item.moneda}`,
            ],
          }))),
        );
      case 'receipts':
        return this.http.get<RecepcionDto[]>(`${this.apiUrl}/recepciones-mercancia`).pipe(
          map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.numeroRecepcion,
              item.ordenCompraId,
              item.fechaRecepcion,
              item.recibidoPor,
              formatTimestamp(item.creadoEn),
            ],
          }))),
        );
      case 'invoices':
        return this.http.get<FacturaProveedorDto[]>(`${this.apiUrl}/facturas-proveedor`).pipe(
          map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.numeroFactura,
              String(item.proveedorId),
              item.fechaFactura,
              item.fechaVencimiento,
              `${item.montoTotal} ${item.moneda}`,
              `${item.saldoPendiente} ${item.moneda}`,
              item.estado,
            ],
          }))),
        );
      case 'payments':
        return this.http.get<PagoDto[]>(`${this.apiUrl}/pagos`).pipe(
          map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.numeroPago,
              String(item.proveedorId),
              item.facturaId ?? '—',
              item.fechaPago,
              `${item.monto} ${item.moneda}`,
              item.metodoPago,
              item.estado,
            ],
          }))),
        );
      case 'policies':
        return this.http.get<PoliticaDto[]>(`${this.apiUrl}/politicas-aprobacion`).pipe(
          map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.tipoTransaccion,
              String(item.montoMinimo),
              item.montoMaximo === null ? 'Sin límite' : String(item.montoMaximo),
              item.rolRequerido,
              String(item.ordenSecuencia),
              item.activo ? 'Activa' : 'Inactiva',
            ],
          }))),
        );
      case 'audit':
        return this.http.get<BitacoraDto[]>(`${this.apiUrl}/bitacora-auditoria?limit=100`).pipe(
          map((items) => items.map((item) => ({
            id: String(item.id),
            cells: [
              formatTimestamp(item.cambiadoEn),
              item.tabla,
              item.operacion,
              item.registroId,
              item.cambiadoPor,
              String(item.idTransaccion),
              formatJson(item.datosAnteriores),
              formatJson(item.datosNuevos),
            ],
          }))),
        );
    }
  }

  listarDetalle(section: PayablesSectionId, id: string): Observable<PayablesRow[]> {
    switch (section) {
      case 'orders':
        return this.http
          .get<OrdenCompraLineaDto[]>(`${this.apiUrl}/ordenes-compra/${id}/lineas`)
          .pipe(map((items) => items.map((item) => ({
            id: item.idOrdenCompraLinea,
            cells: [
              String(item.numeroLinea),
              item.descripcion,
              String(item.cantidadOrdenada),
              String(item.precioUnitario),
              String(item.cantidadRecibida),
              item.cuentaContableId,
            ],
          }))));
      case 'receipts':
        return this.http
          .get<RecepcionLineaDto[]>(`${this.apiUrl}/recepciones-mercancia/${id}/lineas`)
          .pipe(map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              item.ordenCompraLineaId,
              String(item.cantidadRecibida),
              item.notas ?? '—',
            ],
          }))));
      case 'invoices':
        return this.http
          .get<FacturaLineaDto[]>(`${this.apiUrl}/facturas-proveedor/${id}/lineas`)
          .pipe(map((items) => items.map((item) => ({
            id: item.id,
            cells: [
              String(item.numeroLinea),
              item.descripcion,
              String(item.cantidad),
              String(item.montoNeto),
              String(item.montoImpuestos),
              item.cuentaContableId,
            ],
          }))));
      default:
        return throwError(() => new Error(`La sección ${section} no tiene detalle.`));
    }
  }
}

function formatTimestamp(value: string): string {
  return value ? value.replace('T', ' ').slice(0, 19) : '—';
}

function formatJson(value: Record<string, unknown> | null): string {
  return value === null ? '—' : JSON.stringify(value);
}
