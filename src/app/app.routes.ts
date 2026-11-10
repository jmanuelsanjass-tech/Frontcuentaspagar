import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { ProveedorListComponent } from './proveedores/proveedor-list.component';
import { ProveedorFormComponent } from './proveedores/proveedor-form.component';

export const routes: Routes = [
	{ path: '', canActivate: [AuthGuard], loadComponent: () => import('./menu-principal.component').then(m => m.MenuPrincipalComponent) },
	{ path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
	{ path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
	{ path: 'ventas', canActivate: [AuthGuard], data: { navigationItemId: 'sales' }, loadComponent: () => import('./ventas/venta-form.component').then(m => m.VentaFormComponent) },
	{ path: 'proveedores', canActivate: [AuthGuard], data: { navigationItemId: 'suppliers' }, component: ProveedorListComponent },
	{ path: 'proveedores/nuevo', canActivate: [AuthGuard], data: { navigationItemId: 'suppliers' }, component: ProveedorFormComponent },
	{ path: 'proveedores/editar/:id', canActivate: [AuthGuard], data: { navigationItemId: 'suppliers' }, component: ProveedorFormComponent },
	{ path: 'productos', canActivate: [AuthGuard], data: { navigationItemId: 'products' }, loadComponent: () => import('./productos.component').then(m => m.ProductosComponent) },
	{ path: 'clientes', canActivate: [AuthGuard], data: { navigationItemId: 'customers' }, loadComponent: () => import('./clientes/clientes.component').then(m => m.ClientesComponent) },
	{ path: 'cuentas-por-cobrar', canActivate: [AuthGuard], data: { navigationItemId: 'receivables' }, loadComponent: () => import('./cuentas-por-cobrar/cuentas-por-cobrar.component').then(m => m.CuentasPorCobrarComponent) },
	{ path: 'usuarios', canActivate: [AuthGuard], data: { navigationItemId: 'users' }, loadComponent: () => import('./admin/usuarios.component').then(m => m.UsuariosComponent) },
	{ path: '**', redirectTo: '' }
];
