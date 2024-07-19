let knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : 'mysql_up',
      //Para utilizar o sistema em ambiente local use o localhost, para usar em um container Docker, use o mysql_up
      //host: 'localhost',
      user : 'root',
      password : '1010', 
      database : 'upinvest'
    }
  });
module.exports = knex;