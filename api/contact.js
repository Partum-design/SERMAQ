const nodemailer = require('nodemailer');

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
      from: `"Formulario SERMAQ" <${process.env.SMTP_USER}>`,
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
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo de contacto:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo enviar el correo.' });
  }
};
