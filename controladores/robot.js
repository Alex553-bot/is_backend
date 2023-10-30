const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const fs = require('fs');
const streamifier = require('streamifier');
const db = require('../configuraciones/database'); // Cambia la importación de la conexión a PostgreSQL

function codificar(valor) {
  return valor.toString();
}
function decodificar(hash) {
  try {
    const valor = parseFloat(hash);
    console.log(valor);
    return valor;
  } catch (err) {
    console.log('Error en la decodificación', err);
    return NaN;
  }
}

// Función para eliminar un registro y sus archivos asociados
function eliminarArchivoSiExiste(rutaArchivoAEliminar) {
  console.log('Eliminando archivos');
  console.log(`La ruta del archivo es: '${rutaArchivoAEliminar}'`);
  if (fs.existsSync(rutaArchivoAEliminar)) {
    fs.unlink(rutaArchivoAEliminar, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo:', err);
      } else {
        console.log('Archivo eliminado con éxito.');
      }
    });
  } else {
    console.log('El archivo no existe.');
  }
}

exports.obtener_platillo = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id <= 0) {
      res.status(500).json({
        message: 'Número de página no válido',
      });
      return;
    }
    const sql = 'SELECT id_platillo, titulo_platillo, descripcion_platillo, imagen_platillo, url_video FROM platillo_tipico ORDER BY titulo_platillo LIMIT 1 OFFSET $1';

    const result = await db.one(sql, [id - 1]);

    let platillo = result;
    const id_codificado = codificar(platillo.id_platillo);
    const respuesta = {
      id: id_codificado,
      nombre: platillo.titulo_platillo,
      descripcion: platillo.descripcion_platillo,
      imagen: platillo.imagen_platillo,
      video: platillo.url_video,
    };
    res.json({ respuesta });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err,
    });
  }
});

exports.insertar_platillo = asyncHandler(async (req, res) => {
  try {
    console.log('Llega a la consulta');
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const nombreImagen = req.files['imagen'][0].originalname.replace(/\s\s+/g, ''); // Nombre del archivo de imagen
    const nombreVideo = req.files['video'][0].originalname.replace(/\s\s+/g, '');
    const rutaImagen = req.body.nombre_imagen; // Ruta completa de la imagen
    const rutaVideo = req.body.nombre_video; // Ruta completa del video
    console.log(rutaImagen);
    console.log(rutaVideo);
    const query =
      'INSERT INTO platillo_tipico(titulo_platillo, descripcion_platillo, imagen_platillo, url_video) VALUES($1, $2, $3, $4)';

    await db.none(query, [nombre, descripcion, rutaImagen, rutaVideo]);

    res.status(200).json({
      message: 'Platillo registrado correctamente',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error con el servidor',
      error: err,
    });
  }
});

exports.modificar_platillo = asyncHandler(async (req, res) => {
  try {
    let id = req.params.id;
    id = decodificar(id);
    if (id == null) {
      res.status(500).json({
        message: 'Error con el servidor',
        error: 'Error de decodificación del id',
      });
    }
    const { nombre, descripcion } = req.body;
    const imagen = req.files['imagen'].buffer;
    const video = req.files['video'].buffer;

    const sql = 'UPDATE platillo_tipico SET titulo_platillo = $1, descripcion_platillo = $2, imagen_platillo = $3, url_video = $4 WHERE id_platillo = $5';

    await db.none(sql, [nombre, descripcion, imagen, video, id]);

    res.status(200).json({
      message: 'Platillo modificado correctamente',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err,
    });
  }
});

exports.eliminar_platillo = asyncHandler(async (req, res, next) => {
  try {
    let id = req.params.id;
    id = decodificar(id);
    // Eliminar archivo
    const sql1 = 'SELECT imagen_platillo, url_video FROM platillo_tipico WHERE id_platillo = $1';

    const data = await db.one(sql1, id);

    const sql2 = 'DELETE FROM platillo_tipico WHERE id_platillo = $1';

    await db.none(sql2, id);

    const nombreImagen = data.imagen_platillo;
    const nombreVideo = data.url_video;
    const imagenAEliminar = `media/imagen/${nombreImagen}`;
    const videoAEliminar = `media/video/${nombreVideo}`;
    eliminarArchivoSiExiste(imagenAEliminar);
    eliminarArchivoSiExiste(videoAEliminar);

    res.status(200).json({
      message: 'Platillo eliminado correctamente',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error del servidor',
    });
  }
});
