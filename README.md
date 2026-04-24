# PresupuestoYa

Generador de presupuestos en PDF para trabajadores independientes argentinos.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **PDF:** pdfkit

## Funcionalidades

- Carga de datos del trabajador (con logo opcional)
- Datos del cliente
- Ítems del trabajo con cálculo automático de subtotales y total
- Notas opcionales
- Vista previa del PDF antes de descargar
- Datos del trabajador recordados en localStorage

## Cómo correr en desarrollo

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Levantar cliente (Vite, puerto 5173) y servidor (Express, puerto 3001)
npm run dev
```

El frontend usa el proxy de Vite para redirigir `/api` al servidor, sin CORS.

## Cómo buildear para producción

```bash
npm run build
```

Genera `client/dist/`. El servidor Express sirve esos archivos estáticos en producción.

## Cómo correr en producción

```bash
# Crear server/.env a partir del ejemplo
cp server/.env.example server/.env

# Buildear el frontend
npm run build

# Iniciar
npm start
```

La app queda disponible en el `PORT` definido en `server/.env` (default: `3001`).

## Variables de entorno

Copiar `server/.env.example` a `server/.env`:

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto del servidor |
| `NODE_ENV` | `development` | `production` en deploy |

## Deploy recomendado

La app es un monolito Node.js: el servidor Express sirve tanto la API como el frontend buildeado.
Plataformas compatibles: **Railway**, **Render**, **Fly.io**, **VPS con PM2**.

Comando de build: `npm run build`  
Comando de start: `npm start`
