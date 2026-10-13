<<<<<<< HEAD
# Frontcuentaspagar

Aplicación frontend para cuentas por pagar, configurada para desarrollo local y producción en la nube.

## Entornos

- **DEV (local):** `npm start` sirve la aplicación en `http://localhost:4200`. Las llamadas a `/api` usan el proxy definido en `proxy.conf.json` y se envían al backend local `http://localhost:8080`.
- **PROD (nube):** `npm run build:prod` genera el build optimizado en `dist/cuentaspagar/browser`. Las llamadas a la API se envían a `https://bcuentapagar.onrender.com/api`.
- `npm run build:dev` genera una compilación de desarrollo sin optimización.

## Publicación en Firebase Hosting

El workflow de GitHub Actions compila la aplicación en cada pull request a `main` y la publica en el canal `live` de Firebase Hosting al hacer push a `main`.

Configura en el repositorio de GitHub:

1. La variable de repositorio `FIREBASE_PROJECT_ID` con el ID del proyecto de Firebase.
2. El secreto de repositorio `FIREBASE_SERVICE_ACCOUNT` con el JSON de una cuenta de servicio autorizada para publicar en Firebase Hosting.

La configuración de rutas SPA y caché está en `firebase.json`.

## Pruebas

```bash
npm test
```
=======
<<<<<<< HEAD
# Cuentaspagar


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
=======
# Frontcuentaspagar
Aplicacion frontend 
>>>>>>> 3cbce1ba83265ecc615086f27165d5d8a8f02321
>>>>>>> 1d1300cc24a4bce5b1bcd5e1454c87a2734d4f2e
