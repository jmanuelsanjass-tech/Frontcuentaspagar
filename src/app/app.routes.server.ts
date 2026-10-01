import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'ventas',
    renderMode: RenderMode.Client
  },
  {
    path: 'proveedores',
    renderMode: RenderMode.Client
  },
  {
    path: 'proveedores/editar/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
