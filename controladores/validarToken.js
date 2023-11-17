// validateToken.js
const jwt = require('jsonwebtoken');//secret kev para la vcalidacion del token
require('dotenv').config(); // Cargar variables de entorno

const jwtSecret = process.env.JWT_SECRET;

exports.token = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token no recibido' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalido' });
    }
    req.user = decoded;
    next();
  });
};