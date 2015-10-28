/*
|--------------------------------------------------------------------------
|  Imports
|--------------------------------------------------------------------------
|
|  Required packages are included here
| 
*/
var Credentials 	= require('./credentials.js'); 


/*
|--------------------------------------------------------------------------
|  MySQL Configuration
|--------------------------------------------------------------------------
|
|  Setup connection to MySQL
| 
*/
var mysql      		= require('mysql');
var mysqlConfig 	= {
	  host     	   : !Credentials.USEDEVELOPMENT ? Credentials.Database.MySQL.Host : Credentials.Database.MySQL.Dev_Host,
	  user     	   : !Credentials.USEDEVELOPMENT ? Credentials.Database.MySQL.User : Credentials.Database.MySQL.Dev_User,
	  password 	   : !Credentials.USEDEVELOPMENT ? Credentials.Database.MySQL.Password : Credentials.Database.MySQL.Dev_Password,
	  database          : !Credentials.USEDEVELOPMENT ? Credentials.Database.MySQL.Database : Credentials.Database.MySQL.Dev_Database,
	  charset              : Credentials.Database.MySQL.Charset,
	  multipleStatements: true,
	  acquireTimeout: 200,
	  connectionLimit: 100
};


/*
|--------------------------------------------------------------------------
|  Initialize pool
|--------------------------------------------------------------------------
|
|  Sets up pool and returns an object to query on. Once a query
| has been performed the connection will be released.
| 
*/
var pool = mysql.createPool(mysqlConfig);
exports.connection = 
{
	query: function () 
	{
		var queryArgs = Array.prototype.slice.call(arguments),
			events = [],
			eventNameIndex = {};

		pool.getConnection(function (err, conn) {
			if (err) {
				if (eventNameIndex.error) {
					eventNameIndex.error();
				}
			}
			if (conn) { 
				var q = conn.query.apply(conn, queryArgs);
				q.on('end', function () {
					conn.release();
				});

				events.forEach(function (args) {
					q.on.apply(q, args);
				});
			}
		});

		var instance =  {
			on: function (eventName, callback) {
				events.push(Array.prototype.slice.call(arguments));
				eventNameIndex[eventName] = callback;
				return this;
			}
		};

		instance.on('error', function(err)
		{
			//console.log ("MYSQL");
			//console.log( err ); 

			if(err && err.code === 'PROTOCOL_CONNECTION_LOST') 
			{
				handleDisconnect()
			}
		});

		return instance
	}
};







