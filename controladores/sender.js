const nodemailer = require('nodemailer');
const jade = require('jade');
require('dotenv').config();

// Configura el transporter con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  }
});

const path = 'templates/recuperar.jade';
const template = jade.compileFile(path);

// Configura los detalles del correo con HTML desde el archivo
const mailOptions = {
  from: process.env.GMAIL_USER,
  subject: 'Recuperacion de contraseña',
};

// Función para enviar el correo
exports.enviarCorreo = async (destinatario, datos) => {
  const html = template(datos);
  
  const options = {
    ...mailOptions,
    to: destinatario,
    html: html,
  };

  try {
    const info = await transporter.sendMail(options);
    console.log('Correo enviado con éxito. Detalles:', info);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};