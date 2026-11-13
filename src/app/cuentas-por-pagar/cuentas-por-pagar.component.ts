import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CuentasPorPagarService,
  PayablesRow,
  PayablesSection,
  PayablesSectionId,
  getVisiblePayablesSections,
} from '../services/cuentas-por-pagar.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cuentas-por-pagar',
  imports: [RouterLink],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Finanzas y abastecimiento</p>
          <h1>Cuentas por pagar</h1>
          <p class="description">
            Consulta compras, recepciones, facturas, pagos y controles de aprobación.
          </p>
        </div>
        <a routerLink="/" class="back-link">Volver al menú</a>
      </header>

      <aside class="context-notice" aria-label="Modo de consulta">
        <strong>Modo de consulta.</strong>
        Las escrituras están deshabilitadas hasta que la sesión proporcione la empresa y la
        identidad UUID del usuario que exige el esquema.
      </aside>

      @if (availableSections().length > 0) {
        <nav class="tabs" aria-label="Módulos de cuentas por pagar">
          @for (section of availableSections(); track section.id) {
            <button
              type="button"
              [class.active]="selectedSectionId() === section.id"
              [attr.aria-pressed]="selectedSectionId() === section.id"
              (click)="selectSection(section.id)"
            >{{ section.label }}</button>
          }
        </nav>
      }

      @if (selectedSection(); as section) {
        <section class="panel" aria-labelledby="section-heading">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Consulta</p>
              <h2 id="section-heading">{{ section.title }}</h2>
            </div>
            <button class="button disabled-action" type="button" disabled>
              Escrituras deshabilitadas
            </button>
          </div>

          @if (loading()) {
            <p class="message" role="status">Cargando {{ section.label.toLowerCase() }}...</p>
          } @else if (error()) {
            <div class="error-box" role="alert">
              <p>{{ error() }}</p>
              <button type="button" class="button secondary" (click)="retry()">Reintentar</button>
            </div>
          } @else if (rows().length === 0) {
            <p class="empty-state">No hay registros para mostrar.</p>
          } @else {
            <div class="table-wrap" role="region" [attr.aria-label]="section.title" tabindex="0">
              <table>
                <caption>{{ section.title }}</caption>
                <thead>
                  <tr>
                    @for (column of section.columns; track column) {
                      <th scope="col">{{ column }}</th>
                    }
                    @if (section.detailColumns) {
                      <th scope="col">Detalle</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows(); track row.id) {
                    <tr>
                      @for (cell of row.cells; track $index) {
                        <td>{{ cell }}</td>
                      }
                      @if (section.detailColumns) {
                        <td>
                          <button
                            type="button"
                            class="text-button"
                            [disabled]="loadingDetails()"
                            [attr.aria-expanded]="expandedRowId() === row.id"
                            [attr.aria-label]="
                              (expandedRowId() === row.id ? 'Ocultar' : 'Ver') +
                              ' detalle de ' + row.id
                            "
                            (click)="toggleDetails(section, row)"
                          >{{ expandedRowId() === row.id ? 'Ocultar' : 'Ver líneas' }}</button>
                        </td>
                      }
                    </tr>
                    @if (expandedRowId() === row.id && section.detailColumns) {
                      <tr>
                        <td [attr.colspan]="section.columns.length + 1">
                          <section class="detail-panel" [attr.aria-label]="'Detalle de ' + row.id">
                            <h3>Detalle de {{ row.id }}</h3>
                            @if (loadingDetails()) {
                              <p role="status">Cargando líneas...</p>
                            } @else if (detailError()) {
                              <p class="inline-error" role="alert">{{ detailError() }}</p>
                            } @else if (detailRows().length === 0) {
                              <p class="empty-state">No hay líneas registradas.</p>
                            } @else {
                              <div class="table-wrap">
                                <table>
                                  <thead>
                                    <tr>
                                      @for (column of section.detailColumns; track column) {
                                        <th scope="col">{{ column }}</th>
                                      }
                                    </tr>
                                  </thead>
                                  <tbody>
                                    @for (line of detailRows(); track line.id) {
                                      <tr>
                                        @for (cell of line.cells; track $index) {
                                          <td>{{ cell }}</td>
                                        }
                                      </tr>
                                    }
                                  </tbody>
                                </table>
                              </div>
                            }
                          </section>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 76px);
      color: #172b4d;
      background: #f4f7fb;
      font-family: "Segoe UI", sans-serif;
    }

    .page {
      width: min(1180px, calc(100% - 40px));
      margin: 0 auto;
      padding: 48px 0 72px;
    }

    .page-header,
    .section-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .eyebrow,
    .section-kicker {
      margin: 0 0 8px;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 36px);
      font-weight: 650;
    }

    .description {
      margin: 10px 0 0;
      color: #52637a;
    }

    .back-link,
    .text-button {
      color: #1d4ed8;
      font-weight: 650;
    }

    .back-link:focus-visible,
    .text-button:focus-visible,
    .tabs button:focus-visible,
    .button:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
    }

    .context-notice {
      margin: 0 0 20px;
      padding: 14px 16px;
      border: 1px solid #9db8ec;
      border-radius: 8px;
      color: #173a73;
      background: #edf4ff;
      line-height: 1.5;
    }

    .tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      margin-bottom: 18px;
      border-bottom: 1px solid #cbd5e1;
    }

    .tabs button {
      min-height: 44px;
      flex: 0 0 auto;
      border: 0;
      border-bottom: 3px solid transparent;
      padding: 0 14px;
      color: #52637a;
      background: transparent;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .tabs button.active {
      border-bottom-color: #1d4ed8;
      color: #1e40af;
    }

    .panel,
    .detail-panel {
      border: 1px solid #dbe4f0;
      border-radius: 10px;
      padding: 22px;
      background: #fff;
      box-shadow: 0 8px 24px rgb(30 64 175 / 6%);
    }

    .section-heading {
      align-items: center;
      margin-bottom: 18px;
    }

    .section-kicker {
      margin-bottom: 4px;
    }

    h2,
    h3 {
      margin: 0;
    }

    h2 {
      font-size: 21px;
    }

    h3 {
      margin-bottom: 12px;
      font-size: 16px;
    }

    .button {
      min-height: 40px;
      border: 1px solid #c5d0df;
      border-radius: 6px;
      padding: 0 13px;
      color: #334155;
      background: #fff;
      font: inherit;
      font-weight: 650;
      cursor: pointer;
    }

    .button.secondary {
      color: #1d4ed8;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .table-wrap {
      overflow: auto;
      max-width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    caption {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    th,
    td {
      min-width: 105px;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 10px;
      vertical-align: top;
    }

    th {
      color: #334155;
      background: #f8fafc;
      font-size: 13px;
      font-weight: 700;
    }

    td {
      color: #334155;
      font-size: 14px;
      overflow-wrap: anywhere;
    }

    .text-button {
      border: 0;
      padding: 4px 2px;
      background: transparent;
      font: inherit;
      cursor: pointer;
    }

    .text-button:disabled {
      cursor: wait;
      opacity: 0.6;
    }

    .detail-panel {
      padding: 18px;
      background: #f8fafc;
      box-shadow: none;
    }

    .message,
    .empty-state {
      margin: 0;
      padding: 14px 0;
      color: #52637a;
    }

    .error-box,
    .inline-error {
      color: #8b1d19;
    }

    .error-box p {
      margin: 0 0 12px;
    }

    @media (max-width: 640px) {
      .page {
        padding-top: 32px;
      }

      .page-header,
      .section-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .panel {
        padding: 16px;
      }
    }
  `,
})
export class CuentasPorPagarComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(CuentasPorPagarService);
  private readonly destroyRef = inject(DestroyRef);
  private requestSequence = 0;
  private detailRequestSequence = 0;

  readonly availableSections = computed(() => {
    return getVisiblePayablesSections(this.auth.userRoles());
  });
  readonly selectedSectionId = signal<PayablesSectionId | null>(null);
  readonly selectedSection = computed(
    () => this.availableSections().find((section) => section.id === this.selectedSectionId()) ?? null,
  );
  readonly rows = signal<PayablesRow[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly expandedRowId = signal<string | null>(null);
  readonly detailRows = signal<PayablesRow[]>([]);
  readonly loadingDetails = signal(false);
  readonly detailError = signal('');

  ngOnInit(): void {
    const firstSection = this.availableSections()[0];
    if (firstSection) {
      this.selectSection(firstSection.id);
    }
  }

  selectSection(sectionId: PayablesSectionId): void {
    if (!this.availableSections().some((section) => section.id === sectionId)) {
      return;
    }
    this.selectedSectionId.set(sectionId);
    this.detailRequestSequence += 1;
    this.expandedRowId.set(null);
    this.detailRows.set([]);
    this.detailError.set('');
    this.loadingDetails.set(false);
    this.loadSection(sectionId);
  }

  retry(): void {
    const section = this.selectedSectionId();
    if (section) {
      this.loadSection(section);
    }
  }

  toggleDetails(section: PayablesSection, row: PayablesRow): void {
    if (this.expandedRowId() === row.id) {
      this.expandedRowId.set(null);
      this.detailRows.set([]);
      return;
    }

    const requestId = ++this.detailRequestSequence;
    this.expandedRowId.set(row.id);
    this.detailRows.set([]);
    this.detailError.set('');
    this.loadingDetails.set(true);
    this.service.listarDetalle(section.id, row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (requestId !== this.detailRequestSequence) {
            return;
          }
          this.detailRows.set(rows);
          this.loadingDetails.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.detailRequestSequence) {
            return;
          }
          this.detailError.set(getRequestError(error));
          this.loadingDetails.set(false);
        },
      });
  }

  private loadSection(sectionId: PayablesSectionId): void {
    const requestId = ++this.requestSequence;
    this.loading.set(true);
    this.error.set('');
    this.rows.set([]);
    this.service.listar(sectionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (requestId !== this.requestSequence) {
            return;
          }
          this.rows.set(rows);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.requestSequence) {
            return;
          }
          this.error.set(getRequestError(error));
          this.loading.set(false);
        },
      });
  }
}

function getRequestError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 403) {
      return 'Tu rol no tiene permiso para consultar esta información.';
    }
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }
    return `El servidor no pudo completar la consulta (HTTP ${error.status}).`;
  }
  return 'Ocurrió un error inesperado al consultar la información.';
}
