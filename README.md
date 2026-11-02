# Jatsi Universe ✦

Experiencia web inmersiva para Jatsi, que presenta sus dos personalidades: Jatsi y Katsy. Preparada para GitHub Pages, incluye animaciones reactivas, nuevas ilustraciones, actividades compartibles, cuentas de usuario, panel administrativo y analíticas.

## Lo que ya funciona

- Inicio inmersivo con profundidad, partículas reactivas y sonido ambiental opcional.
- Diseño adaptable para computadora, tableta y móvil.
- Ruleta del directo, encuestas, chismógrafo, cumpleaños, buzón anónimo, Esto o aquello, Oráculo de Jatsi y preguntas para Q&A.
- Cada actividad genera un enlace directo que se puede pegar en Discord.
- Modo demostración local para probar todas las pantallas sin configurar servicios.
- Registro e inicio de sesión con correo.
- Historial personal de mensajes, votos, giros y respuestas.
- Panel exclusivo para la administradora con mensajes, actividades y analíticas.
- Resumen administrativo con actividad diaria, participantes, votos y giros.
- Creación de nuevas actividades desde el panel.
- Datos en tiempo real cuando Supabase está conectado.
- Rotación semanal opcional de encuesta y ruleta, con avisos automáticos en Discord.
- Preferencia de movimiento reducido y navegación con teclado.

## Probarla en tu computadora

La página usa módulos JavaScript, así que debe abrirse mediante un servidor local y no con doble clic sobre index.html.

Si tienes Python:

    python -m http.server 4173

Después abre http://localhost:4173. Sin Supabase configurado, el sitio entra en modo de demostración: las actividades y respuestas se guardan únicamente en el navegador actual. No llegan al panel de otras personas ni a una base compartida.

## Activar usuarios, mensajes y analíticas reales

GitHub Pages publica archivos estáticos y no puede guardar usuarios ni mensajes por sí solo. Este proyecto usa Supabase como base de datos y sistema de acceso.

