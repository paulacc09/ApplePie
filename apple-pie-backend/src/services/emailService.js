const SibApiV3Sdk = require('@getbrevo/brevo');

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKeyAuth =
  apiInstance.authentications['api-key'] || apiInstance.authentications.apiKey;
apiKeyAuth.apiKey = process.env.BREVO_API_KEY;

const escapeHtml = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const enviarConfirmacionSesion = async ({
  toEmail,
  toNombre,
  mentoraNombre,
  fecha_hora,
  asignatura,
  enlace_sesion,
}) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Sesión confirmada - Apple Pie';
    sendSmtpEmail.htmlContent = `
      <html><body style="font-family: sans-serif; line-height: 1.5;">
        <p>Hola ${escapeHtml(toNombre)},</p>
        <p>Tu sesión con la mentora <strong>${escapeHtml(mentoraNombre)}</strong> ha sido confirmada.</p>
        <p><strong>Asignatura:</strong> ${escapeHtml(asignatura)}</p>
        <p><strong>Fecha y hora:</strong> ${escapeHtml(fecha_hora)}</p>
        <p><strong>Enlace:</strong> <a href="${escapeHtml(enlace_sesion)}">${escapeHtml(enlace_sesion)}</a></p>
      </body></html>
    `.trim();
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME,
      email: process.env.BREVO_FROM_EMAIL,
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toNombre }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error('enviarConfirmacionSesion:', err);
  }
};

const enviarNotificacionSesion = async ({ toEmail, toNombre, mensaje }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Notificación de sesión - Apple Pie';
    sendSmtpEmail.htmlContent = `
      <html><body style="font-family: sans-serif; line-height: 1.5;">
        <p>Hola ${escapeHtml(toNombre)},</p>
        <p>${escapeHtml(mensaje)}</p>
      </body></html>
    `.trim();
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME,
      email: process.env.BREVO_FROM_EMAIL,
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toNombre }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error('enviarNotificacionSesion:', err);
  }
};

module.exports = {
  enviarConfirmacionSesion,
  enviarNotificacionSesion,
};
