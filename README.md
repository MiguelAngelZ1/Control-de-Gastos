# Control de Gastos

## Despliegue Backend en Render

1. Sube el proyecto a GitHub.
2. Entra a [Render](https://render.com/), crea un nuevo servicio web y conecta tu repo.
3. Usa el archivo `render.yaml` y configura la variable de entorno `DATABASE_URL` con la URL de tu base de datos.
4. Render instalará dependencias y ejecutará `node backend/index.js`.

## Despliegue Frontend en GitHub Pages

1. Ve a la configuración del repo en GitHub.
2. Activa GitHub Pages en la carpeta `/frontend`.
3. Asegúrate de que en `/frontend/js/config.js` la variable `API_BASE_URL` apunte a tu backend en Render.

## Notas

- El backend debe estar accesible públicamente para que el frontend funcione.
- Usa rutas relativas en el frontend para recursos locales.

---

### [README.md](vscode-remote://codespaces/workspaces/Control-de-Gastos/README.md)

Agrega instrucciones para desplegar en Render y GitHub Pages.
