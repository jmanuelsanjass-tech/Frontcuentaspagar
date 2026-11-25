import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Venta } from '../../models/venta.model';


@Component({
  selector: 'app-ticket-venta',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  template: `
    <div class="ticket-overlay" *ngIf="visible">
      <div class="ticket-container">
        <!-- Botones de acción (No se imprimen) -->
        <div class="actions no-print">
          <button class="btn-close" (click)="cerrar.emit()">Cerrar</button>
          <button class="btn-print" (click)="imprimir()">Imprimir Ticket</button>
        </div>

        <!-- El Ticket Físico -->
        <div class="ticket" id="ticket-print-area">
          <div class="header">
            <h2></h2>
            <p>Ticket de Venta</p>
            <p>-------------------------</p>
          </div>

          <div class="info">
            <p><strong>Ticket #:</strong> {{ venta?.ventaId }}</p>
            <p><strong>Fecha:</strong> {{ venta?.fechaVenta | date:'dd/MM/yyyy HH:mm' }}</p>
            <p><strong>Cliente ID:</strong> {{ venta?.clienteId }}</p>
            <p><strong>Atendido por:</strong> {{ venta?.usuarioAuditoria || 'admin' }}</p>
            <p>-------------------------</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Cant</th>
                <th>Descripción</th>
                <th class="right">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of venta?.detalles">
                <td>{{ item.cantidad }}</td>
                <td>{{ item.nombreProducto || item.codigoBarras }}</td>
                <td class="right">{{ (item.cantidad * item.precioUnitario) | currency:'MXN':'symbol-narrow':'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>

          <p>-------------------------</p>

          <div class="totals">
            <div class="row">
              <span>Subtotal:</span>
              <span>{{ venta?.subtotal | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row">
              <span>Descuento:</span>
              <span>-{{ (venta?.descuento || 0) | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row">
              <span>IVA:</span>
              <span>{{ venta?.iva | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row total">
              <span>TOTAL:</span>
              <span>{{ venta?.total | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row" *ngIf="venta?.tipoMoneda === 'Pesos'">
              <span>Recibido:</span>
              <span>{{ venta?.montoRecibido | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row" *ngIf="venta?.tipoMoneda === 'Pesos'">
              <span>Cambio:</span>
              <span>{{ venta?.montoSobrante | currency:'MXN':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="row" *ngIf="venta?.tipoMoneda !== 'Pesos'">
              <span>Pago:</span>
              <span>{{ venta?.tipoMoneda }} {{ venta?.bancoCorto ? '(' + venta?.bancoCorto + ')' : '' }}</span>
            </div>
          </div>

          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Conserve este ticket para cualquier aclaración.</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    /* 1. Fondo oscuro para que resalte el ticket en pantalla */
    .ticket-overlay {
      position: fixed; 
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.8); /* Fondo súper oscuro */
      display: flex; 
      justify-content: center; 
      align-items: center;
      z-index: 999999; /* Asegura que esté por encima de todo */
    }

    /* 2. El recuadro donde va el ticket */
    .ticket-container {
      background: #fff; 
      padding: 20px; 
      border-radius: 8px;
      max-height: 95vh; 
      overflow-y: auto; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      position: relative;
    }

    .actions { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 15px; 
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .btn-close { background: #cb6d63; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    .btn-print { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    
    /* 3. Estilos del ticket (Pantalla) */
    .ticket { 
      font-family: 'Courier New', Courier, monospace; 
      width: 320px; 
      margin: 0 auto; 
      color: #000; 
      background: #fff;
    }
    .header, .footer { text-align: center; }
    .header h2 { margin: 0 0 5px 0; font-size: 18px; }
    .info p, .footer p { margin: 3px 0; font-size: 12px; }
    .items { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
    .items th, .items td { padding: 4px 0; text-align: left; border: none; }
    .items .right { text-align: right; }
    .totals { margin-top: 10px; font-size: 13px; }
    .totals .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .totals .total { font-weight: bold; font-size: 15px; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }

    /* 4. MAGIA PARA IMPRESIÓN */
    @media print {
      @page { margin: 0; size: auto; }
      
      /* Ocultamos TODO el body */
      body * { visibility: hidden; background: transparent; }
      
      /* Hacemos visible solo el contenedor del ticket */
      .ticket-container, #ticket-print-area, #ticket-print-area * { 
        visibility: visible; 
      }
      
      /* Posicionamos el ticket arriba a la izquierda para la impresora */
      .ticket-container { 
        position: absolute; 
        left: 0; 
        top: 0; 
        margin: 0; 
        padding: 0; 
        box-shadow: none; 
        max-height: none;
        overflow: visible;
      }
      
      .ticket { width: 100%; max-width: 80mm; margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
  `]
})
export class TicketVentaComponent {
  @Input() venta: Venta | null = null;
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();

  imprimir() {
    window.print();
  }
}