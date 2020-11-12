
// DB Config
const { Pool, Client } = require('pg');

const dbconnection = require('./dbconnection.json');

const pool = new Pool(dbconnection);

module.exports.DB_CONN_ERR_MSG = 'There was an internal server error and the operation could not be completed at this time';
module.exports.DB_CONN_ERR = "db_conn_err";

module.exports.pool = pool;


// For ease of access and testing
const { AppUser } = require('./models/appuser/appuser')
AppUser.pool = pool
module.exports.AppUser = AppUser;

const { TodoItem } = require('./models/todoitem/todoitem');
TodoItem.pool = pool;
module.exports.TodoItem = TodoItem;


