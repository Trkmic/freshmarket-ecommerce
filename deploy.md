# Guía de Despliegue en la Nube: Organique Premium

Esta guía detalla los pasos para desplegar tu aplicación en vivo de forma **100% gratuita**. Desplegaremos:
1. La **Base de Datos MySQL** en la nube usando **Aiven.io**.
2. El **Backend en Node.js + Express** en la nube usando **Render.com**.
3. El **Frontend estático** en la nube usando **Vercel.com** (o **GitHub Pages**).

---

## Requisitos Previos
- Una cuenta de [GitHub](https://github.com).
- Una cuenta de [Render](https://render.com) (inicia sesión con tu GitHub).
- Una cuenta de [Vercel](https://vercel.com) (inicia sesión con tu GitHub).
- Una cuenta de [Aiven](https://aiven.io) (inicia sesión con GitHub o Google).

---

## Paso 1: Crear la Base de Datos MySQL en la nube (Aiven.io)
1. Inicia sesión en [Aiven Console](https://console.aiven.io).
2. Haz clic en **Create Service**.
3. Selecciona **MySQL**.
4. Selecciona el plan **Free** (disponible en regiones de AWS como `us-east-1`).
5. Asigna un nombre al servicio (ej: `organique-db`) y haz clic en **Create Service**.
6. Espera unos minutos a que el estado cambie a **Running**.
7. En la pestaña **Overview**, copia los datos de conexión (**Connection Info**):
   - **Host** (ej: `mysql-xxxx.aivencloud.com`)
   - **Port** (ej: `25687` o similar)
   - **User** (ej: `avnadmin`)
   - **Password** (haz clic en mostrar y cópiala)
   - **Database** (ej: `defaultdb`)

---

## Paso 2: Subir el Código a GitHub
Debes crear un repositorio en tu GitHub para subir el proyecto completo.

Abre una terminal en la raíz de tu proyecto local (`parcial1-TrkmicTorres-Ignacio`) y ejecuta:
```bash
# Inicializar repositorio git
git init

# Crear archivo .gitignore para evitar subir dependencias y la base de datos local
echo "node_modules/" > .gitignore
echo "backend/node_modules/" >> .gitignore
echo "backend/organique.db" >> .gitignore
echo ".env" >> .gitignore

# Agregar archivos y confirmar
git add .
git commit -m "feat: setup front and modular backend with DB support"

# Conectar a tu repo en GitHub (reemplaza por tu URL real)
git remote add origin https://github.com/TU_USUARIO/organique-shop.git
git branch -M main
git push -u origin main
```

---

## Paso 3: Desplegar el Backend en Render.com
1. Inicia sesión en [Render Dashboard](https://dashboard.render.com).
2. Haz clic en **New +** y selecciona **Web Service**.
3. Selecciona **Build and deploy from a Git repository**.
4. Conecta tu repositorio de GitHub `organique-shop`.
5. Configura los parámetros del servicio:
   - **Name:** `organique-backend`
   - **Region:** Elige una cercana a tu base de datos (ej: `us-east`).
   - **Branch:** `main`
   - **Root Directory:** `backend` *(¡Muy importante! Apunta a la subcarpeta del backend)*.
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
6. Ve a la sección **Environment Variables** (dentro de la misma configuración) y agrega las variables que obtuviste en el Paso 1 de Aiven:
   - `DB_HOST` = El host de Aiven.
   - `DB_PORT` = El puerto de Aiven.
   - `DB_USER` = `avnadmin` (o tu usuario).
   - `DB_PASSWORD` = Tu contraseña de Aiven.
   - `DB_NAME` = `defaultdb`.
7. Haz clic en **Create Web Service**.
8. Espera a que termine la compilación. Una vez finalizada, copia la URL HTTPS de tu backend provista por Render (ej: `https://organique-backend.onrender.com`).

---

## Paso 4: Actualizar el Frontend para apuntar al Backend en Producción
Abre el archivo `js/store.js` en tu IDE y modifica la URL de Render con la que copiaste en el paso anterior:

```javascript
// js/store.js - Línea 189
export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://organique-backend.onrender.com/api'; // <--- PEGA TU URL DE RENDER AQUÍ (manteniendo el /api al final)
```

Guarda los cambios y súbelos a GitHub:
```bash
git add js/store.js
git commit -m "chore: update backend API URL for production"
git push origin main
```

---

## Paso 5: Desplegar el Frontend en Vercel.com
1. Inicia sesión en [Vercel](https://vercel.com).
2. Haz clic en **Add New...** y selecciona **Project**.
3. Importa tu repositorio `organique-shop`.
4. En la configuración de Vercel:
   - **Framework Preset:** `Other` (se detectará automáticamente como sitio estático).
   - **Root Directory:** `./` *(dejar en la raíz ya que index.html y css/ están ahí)*.
5. Haz clic en **Deploy**.
6. ¡Listo! Vercel te dará una URL (ej: `https://organique-shop.vercel.app`) para visitar tu sitio web en vivo.

---

## Monitoreo y Pruebas "In Vivo"
- El plan gratuito de Render entra en "estado de suspensión" (suspension/sleep mode) tras 15 minutos de inactividad. La primera vez que visites la web tras estar inactiva, la carga de productos podría demorar entre 30 y 50 segundos mientras Render reactiva el contenedor del servidor. Las subsiguientes peticiones serán instantáneas.
- Puedes verificar que los productos se carguen correctamente del backend en vivo visitando la pestaña **Console** de las herramientas de desarrollador en tu navegador.
- Puedes realizar compras in vivo; se guardarán de forma permanente en la base de datos de Aiven.
