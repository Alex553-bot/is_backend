// validateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar variables de entorno

const jwtSecret = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Token no resibido' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'yoken invalido' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = validateToken;
