# 🧘‍♀️ ZenVoice Studio - Dashboard de Meditación a Voz

¡Tu dashboard está completamente listo! Está optimizado para convertir textos y rutinas de meditación en audios suaves y relajantes en **Español Latino (Hombre y Mujer)**, listos para descargar en MP3.

Tienes **tres excelentes maneras** de entregarle este proyecto a tu amiga, desde la más fácil e inmediata hasta publicarlo con un enlace web profesional.

---

## 🚀 Opción 1: Entrega Inmediata (¡Sin servidores ni internet!)

Tu proyecto tiene configurado un sistema especial (`vite-plugin-singlefile`) que empaqueta todo el diseño, los íconos y la lógica dentro de **un único archivo HTML**. 

1. Ve a la carpeta de tu proyecto en tu computadora.
2. Asegúrate de haber ejecutado el comando de construcción para compilar la versión final:
   ```bash
   npm run build
   ```
3. Entra en la carpeta **`dist/`** que se acaba de generar.
4. Verás un archivo llamado **`index.html`**. 
5. **¡Envíale ese único archivo `index.html` a tu amiga!** Puedes pasárselo por WhatsApp, Telegram, o Correo electrónico.
6. Ella solo tiene que darle **doble clic** al archivo en su computadora o celular, y se abrirá el Dashboard completo en su navegador web funcionando al 100%.

---

## 🌐 Opción 2: Subirlo a GitHub Pages (Gratis y con enlace web)

Si quieres darle un enlace web (ej. `https://tu-usuario.github.io/dashboard-meditacion`), GitHub Pages es ideal:

1. Crea un nuevo repositorio público en [GitHub](https://github.com/new).
2. Sube todos los archivos de esta carpeta a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Versión inicial del Dashboard ZenVoice"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```
3. En tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración) > **Pages** en el menú izquierdo.
4. En **Build and deployment**, bajo *Source*, selecciona **GitHub Actions**.
5. GitHub detectará automáticamente que es una aplicación estática o te sugerirá el flujo de trabajo de *Static HTML* / *Node.js*. También puedes ir a la pestaña **Actions** en tu repositorio, buscar "Static HTML" o "Node.js" y autorizar que construya la carpeta `dist`. ¡Y listo! Te darán tu enlace público.

---

## 🚀 Opción 3: Despliegue Automático en Render.com o Vercel (Recomendado)

Hemos incluido los archivos de configuración automática (**`render.yaml`** y **`vercel.json`**) para que alojar la web sea cuestión de dos clics.

### Subir a Render.com:
1. Sube tu código a un repositorio de GitHub.
2. Entra en [Render.com](https://render.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en el botón **"New +"** y selecciona **"Static Site"** (Sitio Estático) o **"Blueprint"**.
4. Selecciona tu repositorio. Gracias al archivo `render.yaml` que generamos, Render configurará automáticamente el comando de instalación (`npm install && npm run build`) y la carpeta de publicación (`dist`).
5. Haz clic en **Create Static Site** y en un minuto te dará una URL gratuita como `https://zenvoice-studio.onrender.com`.

### Subir a Vercel (¡La opción más rápida!):
1. Entra a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa tu repositorio de GitHub.
4. Vercel leerá automáticamente el archivo `vercel.json` y configurará todo solo.
5. Haz clic en **Deploy**. ¡En 30 segundos tu amiga tendrá una web ultrarrápida!

---

## 🛠️ Tecnologías Utilizadas
* **React 19 & TypeScript**
* **Vite** (con empaquetado SingleFile autónomo)
* **Tailwind CSS** (Diseño adaptable y modo oscuro Zen)
* **Lucide React** (Íconos)
* **APIs de Voz**: Integración combinada nativa, endpoints de nube persistentes para descargas MP3 directas y soporte opcional para claves premium de ElevenLabs.
