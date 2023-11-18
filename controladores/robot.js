const asyncHandler = require('express-async-handler');

const db = require('../configuraciones/database'); 

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
        const [result] = await db.query(sql);

        const totalPlatillos = result.total_platillos;

        res.status(200).json({ total_platillos: totalPlatillos });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Error del servidor',
            error: err
        });
    }
});

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

exports.obtenerCalificacion = asyncHandler (async (req, res) => {
  try {
    console.log(req.user);
    const user_id = req.user.id; 
    const id = req.params.id;  // id del platillo
    console.log('todo bien');
    const sql = 'SELECT from calificacion where id_usuario = $1 and id_platillo = $2';
    const result  = await db.query(sql, [user_id, id]);
    console.log(result);
    if (result.rows) {
      res.status(200).json({ok : 1});
    } else {
      res.status(200).json({ok: 0});
    }
  } catch (err) {
    console.log(err); 
    res.status(500).json({error: 'Error al obtener la calificacion o reaccion del platillo'});
  }
});
exports.actualizarCalificacion = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id; // id del platillo
    const user = req.user.id;
    console.log(user);

    const aux = await db.query('SELECT * FROM calificacion WHERE id_usuario = $1 AND id_platillo = $2', 
      [user, id]);
    
    let sql = 'INSERT INTO calificacion (id_usuario, id_platillo) VALUES ($1, $2)';
    
    console.log(aux);
    if (aux.length > 0) {
      sql = 'DELETE FROM calificacion WHERE id_usuario = $1 AND id_platillo = $2';
    } 

    console.log(sql);
    
    const [result] = await db.query(sql, [user, id]);
    res.status(200).json({ message: 'modificado correctamente' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});