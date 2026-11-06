# Frontcuentaspagar

Aplicación frontend para POV - Puno de Venta, desarrollada con Angular.

## Desarrollo y compilación

- `npm start` inicia el servidor local en `http://localhost:4200`. Las solicitudes a `/api` se reenvían al backend local `http://localhost:8080` mediante `proxy.conf.json`.
- `npm test` ejecuta las pruebas unitarias.
- `npm run build` compila la aplicación con la configuración de producción predeterminada.
- Para compilar en modo desarrollo: `npm run build -- --configuration development`.

Los builds generan archivos en `dist/cuentaspagar/browser`. La URL base de la API se configura en `src/environments/environment.ts` para desarrollo y en `src/environments/environment.production.ts` para producción.

## Publicación

El workflow de GitHub Actions compila la aplicación para Firebase Hosting y GitHub Pages al abrir un pull request o hacer push a `main`. Solo los pushes a `main` ejecutan la publicación. La configuración de compilación y despliegue está en `.github/workflows/main.yml`.

El despliegue de Firebase requiere el secreto `FIREBASE_SERVICE_ACCOUNT_ZAPATERIA_ERP_FRONT` configurado en el repositorio de GitHub. La configuración de rutas SPA para ambos despliegues incluye una copia de `index.html` como `404.html`.

## Nota técnica: inicio de sesión

### Componentes y responsabilidades

- `src/app/auth/login.component.ts` presenta la pantalla, valida los campos, coordina el envío y muestra los estados de carga y error. Es un componente standalone que utiliza formularios reactivos, señales de Angular para el estado local y `Router` para la navegación.
- `src/app/services/auth.service.ts` encapsula las solicitudes de autenticación y mantiene el indicador de sesión usado por el frontend.
- `src/environments/environment.ts` define la URL base de la API en desarrollo; `src/environments/environment.production.ts` la define para producción.

### Formulario y validación

El formulario contiene `username` y `password`, ambos obligatorios mediante `Validators.required`. Al intentar enviar un formulario inválido, no se hace ninguna solicitud y se marcan todos los controles como tocados para mostrar los mensajes de validación. El botón permanece deshabilitado mientras el formulario sea inválido o haya una solicitud en curso.

El control de contraseña utiliza `type="password"`. Los campos tienen etiquetas asociadas, atributos de autocompletado (`username` y `current-password`) y mensajes de error vinculados con `aria-describedby`; `aria-invalid` refleja si un campo inválido ya fue tocado.

### Flujo de autenticación

1. `login()` comprueba de nuevo que el formulario sea válido y que no exista una autenticación en curso. Esta guardia evita envíos inválidos o duplicados.
2. Se limpia el error anterior, se activa el estado `cargando` y se leen los valores del formulario.
3. `AuthService.login(username, password)` envía un `POST` con el cuerpo JSON `{ username, password }` a `${environment.apiUrl}/api/auth/login`. En desarrollo, las solicitudes `/api` se reenvían al backend local mediante `proxy.conf.json`.
4. Si la solicitud termina correctamente, se llama a `markAuthenticated()` y se navega a la ruta `/`. Al finalizar la navegación se desactiva el estado de carga.
5. Si la solicitud falla con HTTP `401` o `403`, se muestra un mensaje de credenciales inválidas. Para otros errores HTTP o de conexión se muestra un mensaje general que indica que no fue posible iniciar sesión. En ambos casos se restablece el estado de carga y el error se anuncia con `role="alert"`.

### Estado de sesión y límites de seguridad

Tras una respuesta exitosa, `AuthService` guarda `authenticated=true` en `localStorage` y actualiza su señal interna. Al inicializarse en el navegador, recupera ese indicador; en contextos que no son navegador no accede a `localStorage`. El servicio también expone `isLoggedIn()`, `clearAuthentication()` y `logout()` para consultar, limpiar el indicador y solicitar el cierre de sesión.

