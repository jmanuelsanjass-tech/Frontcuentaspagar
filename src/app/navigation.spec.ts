import { describe, expect, it } from 'vitest';
import { getVisibleNavigationItems } from './navigation';

describe('getVisibleNavigationItems', () => {
  it('shows only modules authorized for the VENTAS role', () => {
    expect(getVisibleNavigationItems(['VENTAS']).map((item) => item.id)).toEqual([
      'home',
      'sales',
      'customers',
      'receivables',
    ]);
  });

  it.each(['ADMIN', 'ROLE_ADMIN'])('shows all modules for %s', (role) => {
    expect(getVisibleNavigationItems([role])).toHaveLength(8);
  });

  it('shows accounts payable to the proposed roles', () => {
    for (const role of ['COMPRAS', 'RECEPCION', 'CONTABILIDAD', 'TESORERIA', 'AUDITOR']) {
      expect(getVisibleNavigationItems([role]).some((item) => item.id === 'payables')).toBe(true);
    }
  });

  it('only shows modules assigned to the USER role', () => {
    expect(getVisibleNavigationItems(['USER']).map((item) => item.id)).toEqual(['home']);
  });

  it('shows user administration only to ADMIN', () => {
    expect(getVisibleNavigationItems(['VENTAS']).some((item) => item.id === 'users')).toBe(false);
    expect(getVisibleNavigationItems(['ADMIN']).some((item) => item.id === 'users')).toBe(true);
  });

  it('matches roles without depending on letter case or surrounding spaces', () => {
    expect(getVisibleNavigationItems([' ventas ']).map((item) => item.id)).toEqual([
      'home',
      'sales',
      'customers',
      'receivables',
    ]);
  });
});
