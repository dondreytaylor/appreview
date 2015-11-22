var  Credentials =  { 
	
	USEDEVELOPMENT: false, 

	Database: { 
		MySQL: { 
			
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
			
			Charset	:  'utf8mb4'
		}
	},
	Service: { 
		PayPal: { 
			username: "dondrey.taylor-facilitator_api1.gmail.com",
			password: "MSXH8S2E9NUNC97J",
			signature: "AFcWxV21C7fd0v3bYYYRCpSSRl31AVGnml39ECr2qC8qJJjoRm3loNro",
			returnurl: "http://localhost:8000/purchase/finished",
			cancelurl: "http://localhost:8000/purchase/cancelled"
		}
	},
	Salt: { 
		"64" : "WMltTPzQElxGj7VJq4sc84pJc2WGYglK79x8ZVp52wkINxdBYjj4hP6vt68jZTEZ"
	}
};

module.exports = Credentials;

