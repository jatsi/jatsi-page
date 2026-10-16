# Jatsi Universe ✦

Experiencia web inmersiva para Jatsi y Katsy, preparada para GitHub Pages. Incluye animaciones reactivas, nuevas ilustraciones, actividades compartibles, cuentas de usuario, panel administrativo y analíticas.

## Lo que ya funciona

- Inicio inmersivo con profundidad, partículas reactivas y sonido ambiental opcional.
- Diseño adaptable para computadora, tableta y móvil.
- Ruleta cósmica, encuestas, buzón anónimo, Esto o aquello, Oráculo de Katsy y preguntas para Q&A.
- Cada actividad genera un enlace directo que se puede pegar en Discord.
- Modo demostración local para probar todas las pantallas sin configurar servicios.
- Registro e inicio de sesión con correo.
- Historial personal de mensajes, votos, giros y respuestas.
- Panel exclusivo para la administradora con mensajes, actividades y analíticas.
- Creación de nuevas actividades desde el panel.
- Datos en tiempo real cuando Supabase está conectado.
- Preferencia de movimiento reducido y navegación con teclado.

## Probarla en tu computadora

La página usa módulos JavaScript, así que debe abrirse mediante un servidor local y no con doble clic sobre index.html.

Si tienes Python:

    python -m http.server 4173

Después abre http://localhost:4173. Sin Supabase configurado, el sitio entra automáticamente en modo demostración y guarda las interacciones en el navegador.

## Activar usuarios, mensajes y analíticas reales

GitHub Pages publica archivos estáticos y no puede guardar usuarios ni mensajes por sí solo. Este proyecto usa Supabase como base de datos y sistema de acceso.

1. Crea un proyecto gratuito en [Supabase](https://supabase.com/dashboard).
2. Abre SQL Editor, pega todo el contenido de [supabase/schema.sql](supabase/schema.sql) y ejecútalo.
3. En Project Settings → API, copia:
   - Project URL.
   - Publishable key (también puede aparecer como anon public en proyectos anteriores).
4. Pega ambos valores en [config.js](config.js).
5. Publica los cambios en GitHub Pages.
6. Regístrate desde la página con tu correo.
7. Vuelve al SQL Editor y ejecuta la instrucción final de schema.sql, cambiando TU-CORREO@EJEMPLO.COM por tu correo. Eso convierte únicamente tu cuenta en administradora.

La Publishable key está diseñada para usarse en el navegador. No uses nunca la service_role key en config.js.

## Enlaces directos para Discord

Desde cada actividad pulsa “Copiar enlace para Discord”. El formato resultante es:

    https://jatsi.github.io/jatsi-page/?activity=ruleta-cosmica

Al abrirlo, la actividad aparece directamente. Las actividades nuevas creadas desde el panel generan su propio enlace.

## Publicar en GitHub Pages

El repositorio ya está preparado para publicación estática desde la raíz:

1. Sube los cambios a la rama main.
2. En GitHub abre Settings → Pages.
3. Elige Deploy from a branch, rama main, carpeta /(root).
4. Espera a que GitHub complete el despliegue.

## Archivos principales

- index.html: estructura y contenido.
- styles.css: dirección visual, movimiento y adaptación móvil.
- script.js: actividades, cuentas, panel y animaciones.
- config.js: conexión pública con Supabase.
- supabase/schema.sql: tablas, permisos, rol administrador y datos iniciales.
- assets/jatsi-katsy-portal.webp: nueva ilustración principal.
- assets/jatsi-activity-oracle.webp: nueva ilustración del centro interactivo.

## Privacidad y seguridad

La base usa Row Level Security:

- Cada usuario puede consultar solo sus propias interacciones.
- Los mensajes enviados sin iniciar sesión no se vinculan a una cuenta.
- Si alguien inicia sesión y marca un mensaje como anónimo, su nombre se oculta en el panel pero la interacción conserva el identificador interno para que esa persona pueda verla en su propio historial.
- Solo el rol admin puede leer todas las respuestas, crear actividades y consultar analíticas.
- La autorización ocurre en la base de datos; no depende de ocultar botones en la interfaz.
- La cuenta administradora se asigna desde el SQL Editor y no desde el navegador.

Para un lanzamiento público conviene activar confirmación de correo, protección anti-bots y las restricciones de registro disponibles en Supabase Auth.
