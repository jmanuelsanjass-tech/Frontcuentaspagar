import { describe, expect, it } from 'vitest';
import { getVisiblePayablesSections } from './cuentas-por-pagar.service';

describe('getVisiblePayablesSections', () => {
  it.each([
    ['COMPRAS', ['accounts', 'orders']],
    ['RECEPCION', ['receipts']],
    ['CONTABILIDAD', ['accounts', 'invoices', 'payments']],
    ['TESORERIA', ['payments']],
    ['AUDITOR', ['audit']],
  ] as const)('limits %s to its assigned modules', (role, expectedIds) => {
    expect(getVisiblePayablesSections([role]).map((section) => section.id)).toEqual(expectedIds);
  });

  it('normalizes role prefixes, whitespace, and case', () => {
    expect(getVisiblePayablesSections([' role_auditor ']).map((section) => section.id))
      .toEqual(['audit']);
  });

  it('does not expose accounts payable to unrelated roles', () => {
    expect(getVisiblePayablesSections(['VENTAS', 'USER'])).toEqual([]);
  });
});
