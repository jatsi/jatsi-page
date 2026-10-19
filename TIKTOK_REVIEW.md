# Preparación para la revisión de TikTok · Jatsi Control

## Producto elegido

- **Producto:** TikTok Login Kit para web.
- **Permiso previsto:** `user.info.basic` únicamente, el alcance básico asociado con Login Kit.
- **Uso previsto:** ofrecer una opción de inicio de sesión y reconocer la cuenta que la persona autorizó. No se solicitarán permisos para publicar, leer videos, ver estadísticas ni administrar contenido.
- **Nombre sugerido:** Jatsi Control. Mantener el nombre igual en el portal de desarrolladores, el sitio y la pantalla de autorización.

## Texto sugerido para el portal

**Descripción corta (English):**

> Jatsi Control is a web dashboard for the Jatsi creator community. It lets authorized community administrators manage interactive activities and review community submissions. TikTok Login Kit will provide an optional sign-in method using the basic profile information the user explicitly authorizes.

**Review explanation (English):**

> Jatsi Control uses TikTok Login Kit only to let a user sign in to the web dashboard and associate the session with the TikTok account they authorize. We request only `user.info.basic` for basic account identification. We do not request access to videos, analytics, or publishing. The user must approve the TikTok consent screen before the sign-in flow completes. The client secret and token exchange must stay on our server. Users can revoke authorization in TikTok settings. The product is not functional until the Login Kit flow is implemented and the approved production redirect URI is configured.

**Descripción breve (español):**

> Jatsi Control es un panel web para administrar las actividades interactivas de la comunidad de Jatsi, revisar participaciones y consultar un resumen de actividad. TikTok Login Kit será una opción de inicio de sesión con el permiso básico que la persona autorice.

## Enlaces públicos del proyecto

- Página oficial: configurar con el dominio HTTPS público definitivo del sitio.
- Política de privacidad: `https://DOMINIO-OFICIAL/privacy.html`
- Términos de uso: `https://DOMINIO-OFICIAL/terms.html`
- Las páginas de privacidad y términos ya están enlazadas directamente en el pie de página del sitio.

No envíes los marcadores `DOMINIO-OFICIAL` al portal. Reemplázalos con las direcciones públicas finales y comprueba que abran sin iniciar sesión.

## Pendientes antes de enviar

1. **Integrar Login Kit de extremo a extremo.** Esta copia del sitio todavía no contiene el flujo OAuth de TikTok. En particular, faltan el botón de inicio, el callback y la asociación de la sesión.
2. **Configurar un backend seguro.** El sitio es estático. TikTok requiere el intercambio del código de autorización y el resguardo del client secret en el servidor, con `state` anti-CSRF. Nunca pongas el client secret ni tokens en `config.js`, el navegador o el repositorio.
3. **Registrar el callback HTTPS exacto** en Login Kit y en el portal de TikTok. Debe ser una URL estática, absoluta, sin fragmento ni parámetros dinámicos.
4. **Publicar el sitio completo por HTTPS** y verificar la propiedad del sitio, la política de privacidad y los términos dentro del portal.
5. **Revisar la información de marca e icono** de Jatsi Control en el portal de TikTok.
6. **Grabar y adjuntar un video de demostración** del flujo real en el dominio final. Debe mostrar el inicio, el consentimiento de TikTok, el retorno a Jatsi Control y la sesión ya iniciada. El sitio actual no puede grabar ese flujo porque la integración todavía no existe.
7. **Probar una cuenta de revisión** y dejar la experiencia operativa durante la revisión.

## Guion del video cuando la integración esté lista

1. Abrir el sitio público en el mismo dominio que aparece en la configuración.
2. Abrir Jatsi Control y seleccionar «Continuar con TikTok».
3. Mostrar la pantalla de consentimiento y el único permiso solicitado: información básica del perfil.
4. Aprobar el consentimiento y mostrar el regreso al callback HTTPS.
5. Mostrar la sesión iniciada y cómo cerrar sesión o revocar el acceso.
6. No mostrar datos personales reales. Usar la cuenta de prueba autorizada para la revisión.

## Lista de comprobación de la revisión

- [ ] Nombre de app e icono coherentes con Jatsi Control.
- [ ] Sitio completo, público y HTTPS (no solo una pantalla de login).
- [ ] Política y términos visibles, activos y accesibles sin abrir un menú.
- [ ] URLs verificadas en el portal cuando corresponda.
- [ ] Redirect URI exacta, HTTPS y probada.
- [ ] Solo el producto y los alcances que el flujo realmente necesita.
- [ ] Descripción clara de cada producto y alcance.
- [ ] Video de demostración de extremo a extremo adjunto.
- [ ] Cuenta de revisión disponible y flujo funcionando.

## Fuentes oficiales

- [TikTok App Review Guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines)
- [Register Your App](https://developers.tiktok.com/docs/en/getting-started-create-an-app)
- [TikTok Login Kit for Web](https://developers.tiktok.com/docs/en/login-kit-web)
- [TikTok Login Kit scopes](https://developers.tiktok.com/docs/en/tiktok-api-scopes)
