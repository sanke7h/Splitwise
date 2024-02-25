// Get the client
//import mysql from 'mysql2/promise';
const mysql=require('mysql2');
//const mysql=

// Create the connection to database
const connection =  mysql.createConnection({
  host: 'localhost',
  password: '12345678',
  user: 'root',
  database: 'first',
});

// A simple SELECT query
connection.query('SELECT `NAME`,`CITY` FROM `CLIENT_MASTER` ', (error, results, fields) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(results); // results contains rows returned by the server
  //console.log(fields); // fields contain extra metadata about results, if available
});

connection.query('DESCRIBE  `CLIENT_MASTER` ', (error, results) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(results); // results contains rows returned by the server
  //console.log(fields); // fields contain extra metadata about results, if available
});

connection.query('SELECT * FROM `CLIENT_MASTER` ', (error, results, fields) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(results); // results contains rows returned by the server
  //console.log(fields); // fields contain extra metadata about results, if available
});

connection.query('SELECT * FROM `CLIENT_MASTER` WHERE `BALDUE`<4000 ', (error, results, fields) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(results); // results contains rows returned by the server
  //console.log(fields); // fields contain extra metadata about results, if available
});

connection.query(
  'SELECT `NAME` FROM `CLIENT_MASTER` WHERE `BALDUE` > 4000',
  (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    const names = results.map(result => result.NAME);
    console.log(names);
  }
);
