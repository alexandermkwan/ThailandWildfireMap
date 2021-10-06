const mysql = require('mysql');
// mysql://bb19162737b894:2276a432@us-cdbr-east-04.cleardb.com/heroku_edad5aff4876c3a?reconnect=true
var mysqlConnection = mysql.createConnection({
    host : "us-cdbr-east-04.cleardb.com",
    user : "bb19162737b894",
    password : "2276a432",
    database : "heroku_edad5aff4876c3a",
    multipleStatements : true
});

mysqlConnection.connect((err) => {
    console.log("Trying to connect to server")
    if(err) throw err;
    console.log("Connected");
});

module.exports = mysqlConnection;
