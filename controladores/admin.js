const asyncHandler = require('express-async-handler');
const fs = require('fs');

const URI_IMG = "media/imagen/";
const URI_VIDEO = "media/video/";

const db = require('../configuraciones/database'); 
function decodificar(hash) {
  try {
    const valor = parseFloat(hash);
    return valor;
  } catch (err) {
    console.log(' Error en la decodificación ', err);
    return NaN;
  }
}
function eliminarArchivoSiExiste(pathFileToDelete) {
  if (fs.existsSync(pathFileToDelete)) {
    fs.unlink(pathFileToDelete, (err) => {
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

exports.insertar_platillo = asyncHandler(async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const nombreImagen = req.files['imagen'][0].originalname.replace(/\s\s+/g, ''); // Nombre del archivo de imagen
    const nombreVideo = req.files['video'][0].originalname.replace(/\s\s+/g, '');
    const rutaImagen = req.body.nombre_imagen; // Ruta completa de la imagen
    const rutaVideo = req.body.nombre_video; // Ruta completa del video

    // Verificar si el título ya existe en la base de datos
    const tituloExistente = await db.oneOrNone('SELECT id_platillo FROM platillo_tipico WHERE titulo_platillo = $1', nombre);
    if (tituloExistente) {
      res.status(400).json({
        message: 'El título del platillo ya existe en la base de datos.',
      });
    } else {
      // Si el título no existe, procede con la inserción
      const query =
        'INSERT INTO platillo_tipico(titulo_platillo, descripcion_platillo, imagen_platillo, url_video) VALUES($1, $2, $3, $4)';
      
      await db.none(query, [nombre, descripcion, rutaImagen, rutaVideo]);

      res.status(200).json({
        message: 'Platillo registrado correctamente',
      });
    }
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
    const sql1 = 'SELECT imagen_platillo, url_video FROM platillo_tipico WHERE id_platillo = $1';
    const res1 = await db.one(sql1, [id]);

    let URL_VIDEO = res1.url_video; 
    let IMAGEN_PLATILLO = res1.imagen_platillo;
    const { nombre, descripcion } = req.body;

    if (req.body.nombre_imagen != null) {
      eliminarArchivoSiExiste(URI_IMG + IMAGEN_PLATILLO);
      IMAGEN_PLATILLO = req.body.nombre_imagen;
    }
    if (req.body.nombre_video != null) {
      eliminarArchivoSiExiste(URI_VIDEO + URL_VIDEO);
      URL_VIDEO = req.body.nombre_video;
    }

    const sql = 'UPDATE platillo_tipico SET titulo_platillo = $1, descripcion_platillo = $2, imagen_platillo = $3, url_video = $4 WHERE id_platillo = $5';
    const result = await db.query(sql, [nombre, descripcion, IMAGEN_PLATILLO, URL_VIDEO, id]); 

            //if (result.affectedRows >0 ) {
                res.status(200).json({
                    message: 'Platillo modificado correctamente'
                })
            //} else {
            //    res.status(500).json({
            //        message: 'Error en la base de datos'
            //    })
            //}
    } catch (err) {
        console.log(err); 
        res.status(500).json({
            message: 'Error del servidor', 
            error: err
        })
    }
});
exports.eliminar_platillo = asyncHandler(async (req, res, next) => {
  try {
    let id = req.params.id;
    id = decodificar(id);
  
    // Eliminar archivo
    const sql1 = 'SELECT IMAGEN_PLATILLO, URL_VIDEO FROM platillo_tipico WHERE ID_PLATILLO = $1';
  
    const data = await db.one(sql1, id);
  
    const sql2 = 'DELETE FROM platillo_tipico WHERE ID_PLATILLO = $1 RETURNING *';
    const result = await db.oneOrNone(sql2, id);
  
    if (result) {
      const nombreImagen = data.IMAGEN_PLATILLO;
      const nombreVideo = data.URL_VIDEO;
  
      // Cambiar por la ruta de la imagen
      const imagenAEliminar = `media/imagen/${nombreImagen}`;
      const videoAEliminar = `media/video/${nombreVideo}`;
  
      await eliminarArchivoSiExiste(imagenAEliminar);
      await eliminarArchivoSiExiste(videoAEliminar);
  
      res.status(200).json({
        message: 'Platillo eliminado correctamente'
      });
    } else {
      res.status(500).json({
        message: 'Error en la base de datos'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error del servidor'
    });
  }
});
exports.obtenerPlatillosCalificados = asyncHandler (async (req, res) => {
  try {
    const user = req.user.id; 
    const sql = 'select * from platillo_tipico where id_platillo in (select id_platillo from calificacion where id_usuario = $1)'
    const [result] = await db.query(sql, [user]);
    res.status(200).json(result);
  } catch (err) {
    console.log(err); 
    res.status(500).json({message: 'Error en el servidor'})
  }
});
exports.obtenerEstadisticas = asyncHandler (async (req, res) => {
  try {
    const rol = req.user.rol; 
    if (rol!='administrador') {
      res.status(400).json({message: 'Forbbiden'});
      return;
    }
    const totalUsuarios = await db.one(
      'SELECT COUNT(*) AS total_usuarios FROM usuario'
    );
    const likesMes = await db.any(
      'SELECT TO_CHAR(month_series, \'Mon\') AS mes_abreviado, TO_CHAR(month_series, \'Month\') AS mes_completo, COUNT(calificacion.id) AS cantidad_likes FROM generate_series( date_trunc(\'year\', CURRENT_DATE)::date, date_trunc(\'year\', CURRENT_DATE)::date + interval \'11 months\', interval \'1 month\' ) AS month_series LEFT JOIN calificacion ON EXTRACT(MONTH FROM calificacion.tiempo) = EXTRACT(MONTH FROM month_series) WHERE EXTRACT(YEAR FROM month_series) = EXTRACT(YEAR FROM CURRENT_DATE) GROUP BY month_series ORDER BY month_series'
    );
    const result = {
      totalUsuarios, 
      likesMes
    };
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: 'Error en el servidor'});
  }
});
