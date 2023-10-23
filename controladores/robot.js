const asyncHandler = require('express-async-handler'); 
const crypto = require('crypto'); 
const fs = require('fs');
const streamifier = require('streamifier');

const URI_IMG = "media/imagen/";
const URI_VIDEO = "media/video/";

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
		/* RO EDIT */
		const sqlEdit = 'SELECT * FROM platillo_tipico WHERE ID_PLATILLO = ?'; 
		const [data] = await pool.query(sqlEdit, id); 
		let { URL_VIDEO, IMAGEN_PLATILLO} = data[0]
		
		if(data.length > 0){
			const {nombre, descripcion} = req.body; 			
			if(req.body.nombre_imagen != null){
				await eliminarArchivoSiExiste(URI_IMG + IMAGEN_PLATILLO);
				IMAGEN_PLATILLO = req.body.nombre_imagen; 
			}
			if(req.body.nombre_video != null){
				await eliminarArchivoSiExiste(URI_VIDEO + URL_VIDEO);
				URL_VIDEO = req.body.nombre_video;
			}
			//const sql = 'UPDATE platillo_tipico SET NOMBRE_PLATILLO = ?, DESCRCIPCION =?, IMAGEN_PLATILLO = ?, URL_VIDEO = ? WHERE ID_PLATILLO = ?'; 
			const sql = 'UPDATE platillo_tipico SET TITULO_PLATILLO = ?, DESCRIPCION_PLATILLO =?, IMAGEN_PLATILLO = ?, URL_VIDEO = ? WHERE ID_PLATILLO = ?'; 
			const [result] = await pool.query(sql , [nombre, descripcion, IMAGEN_PLATILLO, URL_VIDEO, id]); 

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
		const sql = 'SELECT * FROM platillo_tipico ORDER BY TITULO_PLATILLO'; 
		const [result] = await pool.query(sql); 
		if (result.length == 0) {
			console.log('No existen platillos registrados en la base de datos.');
			res.status(400).json({
				message: 'No tenemos platos registrados.'
			}); 
		} else {			
			res.status(200).json({result});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Error del servidor', 
			error: err
		});
	}
});

// Función para eliminar un registro y sus archivos asociados
function eliminarArchivoSiExiste(pathFileToDelete) {
	console.log('Eliminando archivos ', pathFileToDelete);

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
exports.buscar_platillo = asyncHandler(async (req, res) => {
	try {
		const titulo = req.query.titulo; 
    	const imagen = req.query.imagen;
		const sql = 'SELECT * FROM platillo_tipico WHERE TITULO_PLATILLO LIKE ? AND IMAGEN_PLATILLO = ?';
  
		const [result] = await pool.query(sql, [`%${titulo}%`, imagen]);
  
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
  
