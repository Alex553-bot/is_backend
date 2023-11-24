const multer = require('multer');
const path = require('path');

// Función para definir la carpeta de destino basada en el tipo de archivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      cb(null, 'media/imagen/');
    } else if (file.fieldname === 'video') {
      cb(null, 'media/video/');
    } else {
      cb(new Error('Campo de archivo no reconocido.'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()  + (Math.round(Math.random() * 1E9));
    let name = uniqueSuffix+file.originalname;
    name = name.replace(/\s\s+/g, '');
    console.log(name);
    if (file.fieldname==='imagen') {
      req.body.nombre_imagen = name;
    } else {  
      req.body.nombre_video = name;
    }  
    cb(null, name);
    return name
  },
});

// Configuración de Multer con filtros
const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    console.log(file);
    if (file.fieldname === 'imagen') {
      // Filtro para archivos de imagen
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      if (
        allowedExtensions.includes(path.extname(file.originalname).toLowerCase()) &&
        file.mimetype.startsWith('image/') 
      ) {
        callback(null, true);
      } else {

        console.log('Error en la imagen');
        console.log(file.fieldname);
        console.log(file.size);
        console.log(file.mimetype);
        callback(new Error('Formato de imagen no válido. Solo se permiten JPG, JPEG, y PNG con un tamaño máximo de 6 MB.'));
      }
    } else if (file.fieldname === 'video') {
      // Filtro para archivos de video
      if (
        path.extname(file.originalname).toLowerCase() === '.mp4' &&
        file.mimetype === 'video/mp4' 
      ) {
        callback(null, true);
      } else {
        console.log('Error en la video');
        console.log(file.fieldname);
        console.log(file.size);
        console.log(file.mimetype);        
        callback(new Error('Formato de video no válido. Solo se permite MP4 con un tamaño máximo de 900 MB.'));
      }
    } else {
      //callback(new Error('Campo de archivo no reconocido.'));
      callback(null, true);
    }
  },
  limits: {
    fieldSize: 900 * 1024 * 1024, // Limita el tamaño total de todos los archivos a 900 MB
  },
}).fields([
  { name: 'imagen', maxCount: 1, minCount: 0 },
  { name: 'video', maxCount: 1 , minCount: 0},
]);

module.exports = upload;
