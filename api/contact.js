const nodemailer = require('nodemailer');

const SITE_URL = process.env.SITE_URL || 'https://www.sermaqro.com';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function phoneHref(value) {
  return String(value || '').replace(/[^0-9+]/g, '');
}

function buildEmailHtml({ nombre, telefono, servicio, mensaje }) {
  const safeName = escapeHtml(nombre);
  const safePhone = escapeHtml(telefono);
  const safeService = escapeHtml(servicio || 'No especificado');
  const safeMessage = escapeHtml(mensaje).replace(/\n/g, '<br>');
  const callHref = phoneHref(telefono);

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Nuevo contacto web · SERMAQ</title>
  </head>
  <body style="margin:0;padding:0;background:#eef0f4;color:#0d0d0d;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Nueva solicitud de cotización de ${safeName} para ${safeService}.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef0f4;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;">
            <tr>
              <td style="height:6px;background:#f28729;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:#0d0d0d;padding:30px 32px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <img src="${SITE_URL}/assets/logo-blanco.png" alt="SERMAQ" width="190" style="display:block;width:190px;height:auto;border:0;">
                    </td>
                    <td align="right" valign="top" style="color:#f2ab27;font-size:10px;line-height:1.4;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">
                      CONTACTO<br>WEB
                    </td>
                  </tr>
                </table>
                <div style="padding-top:34px;color:#9a9aa6;font-size:11px;line-height:1.4;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">Nueva solicitud</div>
                <div style="padding-top:8px;color:#ffffff;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-1px;">Nuevo contacto web</div>
                <div style="padding-top:12px;color:#c5c5cc;font-size:15px;line-height:1.55;">Alguien dejó sus datos en el formulario de SERMAQ.</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;padding:30px 32px 34px;border:1px solid #dfe2e8;border-top:0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="background:#fff3df;border:1px solid #f5d09a;color:#a95816;padding:8px 12px;font-size:11px;line-height:1.2;letter-spacing:1px;text-transform:uppercase;font-family:'Courier New',monospace;">${safeService}</td>
                  </tr>
                </table>
                <div style="padding-top:28px;color:#5c5c68;font-size:11px;line-height:1.4;letter-spacing:1.7px;text-transform:uppercase;font-family:'Courier New',monospace;">Datos del contacto</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;border-top:1px solid #e4e5e9;">
                  <tr>
                    <td width="50%" valign="top" style="padding:16px 12px 16px 0;border-bottom:1px solid #e4e5e9;">
                      <div style="color:#858591;font-size:10px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-family:'Courier New',monospace;">Nombre</div>
                      <div style="padding-top:5px;color:#0d0d0d;font-size:17px;line-height:1.35;font-weight:700;">${safeName}</div>
                    </td>
                    <td width="50%" valign="top" style="padding:16px 0 16px 12px;border-bottom:1px solid #e4e5e9;">
                      <div style="color:#858591;font-size:10px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;font-family:'Courier New',monospace;">Teléfono</div>
                      <div style="padding-top:5px;color:#03258c;font-size:17px;line-height:1.35;font-weight:700;">${safePhone}</div>
                    </td>
                  </tr>
                </table>
                <div style="padding-top:28px;color:#5c5c68;font-size:11px;line-height:1.4;letter-spacing:1.7px;text-transform:uppercase;font-family:'Courier New',monospace;">Mensaje</div>
                <div style="margin-top:12px;padding:20px 20px 20px 18px;border-left:4px solid #f28729;background:#f7f8fa;color:#282830;font-size:16px;line-height:1.65;">${safeMessage}</div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                  <tr>
                    <td style="background:#f28729;">
                      <a href="tel:${callHref}" style="display:inline-block;padding:14px 20px;color:#0d0d0d;text-decoration:none;font-size:12px;line-height:1.2;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:'Courier New',monospace;">Llamar al contacto&nbsp; →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 4px 0;color:#777985;font-size:12px;line-height:1.6;">
                <strong style="color:#0d0d0d;letter-spacing:.5px;">SERMAQ</strong> · Herramienta y Maquinaria<br>
                <a href="${SITE_URL}/contacto" style="color:#03258c;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const { nombre, telefono, servicio, mensaje, empresa } = req.body || {};

  // honeypot: si el campo "empresa" viene lleno, es un bot; respondemos ok sin enviar nada
  if (empresa) {
    return res.status(200).json({ ok: true });
  }

  if (!nombre || !telefono || !mensaje) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SERMAQ · Contacto web" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || process.env.SMTP_USER,
      replyTo: process.env.SMTP_USER,
      subject: `Nuevo contacto web: ${nombre}`,
      text: [
        `Nombre: ${nombre}`,
        `Teléfono: ${telefono}`,
        `Servicio: ${servicio || 'No especificado'}`,
        '',
        'Mensaje:',
        mensaje,
      ].join('\n'),
      html: buildEmailHtml({ nombre, telefono, servicio, mensaje }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo de contacto:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo enviar el correo.' });
  }
};
