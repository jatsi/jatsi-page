const webhook = process.env.CHISMOGRAFO_WEBHOOK_URL;
if (!webhook) throw new Error('Falta configurar CHISMOGRAFO_WEBHOOK_URL en GitHub Actions.');

const response = await fetch(webhook, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '📓 El chismógrafo sigue abierto: pasa al cuadernito y contesta las preguntas que quieras. ¡Puedes saltarte cualquiera! https://jatsi.github.io/jatsi-page/#experiencias',
    allowed_mentions: { parse: [] }
  })
});

if (!response.ok) throw new Error(`Discord no aceptó el recordatorio (${response.status}).`);
console.log('Recordatorio diario publicado en Discord.');
