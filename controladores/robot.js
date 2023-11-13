const asyncHandler = require('express-async-handler');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const URI_IMG = "media/imagen/";
const URI_VIDEO = "media/video/";

const db = require('../configuraciones/database'); 

function codificar(valor) {
  return valor.toString();
}
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

    const result = await db.oneOrNone(sql, id - 1); // Usa db.oneOrNone en lugar de db.one

    if (result) {
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
    } else {
      res.status(404).json({ message: 'Platillo no encontrado' });
    }
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

			if (result.affectedRows >0 ) {
				res.status(200).json({
					message: 'Platillo modificado correctamente'
				})
			} else {
				res.status(500).json({
					message: 'Error en la base de datos'
				})
			}
		}else{
			res.status(500).json({
				message: 'Error: El registro no existe'
			})
		}

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
		//eliminar archivo
		const sql1 = 'SELECT IMAGEN_PLATILLO,URL_VIDEO FROM platillo_tipico WHERE ID_PLATILLO = ?'; 

		const [data] = await pool.query(sql1, id); 

		const sql2 = 'DELETE FROM platillo_tipico WHERE ID_PLATILLO = ?'
		const [result] = await pool.query(sql2 , [id]); 
		
		if (result.affectedRows >0 ) {

			const nombreImagen = data[0].IMAGEN_PLATILLO;
			const nombreVideo = data[0].URL_VIDEO;
			//cambiar por la ruta de la imagen
			const imagenAEliminar = `media/imagen/${nombreImagen}`;
			const videoAEliminar = `media/video/${nombreVideo}`;
			await eliminarArchivoSiExiste(imagenAEliminar);
			await eliminarArchivoSiExiste(videoAEliminar);
	  
			res.status(200).json({
				message: 'Platillo eliminado correctamente'
			})
		} else {
			res.status(500).json({
				message: 'Error en la base de datos'
			})
		}
	} catch (err) {
		console.error(err); 
		res.status(500).json({
			message: 'Error del servidor'
		})
	}
});

// Listar todos los platillos
exports.listar = asyncHandler(async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM platillo_tipico ORDER BY titulo_platillo';
    const result = await db.query(sql);

    if (result.length == 0) {
      console.log('No existen platillos registrados en la base de datos.');
      res.status(400).json({
        message: 'No tenemos platos registrados.',
      });
    } else {
      res.status(200).json({ result });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err,
    });
  }
});

exports.contarPlatillos = asyncHandler(async (req, res, next) => {
    try {
        const sql = 'SELECT COUNT(*) AS total_platillos FROM platillo_tipico';
        const [result] = await pool.query(sql);

        const totalPlatillos = result[0].total_platillos;

        res.status(200).json({ total_platillos: totalPlatillos });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Error del servidor',
            error: err
        });
    }
});

//agregar tokens al inicio de sesion
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const consult = 'SELECT id, email, password, rol FROM usuario WHERE email = $1 AND password = $2';

  try {
    const result = await db.oneOrNone(consult, [email, password]);

    if (result) {
      const { id, email, rol } = result;
      
      // Verificar si el usuario tiene el rol de "administrador"
      const isAdmin = rol === 'administrador';

      // Puedes personalizar la duración del token según el rol si lo deseas
      const expiresIn = '15m';

      const token = jwt.sign({ id, email, rol }, jwtSecret, {
        expiresIn,
      });

      res.json({ token });
    } else {
      console.log('Credenciales incorrectas');
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
};

exports.buscar_platillo = asyncHandler(async (req, res) => {
  try {
    const titulo = req.query.titulo;
    //const sql = 'SELECT titulo_platillo, imagen_platillo FROM platillo_tipico WHERE titulo_platillo LIKE $1';
    const sql = `
      SELECT id_platillo, titulo_platillo, imagen_platillo, similarity(titulo_platillo, $1) AS similitud
      FROM platillo_tipico
      WHERE similarity(titulo_platillo, $1) > 0.6
      OR titulo_platillo ILIKE '%' || $1 || '%'
      ORDER BY similitud DESC
    `;
    const result = await db.query(sql, [`%${titulo}%`]);
    console.log(titulo);

    if (result.length === 0) {
      res.status(404).json({
        message: 'No se encontraron platillos que coincidan con la búsqueda',
      });
    } else {
      res.status(200).json({ result });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err,
    });
  }
});
exports.obtener_posicion = asyncHandler(async (req, res) => {
  const platilloId = req.params.id;
  try {
    const platillo = await db.one('SELECT titulo_platillo FROM platillo_tipico WHERE id_platillo = $1', [platilloId]);

    const posicion = await db.one('SELECT COUNT(*) FROM platillo_tipico WHERE titulo_platillo <= $1', [platillo.titulo_platillo]);

    res.status(200).json({ posicion: posicion.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

>>>>>>> Stashed changes
