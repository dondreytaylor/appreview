// var dbconfig = require('../../../../shared/config/opsworks.js');


var  Credentials =  { 
	
	USEDEVELOPMENT: false, 

	Database: { 
		MySQL: { 
			// Host 		:  dbconfig.db['host'],
			// Port 		:  dbconfig.db['port'],
			// User 		:  dbconfig.db['username'],
			// Password 	:  dbconfig.db['password'],
			// Database 	:  dbconfig.db['database'],

			// Host 		:  "db.minichatapp.com",
			// Port 		:  "3306",
			// User 		:  "dondrey",
			// Password 	:  "lamborghini1",
			// Database 	:  "MiniChat",
			
			Host            		: "104.197.107.186",
			Port            		: "3306",
			User            		: "root",
			Password        		: "mGOT9Nop",
			Database        		: "appreview",
			

			Dev_Host             	: "104.197.107.186",
			Dev_Port             	: "3306",
			Dev_User            	: "root",
			Dev_Password        	: "mGOT9Nop",
			Dev_Database        	: "appreview",


			// Host 		:  "50.79.103.170",
			// Port 		:  "3306",
			// User 		:  "app",
			// Password 	:  "tinyTalk",
			// Database 	:  "MiniChat",
			
			Charset	:  'utf8mb4'

		}
	},
	Cache: { },
	Service: { },
	Salt: { 
		"64" : "WMltTPzQElxGj7VJq4sc84pJc2WGYglK79x8ZVp52wkINxdBYjj4hP6vt68jZTEZ"
	}
};

module.exports = Credentials;

