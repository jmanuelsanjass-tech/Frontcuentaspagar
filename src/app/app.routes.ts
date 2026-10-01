import { Routes } from '@angular/router';
import { ProveedorListComponent } from './proveedores/proveedor-list.component';
import { ProveedorFormComponent } from './proveedores/proveedor-form.component';

export const routes: Routes = [
	{ path: 'ventas', loadComponent: () => import('./ventas/venta-form.component').then(m => m.VentaFormComponent) },
	{ path: 'proveedores', component: ProveedorListComponent },
	{ path: 'proveedores/nuevo', component: ProveedorFormComponent },
	{ path: 'proveedores/editar/:id', component: ProveedorFormComponent },
	{ path: '', redirectTo: '/proveedores', pathMatch: 'full' }
];
