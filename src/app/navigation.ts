export type NavigationItemId =
  | 'home'
  | 'suppliers'
  | 'sales'
  | 'products'
  | 'customers'
  | 'receivables'
  | 'payables'
  | 'users';

export interface NavigationItem {
  id: NavigationItemId;
  label: string;
  path: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  iconClass: string;
}

const moduleRoles: Record<Exclude<NavigationItemId, 'home'>, readonly string[]> = {
  suppliers: ['ADMIN', 'INVENTARIOS'],
  sales: ['ADMIN', 'VENTAS'],
  products: ['ADMIN', 'INVENTARIOS'],
  customers: ['ADMIN', 'VENTAS'],
  receivables: ['ADMIN', 'VENTAS', 'CONTABILIDAD'],
  payables: [
    'ADMIN',
    'COMPRAS',
    'RECEPCION',
    'CONTABILIDAD',
    'TESORERIA',
    'AUDITOR',
    'INVENTARIOS',
  ],
  users: ['ADMIN'],
};

export const navigationItems: readonly NavigationItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    path: '/',
    title: 'Inicio',
    description: 'Regresa al menú principal.',
    action: 'Ir al inicio',
    icon: 'IN',
    iconClass: 'module-icon',
  },
  {
    id: 'suppliers',
    label: 'Proveedores',
    path: '/proveedores',
    title: 'Proveedores',
    description: 'Consulta y administra el directorio de proveedores.',
    action: 'Ir a proveedores',
    icon: 'PR',
    iconClass: 'module-icon suppliers-icon',
  },
  {
    id: 'sales',
    label: 'Ventas',
    path: '/ventas',
    title: 'Ventas',
    description: 'Registra productos, pagos y ventas.',
    action: 'Ir a ventas',
    icon: 'VE',
    iconClass: 'module-icon sales-icon',
  },
  {
    id: 'products',
    label: 'Inventario',
    path: '/productos',
    title: 'Inventario',
    description: 'Consulta y administra el inventario de productos.',
    action: 'Ir a Inventario',
    icon: 'PR',
    iconClass: 'module-icon products-icon',
  },
  {
    id: 'customers',
    label: 'Clientes',
    path: '/clientes',
    title: 'Clientes',
    description: 'Accede al módulo para administrar clientes.',
    action: 'Ir a clientes',
    icon: 'CL',
    iconClass: 'module-icon customers-icon',
  },
  {
    id: 'receivables',
    label: 'Cuenta por Cobrar',
    path: '/cuentas-por-cobrar',
    title: 'Cuenta por Cobrar',
    description: 'Administra cuentas, saldos y movimientos de cobranza.',
    action: 'Ir a Cuenta por Cobrar',
    icon: 'CC',
    iconClass: 'module-icon receivable-icon',
  },
  {
    id: 'payables',
    label: 'Cuentas por pagar',
    path: '/cuentas-por-pagar',
    title: 'Cuentas por pagar',
    description: 'Consulta compras, recepciones, facturas, pagos y auditoría.',
    action: 'Ir a Cuentas por pagar',
    icon: 'CP',
    iconClass: 'module-icon receivable-icon',
  },
  {
    id: 'users',
    label: 'Usuarios',
    path: '/usuarios',
    title: 'Administración de usuarios',
    description: 'Crea cuentas, asigna roles y consulta la bitácora administrativa.',
    action: 'Administrar usuarios',
    icon: 'US',
    iconClass: 'module-icon users-icon',
  },
];

export function getVisibleNavigationItems(roles: readonly string[]): NavigationItem[] {
  const normalizedRoles = roles.map((role) => {
    const normalizedRole = role.trim().toUpperCase();
    return normalizedRole.startsWith('ROLE_') ? normalizedRole.slice('ROLE_'.length) : normalizedRole;
  });

  return navigationItems.filter((item) => {
    if (item.id === 'home') {
      return true;
    }

    const allowedRoles = moduleRoles[item.id];
    return normalizedRoles.some((role) => allowedRoles.includes(role));
  });
}

export function canAccessNavigationItem(
  itemId: NavigationItemId,
  roles: readonly string[],
): boolean {
  return getVisibleNavigationItems(roles).some((item) => item.id === itemId);
}

export function isNavigationItemId(value: unknown): value is NavigationItemId {
  return navigationItems.some((item) => item.id === value);
}
