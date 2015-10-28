var NanoTimer 		 = require('nanotimer');
var appStoreReviewsModule    = require('app-store-reviews');
var DB                                       =  require('../models/db.js').connection;
var DateHelper                          =  require('../models/datehelper.js');
var appsChecked 		  = [];
var appsToCheck 		  = [];

var addReviewToDB = function(id, app, author, version, rate, title, comment, country) 
{
	DB.query('INSERT IGNORE INTO app_review SET ?', {
		reviewid: id,
		appid: app,
		author: author,
		version: version,
		rate: rate,
		title: title,
		comment: comment,
		country: country,
		added_on: DateHelper.now()
	});
};

var fetchReviews = function()
{
	var appStoreReviews                = new appStoreReviewsModule();

	appStoreReviews.on('done', function(data)
	{
		appsChecked.push(data.appId);
		DB.query("UPDATE app_review_check SET check_finished=NOW(), apple_finished_status = 200 WHERE appid = '"+data.appId+"' ORDER BY id DESC LIMIT 1")
	});

	appStoreReviews.on('error', function(data)
	{
		appsChecked.push(data.appId);
		DB.query("UPDATE app_review_check SET check_finished=NOW(), apple_finished_status = '"+data.status+"' WHERE appid = '"+data.appId+"' ORDER BY id DESC LIMIT 1")
	});

	appStoreReviews.on('review', function(data) 
	{
		addReviewToDB(data['id'], data['app'], data['author'], data['version'], data['rate'], data['title'], data['comment'], data['country']);
	});


	appStoreReviews.on('nextPage', function(data) 
	{
		(function( data )
		{
			setTimeout(function()
			{
				appStoreReviews.getReviews(data['appId'], data['country'], data['nextPage']);
			},3000);

		})( data );  
	});

	DB.query('SELECT * FROM app WHERE enabled=1', function(err, rows, fields) 
	{	
		if (!err) 
		{
			for (var index in rows) 
			{
				console.log("App: " + rows[index].appid + " - " + rows[index].appname);
				appsToCheck.push(rows[index].appid);

				var countries;
				var countryIndex;
				if (rows[index].countries == null || rows[index].countries == "") 
				{
					countries = ['us'] 
				} 
				else 
				{
					countries = rows[index].countries.split(',');
				}

				for (countryIndex in countries) 
				{
					DB.query("INSERT INTO app_review_check (appid, check_started) VALUES ('"+rows[index].appid+"', NOW())");
					appStoreReviews.getReviews(rows[index].appid, countries[countryIndex], 1);
				}
			}
		}
	});
};

(new NanoTimer()).setInterval(function()  {

	if (appsChecked.length === appsToCheck.length) 
	{
		appsChecked = []
		appsToCheck = []
		fetchReviews();
	}
	else console.log("### Check still in progress. Waiting another 60 seconds ###");
}, [], '60s');


