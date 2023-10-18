// Ejemplar de consulta para obtener los datos de una cierta tupla
SELECT * FROM platillo_tipico WHERE ID_PLATILLO = id;

//Ejemplar para insertar un registro en la base de datos
INSERT INTO platillo_tipico (TITULO_PLATILLO,DESCRIPCION_PLATILLO,IMAGEN_PLATILLO,URL_VIDEO) VALUES ("","","","");

//Ejemplar para la eliminacionde una tupla
DELETE FROM platillo_tipico WHERE ID_PLATILLO = id;

//Ejemplar para editar una tupla
UPDATE platillo_tipico SET TITULO_PLATILLO = titulo, DESCRIPCION_PLATILLO = descripcion, IMAGEN_PLATILLO = imagen, URL_VIDEO = video WHERE ID_PLATILLO = id;