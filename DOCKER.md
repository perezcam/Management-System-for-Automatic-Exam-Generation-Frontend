# Guía rápida: levantar el frontend con Docker

## 1. Prerrequisitos
- Docker Engine 24+ y Docker Compose plugin 2.20+ (`docker --version`, `docker compose version`).
- Puerto `3000` libre (el contenedor expone el dev server de Next.js).

## 2. Construir la imagen
```bash
docker compose build frontend
```
Esto usa `node:20-alpine`, instala dependencias con `npm ci` y deja el código en `/app` (ver `Dockerfile`).

## 3. Levantar el entorno de desarrollo
```bash
docker compose up frontend
```
o en segundo plano:
```bash
docker compose up -d frontend
```

Características clave (definidas en `docker-compose.yml`):
- Monta el repositorio en `/app` → hot reload inmediato.
- Mantiene `node_modules` en un volumen nombrado → instalaciones limpias por contenedor.
- Exporta `HOST=0.0.0.0`, desactiva la telemetría de Next y habilita `WATCHPACK_POLLING=true` para recarga fiable dentro de Docker.

## 4. Acceder a la aplicación
Abre [http://localhost:3000](http://localhost:3000/). El comando `npm run dev` se ejecuta dentro del contenedor, por lo que no necesitas instalar dependencias localmente.

## 5. Comandos útiles
- Ver logs en vivo:
  ```bash
  docker compose logs -f frontend
  ```
- Reconstruir tras cambios en dependencias (`package*.json`):
  ```bash
  docker compose up --build frontend
  ```
- Detener y limpiar contenedores/volúmenes:
  ```bash
  docker compose down      # conserva el volumen node_modules
  docker compose down -v   # también borra el volumen
  ```

## 6. Variables de entorno
- Para valores sensibles crea un `.env` y referencia con `${VAR}` en `docker-compose.yml`.
- Usa `docker compose run -e CLAVE=valor frontend <comando>` para overrides puntuales.

## 7. Problemas comunes
- **Cambios no se reflejan**: confirma que el montaje `.:/app` sigue activo y que no hay errores de permisos en el host.
- **Puerto ocupado**: ajusta el mapeo `HOST_PORT:3000` en `docker-compose.yml`.
- **Dependencias corruptas**: ejecuta `docker compose down -v` para regenerar `node_modules`.
