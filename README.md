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

### Archivos y responsabilidades

- `src/app/auth/login.component.ts` implementa la pantalla de acceso y su formulario reactivo. Las señales `cargando` y `error` controlan los estados de envío y los mensajes.
- `src/app/auth/register.component.ts` implementa el registro, con los campos de usuario, contraseña y rol.
- `src/app/services/auth.service.ts` concentra las solicitudes HTTP de autenticación y mantiene el indicador de sesión del frontend.
- `src/app/auth/auth.guard.ts` protege la navegación a las pantallas internas comprobando el estado que expone `AuthService`.
- `src/app/app.routes.ts` declara las rutas públicas y las rutas protegidas con `AuthGuard`.
- `src/app/app.ts` presenta la navegación global y coordina el cierre de sesión.
- `src/environments/environment.ts` define la URL base de la API para desarrollo; `src/environments/environment.production.ts` define la URL de producción.

El endpoint `POST /api/auth/login` debe responder con `{ "username": "melissa", "roles": ["VENTAS"] }`. La interfaz usa esos roles para filtrar los enlaces de navegación y los módulos del menú principal, y para impedir la navegación directa a módulos no habilitados. `VENTAS` permite Inicio y Ventas; `ADMIN`, `ROLE_ADMIN` y `ROLE_USER` permiten todos los módulos. La autorización definitiva de las operaciones debe seguir aplicándose en el backend.

### Inicio de sesión

1. La ruta `/login` está disponible sin sesión. El formulario solicita `username` y `password`; ambos son obligatorios mediante `Validators.required`.
2. Si el formulario es inválido o ya hay una solicitud en curso, no se envía otra petición. Los controles se marcan como tocados para mostrar su validación.
3. `AuthService.login()` envía `POST /api/auth/login` con el JSON `{ "username": "...", "password": "..." }`. La respuesta se consume como `void`; el frontend no procesa un token en el cuerpo.
4. Si el servidor responde correctamente, el componente llama a `markAuthenticated()` y navega a `/`. Si la solicitud devuelve `401` o `403`, informa que las credenciales no son válidas; para otros errores HTTP o de conexión presenta un mensaje general.
5. El estado de carga se restablece después de la respuesta y de la navegación. Los errores se anuncian con `role="alert"`.

El campo de contraseña usa `type="password"` y los campos incluyen etiquetas, atributos de autocompletado (`username` y `current-password`), mensajes asociados mediante `aria-describedby` y `aria-invalid` cuando corresponde. La validación del cliente solo comprueba que los valores no estén vacíos; la autenticación y cualquier política adicional deben validarse en el servidor.

### Registro

La ruta `/register` también es pública. El formulario envía `POST /api/auth/register` con `{ "username": "...", "password": "...", "rol": "ROLE_USER" }`; el rol inicial del formulario es `ROLE_USER` y también se ofrece `ROLE_ADMIN`. La respuesta se trata como texto. Cuando el registro termina correctamente, se informa al usuario y se navega a `/login`; el registro no inicia automáticamente una sesión.

Los errores de registro distinguen, entre otros, problemas de conexión (`status 0`), ruta inexistente (`404`), datos rechazados o usuario duplicado (`400` o `409`) y falta de autorización (`401` o `403`). El mensaje del servidor se muestra cuando se entrega en un formato reconocido.

La selección de rol en el cliente no debe considerarse una autorización. En producción, el servidor debe impedir que una persona se asigne privilegios administrativos mediante el registro público; idealmente, la asignación de roles privilegiados se realiza solo por un flujo administrativo confiable.

### Estado de sesión, rutas y cierre de sesión

Después de un inicio de sesión exitoso, `markAuthenticated()` guarda `authenticated=true` en `localStorage` y actualiza una señal. Al cargar la aplicación en un navegador, `AuthService` recupera ese valor; durante la renderización fuera del navegador no accede a `localStorage`. `isLoggedIn()` consulta la señal y `clearAuthentication()` elimina el valor local y actualiza la señal.

`AuthGuard` usa `isLoggedIn()` para dejar pasar las rutas internas o redirigir a `/login`. Las rutas de inicio de sesión y registro no requieren esta guarda. El guard controla la navegación y la experiencia de usuario dentro de Angular: no impide que alguien invoque directamente la API ni sustituye los controles de acceso del backend.

Al seleccionar **Salir**, `app.ts` solicita `POST /api/auth/logout`. Si el servidor responde correctamente, se borra el indicador local y se navega a `/login`. Si falla la solicitud, también se borra el indicador local y se navega a `/login`, pero se informa que el servidor no confirmó el cierre. La aplicación no conserva la contraseña después del envío.

### URL de API y desarrollo

En desarrollo, `environment.apiUrl` es una cadena vacía; por ello las solicitudes se hacen a rutas relativas como `/api/auth/login`. `npm start` aplica `proxy.conf.json` y reenvía `/api/**` a `http://localhost:8080`. En producción, `environment.production.ts` configura la URL completa del backend. El proxy local no participa en el despliegue.

### Consideraciones de seguridad

El valor `authenticated` de `localStorage` es únicamente un indicador de interfaz: no es un token, no está firmado y no prueba la identidad del usuario. Un usuario puede modificarlo desde el navegador. Por tanto, ni `AuthGuard` ni la visibilidad del botón **Salir** protegen los datos.

En la configuración actual de `BCuentaPagar/demo`, `SecurityConfig` usa `.anyRequest().permitAll()`. Esto permite que todas las solicitudes pasen el filtro de autorización de Spring Security sin autenticarse, incluso si las páginas de Angular están protegidas por `AuthGuard`. La autorización efectiva requiere que el backend aplique autenticación y permisos en cada endpoint protegido; para usar una sesión HTTP también deben configurarse y enviarse correctamente las credenciales/cookies en las solicitudes entre dominios. Deshabilitar CSRF requiere además evaluar cuidadosamente el mecanismo de autenticación elegido antes de producción.

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
