# Jatsi & Katsy · Sitio web

Proyecto estático completo listo para GitHub Pages. Incluye el wallpaper, ilustraciones, iconos, efectos de estrellas, parallax y visor de imágenes con zoom.

## Abrir en tu computadora

Descomprime todo el ZIP y abre `index.html` con Chrome, Edge o Firefox. Conserva `styles.css`, `script.js` y la carpeta `assets` junto al HTML.

No necesitas Node.js, npm, Vite, Vinext, Vertex, Vercel ni una API de generación de imágenes. Las ilustraciones ya están incluidas como archivos. No hay instalación ni comando de compilación.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `jatsi-web`. Un repositorio público permite usar GitHub Pages con GitHub Free.
2. Descomprime este ZIP. En el repositorio, elige **Add file → Upload files**.
3. Sube **el contenido** de esta carpeta: `index.html`, `styles.css`, `script.js`, `assets`, `README.md` y, si tu sistema lo muestra, `.nojekyll`. No subas solo el ZIP ni una carpeta contenedora que deje `index.html` en un nivel inferior. También puedes usar GitHub Desktop para añadir todos los archivos.
4. Guarda los archivos en la rama `main` con **Commit changes**.
5. En **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama **main** y la carpeta **/(root)**. Pulsa **Save**.
7. Espera a que GitHub termine de publicar. El enlace aparecerá en esa misma pantalla, normalmente `https://TU-USUARIO.github.io/jatsi-web/`.

Las rutas de imágenes y estilos son relativas, compatibles con un repositorio como `/jatsi-web/`. No necesitas GitHub Actions personalizado, dominio propio ni configurar variables de entorno.

Los cambios que subas después a `main` se publicarán automáticamente. GitHub Pages es una publicación pública; el acceso privado de la copia alojada en ChatGPT no se transfiere a GitHub.

Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Si algo no funciona

- **Error 404:** revisa que `index.html` esté en la raíz del repositorio y Pages apunte a `main` y `/(root)`.
- **Sin imágenes o estilos:** sube la carpeta `assets` completa y conserva mayúsculas, minúsculas y nombres de archivo.
- **GitHub muestra el código pero no la web:** abre la dirección de GitHub Pages, no la página del repositorio.
- **No se ven cambios:** espera a que finalice el despliegue en la pestaña Actions y recarga con Ctrl + F5.
- **Una plataforma pide Build command:** este proyecto no tiene compilación. Usa alojamiento estático y el directorio raíz.
- **Sin conexión:** las imágenes locales, el diseño y el visor siguen disponibles. Google Fonts, TikTok y los enlaces externos requieren internet. Hay tipografías alternativas si Google Fonts no carga.

## Videos de TikTok: limitación conocida

La sección contiene las integraciones oficiales de perfil de `@jatsi_vt` y `@katsyvt`, con enlaces alternativos. Se ha observado que TikTok puede mostrar “Perfil no disponible” o solo la ficha del perfil sin videos. **No es una galería de videos individuales garantizada y no se arregla con GitHub Pages.**

Para una galería de publicaciones individuales se necesitan sus enlaces exactos; para listar videos automáticamente mediante la Display API se necesita una aplicación aprobada y autorización de TikTok. No se incluyen claves ni tokens.

## Editar el proyecto

- `index.html`: textos, enlaces, agradecimientos y estructura.
- `styles.css`: colores, distribución, adaptación móvil y animaciones.
- `script.js`: efectos, pausa, copia de CLABE y visor con zoom.
- `assets/`: ilustraciones e iconos utilizados en la web.

TikTok principal: `@jatsi_vt`. Cuenta secundaria: `@katsyvt`.
Los nombres de suggars son agradecimientos históricos, sin ranking actual.

## Recursos

Las ilustraciones fueron creadas a partir de los personajes proporcionados por Jatsi. Los logotipos de redes provienen de Simple Icons (CC0); las marcas pertenecen a sus respectivos titulares. Fansly utiliza un icono propio de corazón con candado. No se concede una licencia de reutilización del personaje mediante este archivo.
