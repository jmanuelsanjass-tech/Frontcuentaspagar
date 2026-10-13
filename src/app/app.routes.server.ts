import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
<<<<<<< HEAD
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
=======
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
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
<<<<<<< HEAD
    path: 'productos',
    renderMode: RenderMode.Client
  },
  {
=======
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
