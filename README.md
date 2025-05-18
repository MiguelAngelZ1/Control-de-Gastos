# Control de Gastos

## Despliegue Backend en Render

1. Sube el proyecto a GitHub.
2. Entra a [Render](https://render.com/), crea un nuevo servicio web y conecta tu repo.
3. Usa el archivo `render.yaml` y configura la variable de entorno `DATABASE_URL` con la URL de tu base de datos.
4. Render instalará dependencias y ejecutará `node backend/index.js`.
5. Cuando termine, Render te dará una URL pública (ejemplo: `https://control-gastos-backend.onrender.com`). Prueba en el navegador que responde en `/api`.

## Despliegue Frontend en GitHub Pages

1. Asegúrate de que la carpeta `frontend` esté en la raíz del repo y contenga un archivo `index.html` y `.nojekyll`.
2. Ve a la configuración del repo en GitHub.
3. En **Settings > Pages**, selecciona la rama principal (`main` o `principal`).
4. En el campo de carpeta, escribe manualmente `frontend` y guarda.
5. Espera unos minutos y abre la URL pública que te da GitHub Pages.
6. En `/frontend/js/config.js`, la variable `API_BASE_URL` debe apuntar a tu backend en Render, terminando en `/api`.

## Solución de problemas

- Si GitHub Pages no reconoce la carpeta `frontend`, verifica que esté en la raíz y tenga `index.html`.
- Si el botón "Save" no se habilita, recarga la página, borra y vuelve a escribir el nombre de la carpeta, o haz un commit de prueba.
- Si Render no conecta con la base de datos, revisa la variable `DATABASE_URL`.
- Si el frontend no conecta con el backend, revisa CORS en el backend y la URL en `config.js`.

## Notas

- El backend debe estar accesible públicamente para que el frontend funcione.
- Usa rutas relativas en el frontend para recursos locales.
- Si nada funciona, revisa los logs de Render y GitHub Pages para mensajes de error específicos.
- Puedes pedir ayuda mostrando capturas de pantalla de la estructura del repo y la configuración de Pages.

---

### [README.md](vscode-remote://codespaces/workspaces/Control-de-Gastos/README.md)

Agrega una guía de verificación y solución de problemas para Render y GitHub Pages.
