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
