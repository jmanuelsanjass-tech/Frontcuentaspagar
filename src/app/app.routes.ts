import { Routes } from '@angular/router';
import { ProveedorListComponent } from './proveedores/proveedor-list.component';
import { ProveedorFormComponent } from './proveedores/proveedor-form.component';

export const routes: Routes = [
	{ path: 'proveedores', component: ProveedorListComponent },
	{ path: 'proveedores/nuevo', component: ProveedorFormComponent },
	{ path: 'proveedores/editar/:id', component: ProveedorFormComponent },
	{ path: '', redirectTo: '/proveedores', pathMatch: 'full' }
];