1. Crea un proyecto gratuito en [Supabase](https://supabase.com/dashboard).
2. Abre SQL Editor, pega todo el contenido de [supabase/schema.sql](supabase/schema.sql) y ejecútalo.
3. En Project Settings → API, copia:
   - Project URL.
   - Publishable key (también puede aparecer como anon public en proyectos anteriores).
4. Sustituye los valores de ejemplo en [config.js](config.js) con la URL del proyecto y su Publishable key. No uses la service_role key.
5. En Authentication → URL Configuration, configura como **Site URL** `https://jatsi.github.io/jatsi-page/` y agrega esa misma dirección a **Redirect URLs**.
6. En Authentication → Sign In / Providers → Email, deja activa la confirmación de correo.
7. Publica los cambios en GitHub Pages y confirma que el panel muestre la base de datos conectada.
8. Regístrate desde la página con tu correo. El enlace de confirmación debe volver a `https://jatsi.github.io/jatsi-page/`.
9. Vuelve al SQL Editor y ejecuta la instrucción final de schema.sql, cambiando TU-CORREO@EJEMPLO.COM por tu correo. Eso convierte únicamente tu cuenta en administradora.

El proveedor de correo de prueba de Supabase solo envía a integrantes de la organización y tiene límites bajos. Para permitir registros de seguidores con cualquier dirección, configura un proveedor SMTP personalizado en Authentication → SMTP Settings.

La Publishable key está diseñada para usarse en el navegador. No uses nunca la service_role key en config.js. Si `config.js` conserva `TU-PROYECTO` y `TU-CLAVE-PUBLICABLE`, los mensajes reales no se guardan y el panel no puede recibirlos; la pantalla de administración lo indicará y no inventará mensajes de muestra.

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

## Rotación semanal y avisos

El panel incluye una pestaña **Programación**. GitHub Actions activa cada lunes a las **6:00 a. m. de Ciudad de México** una encuesta, una ruleta, una dinámica de **Esto o aquello** y seis señales nuevas para el **Oráculo de Katsy**. Las opciones cambian según un catálogo de 60 combinaciones semanales sin repetir; se pausan las encuestas y dinámicas anteriores, sin borrar su historial de votos o interacciones. La ruleta semanal la gira Jatsi en directo; sus retos son generales, graciosos y aptos para todo público. El chismógrafo tiene una sección fija con formato de cuaderno y 50 preguntas; no aparece como actividad semanal ni como tarjeta de actividad.

El cumpleaños está dentro del mismo formulario del cuaderno, no en una actividad aparte. Solo pide día y mes; nunca solicita el año. Para anunciarlo en Discord requiere apodo y autorización explícita. La persona puede contestar anónimamente; en ese modo no se pide nombre ni cumpleaños. Una automatización revisa la cola cada cinco minutos, omite registros duplicados por visitante y, después de publicarlos, borra el apodo y la fecha de la fila de Supabase.

El chismógrafo reúne 50 preguntas personales, divertidas y opcionales en cinco apartados. Las respuestas y los datos de perfil quedan privados hasta que administración los revise. Solo pueden aprobarse para publicación las respuestas que tengan autorización explícita; el mural siempre muestra únicamente preguntas y respuestas anónimas. Administración puede retirarlas después. No se deben compartir nombres, usuarios, datos de contacto ni detalles que identifiquen a otras personas.

Al aprobar un cuadernito, la página llama a la función segura `chismografo-discord`, que comprueba la sesión de administración y publica un aviso genérico en Discord inmediatamente. El webhook debe guardarse también en Supabase Edge Functions como `CHISMOGRAFO_WEBHOOK_URL`; no se incluye en los archivos públicos. GitHub Actions revisa la cola cada cinco minutos como respaldo.

Para activar el aviso inmediato en Supabase:

1. En Supabase, abre **Edge Functions → Secrets** y agrega `CHISMOGRAFO_WEBHOOK_URL` con la URL del webhook de `#chismógrafo`.
2. En una terminal con Supabase CLI, vincula el proyecto con `supabase link --project-ref <PROJECT_REF>` (el identificador aparece en **Project Settings → General**) y ejecuta `supabase functions deploy chismografo-discord --project-ref <PROJECT_REF>`.

Hasta que se despliegue esa función y se agregue el secreto, las aprobaciones se publican en la página y el aviso queda pendiente para GitHub Actions.

En una base de datos que ya existe, vuelve a ejecutar el archivo completo `supabase/schema.sql` desde Supabase → SQL Editor para instalar las reglas seguras de lectura pública y aprobación. El archivo usa políticas e inserciones idempotentes.

Para activarlo una sola vez:

1. En GitHub abre **jatsi/jatsi-page → Settings → Secrets and variables → Actions → New repository secret**.
2. Agrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde el panel del proyecto Supabase. La clave `service_role` es privada: úsala solo como secreto de Actions; nunca en `config.js`.
3. Crea un webhook en el canal de anuncios de tu servidor Discord y guarda la URL completa (normalmente `https://discord.com/api/webhooks/...`) como `COMMUNITY_WEBHOOK_URL`. El nombre es solo una etiqueta; el valor debe ser la URL del webhook, no la invitación del servidor ni el enlace normal del canal.
4. El flujo se ejecuta automáticamente cada lunes. Puedes usar **Actions → Actividades semanales → Run workflow** para activarlo antes de la siguiente semana; eso actualiza las cuatro experiencias y publica un aviso en Discord.

Por ahora esta programación actualiza actividades en Supabase y envía el anuncio a Discord. Instagram queda fuera hasta que se configure por separado.

Si falta cualquiera de los secretos, la ejecución se detiene antes de modificar actividades. GitHub conserva el historial de cada ejecución y muestra errores de conexión cuando un canal no acepta la publicación.

## Música del sitio

La música opcional se reproduce solo cuando la persona pulsa el botón. “Beautiful Oblivion” de Scott Buckley está bajo CC BY 4.0 y se acredita también en el pie de la página.
