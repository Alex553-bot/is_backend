const asyncHandler = require('express-async-handler'); 
const crypto = require('crypto'); 
const fs = require('fs');
const streamifier = require('streamifier');

const pool = require('../configuraciones/database'); 

function codificar(valor) {
	return valor.toString();
}
function decodificar(hash) {
	try {
		const valor = parseFloat(hash);
		console.log(valor);
		return valor; 
	} catch (err) {
		console.log('Error en la decodificacion', err);
		return NaN; 
	}
}

// Función para eliminar un registro y sus archivos asociados
function eliminarArchivoSiExiste(rutaArchivoAEliminar) {
	console.log('Eliminando archivos');
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
		if (id<=0) {
			res.status(500).json({
				message: 'Numero de pagina no valido'
			}); 
			return;
		} 
		const sql = 'SELECT ID_PLATILLO,TITULO_PLATILLO,DESCRIPCION_PLATILLO,IMAGEN_PLATILLO,URL_VIDEO FROM platillo_tipico ORDER BY TITULO_PLATILLO LIMIT 1 OFFSET ?'; 
		
		const [result] = await pool.query(sql, [id-1]); 

		if (result.length == 0) {
			console.log('No se encontro el platillo');
			res.status(400).json({
				message: 'No se encontro el platillo'
			}); 
		} else {
			let platillo = result[0];
			const id_codificado =codificar(platillo.ID_PLATILLO); 		
			const respuesta = {
				id: id_codificado,
				nombre: platillo.TITULO_PLATILLO,
				descripcion: platillo.DESCRIPCION_PLATILLO,
				imagen: platillo.IMAGEN_PLATILLO,
				video: platillo.URL_VIDEO,
			}
			res.json({respuesta});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Error del servidor', 
			error: err
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
    const rutaVideo =  req.body.nombre_video; // Ruta completa del video
    console.log(rutaImagen); 
    console.log(rutaVideo);
    const query =
      'INSERT INTO platillo_tipico(TITULO_PLATILLO, DESCRIPCION_PLATILLO, IMAGEN_PLATILLO, URL_VIDEO) VALUES(?,?,?,?)';

    const [result] = await pool.query(query, [nombre, descripcion, rutaImagen, rutaVideo]);

    if (result.affectedRows > 0) {
      console.log('Logra todo bien');
      res.status(200).json({
        message: 'Platillo registrado correctamente',
      });
    } else {
      res.status(400).json({
        message: 'Error en la base de datos',
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
		if (id==null) {
			res.status(500).json({
				message: 'Error con el servidor', 
				error: 'Error de decodificacion del id'
			})
		}
		const {nombre, descripcion} = req.body; 
		const imagen = req.files['imagen'].buffer; 
		const video = req.files['video'].buffer; 

		const sql = 'UPDATE platillo_tipico SET NOMBRE_PLATILLO = ?, DESCRCIPCION =?, IMAGEN_PLATILLO = ?, URL_VIDEO = ? WHERE ID_PLATILLO = ?'; 
		const [result] = await pool.query(sql , [nombre, descripcion, imagen, video, id]); 

		if (result.affectedRows >0 ) {
			res.status(200).json({
				message: 'Platillo modificado correctamente'
			})
		} else {
			res.status(500).json({
				message: 'Error en la base de datos'
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

exports.buscar_platillo = asyncHandler(async (req, res) => {
	try {
		const id = req.params.id
		const titulo = req.query.titulo; 
    	//const imagen = req.query.imagen;
		const sql = 'SELECT ID_PLATILLO, TITULO_PLATILLO, IMAGEN_PLATILLO FROM platillo_tipico WHERE ID_PLATILLO = ? AND TITULO_PLATILLO LIKE ?';
		//AND IMAGEN_PLATILLO = ?
  
		const [result] = await pool.query(sql, [id, `%${titulo}%`]);
  
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
  
exports.obtener_cantidad_platillos = asyncHandler(async (req, res, next) => {
	try {
	  const sql = 'SELECT COUNT(*) as cantidad FROM platillo_tipico';
	  const [result] = await pool.query(sql);
  
	  if (result.length > 0) {
		const cantidad = result[0].cantidad;
		res.status(200).json({ cantidad });
	  } else {
		res.status(400).json({
		  message: 'No se pudo obtener la cantidad de platillos',
		});
	  }
	} catch (err) {
	  console.error(err);
	  res.status(500).json({
		message: 'Error del servidor',
		error: err,
	  });
	}
  });
  
  
