import { Routes } from '@angular/router';
<<<<<<< HEAD
import { AuthGuard } from './auth/auth.guard';
=======
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
import { ProveedorListComponent } from './proveedores/proveedor-list.component';
import { ProveedorFormComponent } from './proveedores/proveedor-form.component';

export const routes: Routes = [
<<<<<<< HEAD
	{ path: '', canActivate: [AuthGuard], loadComponent: () => import('./menu-principal.component').then(m => m.MenuPrincipalComponent) },
	{ path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
	{ path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
	{ path: 'ventas', canActivate: [AuthGuard], loadComponent: () => import('./ventas/venta-form.component').then(m => m.VentaFormComponent) },
	{ path: 'proveedores', canActivate: [AuthGuard], component: ProveedorListComponent },
	{ path: 'proveedores/nuevo', canActivate: [AuthGuard], component: ProveedorFormComponent },
	{ path: 'proveedores/editar/:id', canActivate: [AuthGuard], component: ProveedorFormComponent },
	{ path: 'productos', canActivate: [AuthGuard], loadComponent: () => import('./productos.component').then(m => m.ProductosComponent) },
	{ path: 'clientes', canActivate: [AuthGuard], loadComponent: () => import('./clientes/clientes.component').then(m => m.ClientesComponent) },
	{ path: '**', redirectTo: '' }
=======
	{ path: 'ventas', loadComponent: () => import('./ventas/venta-form.component').then(m => m.VentaFormComponent) },
	{ path: 'proveedores', component: ProveedorListComponent },
	{ path: 'proveedores/nuevo', component: ProveedorFormComponent },
	{ path: 'proveedores/editar/:id', component: ProveedorFormComponent },
	{ path: '', redirectTo: '/proveedores', pathMatch: 'full' }
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
];
