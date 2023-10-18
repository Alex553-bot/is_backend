const mysql = require('mysql2/promise'); 
/*

const db_config = {
    host: 'bnsuv6worjxtfif7kgbt-mysql.services.clever-cloud.com', 
    user: 'u3rqowwvypxukc3c', 
    password: 'Y5Pm7tTNSlgwWyqQ7rc8', 
    database: 'bnsuv6worjxtfif7kgbt', 
    port: '3306'
};
*/
/*
const db_config = {
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'llajta_solutions', 
    port: 3306
};
*/
/*
*/
const db_config = {
    host:'localhost',
    user:'usuario_llajta_solutions', 
    password: '123456local',
    database: 'llajta_solutions',
    port: '3306',
};

const pool = mysql.createPool(db_config);


(async () => {
    try {
        const conexion = await pool.getConnection(); 
        console.log('Se logro la conexion'); 
        conexion.release(); 
    } catch (err) {
        console.log('Error: ', err);
    }
});
module.exports = pool;