El valor de `localStorage` es únicamente un indicador de estado para la interfaz: no es un token ni demuestra por sí mismo la identidad del usuario. El componente no conserva la contraseña después de la solicitud. El backend debe autenticar cada solicitud protegida y aplicar allí las reglas de autorización; no se debe confiar en este indicador para proteger recursos.

## Pantalla de clientes

La pantalla `/clientes` consume el CRUD de `${environment.apiUrl}/api/clientes`: `GET` lista, `GET /{id}` consulta el detalle, `POST` crea, `PUT /{id}` actualiza y `DELETE /{id}` elimina. La respuesta identifica cada registro con `idCliente`.

El formulario envía `nombre`, `telefono`, `correo`, `direccion`, `estadoDireccion`, `estado` e `historialCompras`; `qrCode` se omite si está vacío. El teléfono debe contener exactamente 10 dígitos, `estadoDireccion` corresponde a uno de los 32 estados admitidos y `estado` acepta `activo`, `inactivo` o `prospecto`. El código QR opcional se ingresa como Base64 sin prefijo `data:`. Las respuestas HTTP `404` se muestran en la operación correspondiente.

## Pantalla de proveedores

La pantalla `/proveedores` consume el CRUD de `${environment.apiUrl}/api/proveedores`: `GET` lista, `GET /{id}` consulta el detalle, `POST` crea, `PUT /{id}` actualiza y `DELETE /{id}` elimina. La respuesta identifica cada registro con `idProveedor`.

El formulario envía `nombre`, `telefono`, `correo`, `direccion`, `estadoDireccion`, `estado` y `productosSuministrados`. El teléfono debe contener exactamente 10 dígitos; el correo debe ser válido y único; `estadoDireccion` debe ser uno de los 32 estados admitidos y `estado` acepta `activo` o `inactivo`. El identificador, fechas de registro/auditoría y `qrCode` se gestionan aparte y no se envían en el formulario. Los errores HTTP y las respuestas `404` se muestran en la operación correspondiente.

## Pantalla de ventas

La pantalla `/ventas` consume `GET /api/ventas`, `GET /api/ventas/{id}`, `POST /api/ventas`, `PUT /api/ventas/{id}` y `DELETE /api/ventas/{id}`. El listado y la consulta muestran cada venta con sus detalles; al editar, se envía la lista completa de detalles que debe quedar guardada.

El formulario envía únicamente `clienteId`, `descuento`, `iva`, `estado` y `detalles` con `codigoBarras`, `cantidad` y `precioUnitario`. El subtotal estimado suma cantidad por precio unitario y el total estimado es subtotal menos descuento más IVA; el servidor calcula y persiste los importes definitivos. No se envían IDs de venta o detalle, subtotal, total ni campos de auditoría.

## Pantalla de cuentas por cobrar

El menú principal incluye `/cuentas-por-cobrar`, con secciones para cuentas y su historia. La pantalla consume el CRUD de `/api/cuentas-por-cobrar` y `/api/cuentas-por-cobrar-historia`, incluyendo consultas individuales, edición y eliminación. La cuenta requiere cliente, venta y fechas; el backend verifica que la venta pertenezca al cliente. Los importes y días vencidos vacíos se envían como cero; los estatus aceptados son `Pendiente`, `Pagado` y `Cancelado`.

El historial requiere `idHistoria` al crear y permite los tipos `ALTA`, `ABONO`, `Cancelado`, `PAGO_TOTAL`, `REESTRUCTURA`, `PRORROGA`, `CANCELACION`, `CASTIGO`, `BLOQUEO_CREDITO` y `DESBLOQUEO_CREDITO`. Registrar o editar un movimiento no actualiza automáticamente el saldo de la cuenta. Una cuenta con movimientos de historia asociados podría no poder eliminarse por la llave foránea.

### Interfaz y versión

La pantalla ofrece enlaces al menú principal (`/`) y al registro (`/register`), foco visible para los controles y mensajes de error asociados a los campos o anunciados como alertas. La ilustración del encabezado usa `NgOptimizedImage`. La versión visible en la tarjeta se importa de `src/environments/deployment-version.ts`.
