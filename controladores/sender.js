const nodemailer = require('nodemailer');
const fs = require('fs');
const jade = require('jade');

// Configura el transporter con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rescatando.sabores.noreply@gmail.com',
    pass: 'ptpimrkapssuchft'
  }
});

// Lee el contenido del archivo para el cuerpo del correo
//const mensajeHTML = fs.readFileSync('../templates/recuperar.html', 'utf-8');

const path = '../templates/recuperar.jade';
const template = jade.compileFile(path);

const datos = {
  nombre: 'Usuario',
  enlaceCambio: 'https://tuaplicacion.com/cambiar-contrasena?token=uniquetoken',
  anioActual: new Date().getFullYear(),
  nombreEmpresa: 'Llajta Solutions',
  nombreAplicacion: 'Rescatando Sabores'
};

const html = template(datos);

// Configura los detalles del correo con HTML desde el archivo
const mailOptions = {
  from: 'rescatando.sabores.noreply@gmail.com',
  to: '202103261@est.umss.edu',
  subject: 'Prueba',
  html: html,
};

// Función para enviar el correo
function enviarCorreo() {
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado con éxito. Detalles:', info);
    }
  });
}

// Llama a la función para enviar el correo
enviarCorreo();
