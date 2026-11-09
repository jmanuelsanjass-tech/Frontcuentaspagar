import { describe, expect, it } from 'vitest';
import { getVisibleNavigationItems } from './navigation';

describe('getVisibleNavigationItems', () => {
  it('shows only Inicio and Ventas for the VENTAS role', () => {
    expect(getVisibleNavigationItems(['VENTAS']).map((item) => item.id)).toEqual([
      'home',
      'sales',
    ]);
  });

  it.each(['ADMIN', 'ROLE_ADMIN', 'ROLE_USER'])('shows all modules for %s', (role) => {
    expect(getVisibleNavigationItems([role])).toHaveLength(6);
  });

  it('matches roles without depending on letter case or surrounding spaces', () => {
    expect(getVisibleNavigationItems([' ventas ']).map((item) => item.id)).toEqual([
      'home',
      'sales',
    ]);
  });
});
