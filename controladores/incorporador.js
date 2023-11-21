const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const db = require('../configuraciones/database'); 
const sender = require('./sender');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const consult = 'SELECT id, username, email, password, rol FROM usuario WHERE email = $1 AND password = $2';

  try {
    const result = await db.oneOrNone(consult, [email, password]);

    if (result) {
      const { id, username, email, rol } = result;
      
      // Verificar si el usuario tiene el rol de "administrador"
      const isAdmin = rol === 'administrador';

      // Puedes personalizar la duración del token según el rol si lo deseas
      const expiresIn = '15m';

      const token = jwt.sign({ id, username, email, rol }, jwtSecret, {
        expiresIn,
      });

      // Devolver username, correo, rol y token en la respuesta
      res.json({ username, email, rol, token });
    } else {
      console.log('Credenciales incorrectas');
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
exports.registro_usuario = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el correo electrónico del usuario ya está registrado
    const emailExistente = await db.oneOrNone('SELECT id FROM usuario WHERE email = $1', email);

    if (emailExistente) {
      return res.status(400).json({
        message: 'El correo electrónico ya está registrado. Por favor, elige otro.',
      });
    } else {
      // Verificar si el username ya está registrado
      const usernameExistente = await db.oneOrNone('SELECT id FROM usuario WHERE username = $1', username);

      if (usernameExistente) {
        return res.status(400).json({
          message: 'El username ya está registrado. Por favor, elige otro.',
        });
      }

      // Verificar si el correo tiene la extensión "@gmail.com"
      if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({
          message: 'Solo se permiten correos con la extensión "@gmail.com".',
        });
      }

      // Verificar si el correo no contiene espacios en blanco ni comienza con un espacio en blanco
      if (email.includes(' ') || email.startsWith(' ')) {
        return res.status(400).json({
          message: 'El correo electrónico no puede contener espacios en blanco ni comenzar con un espacio en blanco.',
        });
      }

      // Verificar si la contraseña contiene espacios en blanco
      if (password.includes(' ') || password.startsWith(' ')) {
        return res.status(400).json({
          message: 'La contraseña no puede contener espacios en blanco.',
        });
      }

      // Si el correo electrónico y el username no están registrados, y el correo tiene la extensión "@gmail.com", proceder con la inserción

      // Insertar nuevo usuario
      const query = 'INSERT INTO usuario(username, email, password) VALUES($1, $2, $3)';
      await db.none(query, [username, email, password]);

      res.status(201).json({
        message: 'Usuario registrado correctamente',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error con el servidor',
      error: err,
    });
  }
});
exports.recuperarContra = asyncHandler (async (req, res) => {
  try {
    const email = req.body.email;
    console.log(req.body);
    const result = await db.query('SELECT username FROM usuario WHERE email = $1', [email]);
    let nombre = email;
    console.log(result);
    if (result.length>0) {
      nombre = result[0].username;
    } else {
      res.status(400).json({message: 'Error no existe el password'});
      return;
    }

    const token = jwt.sign(
      {email}, 
      jwtSecret, 
      {expiresIn: '15m'}
    );

    const datosCorreo = {
      nombre,
      enlaceCambio: `http://localhost:5173/recuperarContra/${token}`,
      anioActual: new Date().getFullYear(),
      nombreEmpresa: 'Llajta Solutions',
      nombreAplicacion: 'Rescatando Sabores',
    };

    await sender.enviarCorreo(email, datosCorreo);

    res.status(200).send('Correo enviado con éxito');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error al enviar el correo');
  }
});
exports.cambiarContra = asyncHandler (async (req, res) => {
  console.log('entra a cambiar la contrasena');
  try {
    const {password} = req.body;
    console.log(password);
    const email = req.user.email;
    // Actualiza la contraseña en la base de datos
    const result = await db.result('UPDATE usuario SET password = $1 WHERE email = $2', [password, email]);

    if (result.rowCount === 1) {
      res.status(200).json({ message: 'Contraseña cambiada con éxito' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});