/*
|--------------------------------------------------------------------------
| Models
|--------------------------------------------------------------------------
| 
|  Include models in one object for easier management 
| 
*/
var Constants     =  require('./models/constants.js');  
var Credentials     =  require('./models/credentials.js');  
var DateHelper     =  require('./models/datehelper.js');  
var DB  	     =  require('./models/db.js').connection;


/*
|--------------------------------------------------------------------------
|  HapiJS Boom
|--------------------------------------------------------------------------
|
|  Boom provides a set of utilities for returning HTTP errors. Each utility returns a Boom error 
|  response object (instance of Error) which includes the following properties:
| 
*/
var Boom    = require('boom');


/*
|--------------------------------------------------------------------------
|  HapiJS Joi
|--------------------------------------------------------------------------
|
|  Object schema description language and validator for JavaScript objects.
| 
*/
var Joi     = require('joi');


/*
|--------------------------------------------------------------------------
|  HapiJS Joi
|--------------------------------------------------------------------------
|
|  Object schema description language and validator for JavaScript objects.
| 
*/
var Path     = require('path');


/*
|--------------------------------------------------------------------------
|  Initialize Server
|--------------------------------------------------------------------------
|
|  Configure Hapi Server
| 
*/
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ 
	port: 8000, 
	routes: { cors: { credentials: true } }
});


/*
|--------------------------------------------------------------------------
|  Template Engine
|--------------------------------------------------------------------------
|
|  Template Engine
| 
*/
var Handlerbars = require('handlebars');
var HandlebarsLayouts = require('handlebars-layouts');
HandlebarsLayouts.register(Handlerbars);



/*
|--------------------------------------------------------------------------
|  Request
|--------------------------------------------------------------------------
|
|  HTTP Request Module
| 
*/
var _request = require("request");



/*
|--------------------------------------------------------------------------
|  Hash Generator
|--------------------------------------------------------------------------
|
|  Used to generate hashes
| 
*/
var Hashids = require('hashids')
var HashGenerator = new Hashids(Credentials.Salt["64"]);


/*
|--------------------------------------------------------------------------
|  MD5
|--------------------------------------------------------------------------
|
|  MD5 Hashes
| 
*/
var md5 = require('md5');


/*
|--------------------------------------------------------------------------
|  HAT
|--------------------------------------------------------------------------
|
|  HAT Module
| 
*/
var hat = require('hat');


/*
|--------------------------------------------------------------------------
|  View
|--------------------------------------------------------------------------
|
|  View Configuration
| 
*/
server.register([require('vision'), require("inert")], function (err) {

	
	// APPLE ITUNES API 
	/* ==================================================== */
	/* ==================================================== */

	server.route({
		method: 'GET',
		path: '/api/apple/app/lookup/{id}',
		handler: function(request, reply)
		{
			var endpoint =  "https://itunes.apple.com/lookup?id=" + request.params.id
			_request(endpoint, function(err, res, data)
			{ 
				if (!err && res.statusCode === 200) { 
					reply({response: JSON.parse(data)});
				}
				else { 
					reply({response: {
						resultCount: 0,
						results: []
					}});
				}
			})
		}
	});


	// WEB API 
	/* ==================================================== */
	/* ==================================================== */

	server.route({
		method: 'POST',
		path: '/api/user/onboard',
		handler: function(request, reply)
		{ 
			var checkForUser = function(phone, cb) 
			{
				DB.query("SELECT id FROM user WHERE phone = '"+phone+"' ", function(err, results)
				{
					if (typeof cb === "function") 
					{ 
						if (err || results.length == 0) cb(false)
						else cb(true)
					}
				});
			}; 
			
			var phone   	= request.payload.phone
			var pass      	= request.payload.pass
			var email     	= request.payload.email || ""
			var fullname 	= request.payload.fullname || ""
			var type 	= request.payload.type || ""
			type 		= ['reviewer','developer'].indexOf(type.toLowerCase()) > -1 ? type.toLowerCase() : "reviewer" 
			var user      	=  {
				type: type,
				email: email,
				fullname: fullname,
				phone: phone,
				phone_code: HashGenerator.encode(parseInt(phone)),
				password: md5(pass),
				created_on: DateHelper.now()
			};

			checkForUser(phone, function(exists)
			{
				if (exists) reply({onboard: false, exists: true});
				else 
				{
					DB.query("INSERT INTO user SET ?", user, function(err, results)
					{
						if (err) reply({onboard: false});
						else reply({onboard: true});
					});
				}
			});
		},
		config: { 
			validate: { 
				payload: { 
					phone: Joi.string().required(),
					pass: Joi.string().required(),
					email: Joi.string().optional(),
					fullname: Joi.string().optional(),
					type: Joi.string().required()
				}
			}
		}
	});


	server.route({
		method: 'POST',
		path: '/api/user/onboard/check/phone',
		handler: function(request, reply)
		{
			var checkForUser = function(phone, cb) 
			{
				DB.query("SELECT id FROM user WHERE phone = '"+phone+"' ", function(err, results)
				{
					if (typeof cb === "function") 
					{ 
						if (err || results.length == 0) cb(false)
						else cb(true)
					}
				});
			}; 
			
			var phone 	= request.payload.phone || ""
			
			checkForUser(phone, function(exists)
			{
				reply({exists: exists});
			});
		},
		config: { 
			validate: { 
				payload: { 
					phone: Joi.string().required()
				}
			}
		}
	});


	server.route({
		method: 'POST',
		path: '/api/user/auth',
		handler: function(request, reply)
		{
			var checkForUser = function(phone, pass, cb) 
			{
				DB.query("SELECT * FROM user WHERE phone = '"+phone+"' AND password = '"+md5(pass)+"'", function(err, results)
				{
					if (typeof cb === "function") 
					{ 
						if (err || results.length == 0) cb(false)
						else cb(true, results[0])
					}
				});
			}; 
			
			var token  = (hat.rack())();
			var phone = request.payload.phone || ""
			var pass = request.payload.pass || ""
			var expire_time =  60 * 24 * 365;  // minutes
			var expires_on = DateHelper.dateAdd("", "minute", expire_time);

			checkForUser(phone, pass, function(exists, user)
			{
				if (exists) 
				{
					var data = {
						userid: user.id,
						token: token,
						expires_on: expires_on,
						loggedin_on: DateHelper.now() 
					};

					DB.query("INSERT INTO user_login ?", data, function(err, results)
					{
						if (err) reply({auth: false, error: true});
						else reply({auth: true, token: token, user: user});
					})
				}
				else reply({auth: false})
			});
		},
		config: { 
			validate: { 
				payload: { 
					phone: Joi.string().required(),
					pass: Joi.string().required()
				}
			}
		}
	});


	server.route({
		method: 'POST',
		path: '/api/user/apps',
		handler: function(request, reply)
		{
			DB.query("SELECT * FROM user_login WHERE token = '"+request.payload.token+"' AND expires_on > NOW() ORDER BY id DESC LIMIT 1", function(err, results)
			{
				if (err || results.length == 0) reply({apps:[], auth: false});
				else 
				{ 
					DB.query("SELECT * FROM app WHERE userid = '"+results[0].userid+"' ORDER BY id DESC", function(err, results)
					{
						if (err || results.length == 0) reply({apps: [], auth: true});
						else reply({apps: results, auth: true});
					});
				}
			});
		},
		config: { 
			validate: { 
				payload: { 
					token: Joi.string().required(),
				}
			}
		}
	});


	server.route({
		method: 'POST',
		path: '/api/user/add/app',
		handler: function(request, reply)
		{
			DB.query("SELECT * FROM user_login WHERE token = '"+request.payload.token+"' AND expires_on > NOW() ORDER BY id DESC LIMIT 1", function(err, results)
			{
				if (err || results.length == 0) reply({added: false, auth: false});
				else 
				{ 
					DB.query("INSERT INTO app ?", {
						appid: request.payload.appid,
						appname: request.payload.appname,
						appdata: request.payload.appdata,
						added_on: DateHelper.now()		
					}, function(err, results) {

						if (err) reply({added: false});
						else reply({added: true});
					})	
				}
			});
		},
		config: { 
			validate: { 
				payload: { 
					token: Joi.string().required(),
					appdata: Joi.string().required(),
					appid: Joi.number().required(),
					appname: Joi.string().required()
				}
			}
		}
	});


	server.route({
		method: 'POST',
		path: '/api/user/update',
		handler: function(request, reply)
		{
			DB.query("SELECT * FROM user_login WHERE token = '"+request.payload.token+"' AND expires_on > NOW() ORDER BY id DESC LIMIT 1", function(err, results)
			{
				if (err || results.length == 0) reply({added: false, auth: false});
				else 
				{ 
					if (request.payload.email) { data["email"] = request.payload.email; condition.push("fullname = :fullname"); }
					if (request.payload.fullname) { data["fullname"] = request.payload.fullname; condition.push("email = :email"); }
					if (request.payload.pass) { data["password"] = request.payload.pass; condition.push("password = :password"); }

					DB.query("UPDATE user SET "+condition.join(",")+" WHERE id = '"+results[0].userid+"'", data, function(err, results) {

						if (err) reply({added: false});
						else reply({added: true});
					})	
				}
			});
		},
		config: { 
			validate: { 
				payload: { 
					token: Joi.string().required(),
					email: Joi.string().optional(),
					fullname: Joi.string().required(),
					pass: Joi.string().optional()
				}
			}
		}
	});

	// WEBSITES
	/* ==================================================== */
	/* ==================================================== */

	/*
	|--------------------------------------------------------------------------
	|  Views 
	|--------------------------------------------------------------------------
	|
	|  Configured views
	| 
	*/
	server.views({
		engines: {
			html: {
				module: Handlerbars
			}
		},
		relativeTo: Path.join(__dirname, 'public'),
		path: './views',
		partialsPath: './views/partials'
	});


	/*
	|--------------------------------------------------------------------------
	|  Handle HTTP Status 404
	|--------------------------------------------------------------------------
	|
	|  404 Response Handler
	| 
	*/
	server.ext('onPreResponse', function (request, reply) 
	{
		if (request.response.isBoom) 
		{
			//return reply.redirect('/');
		}

		return reply.continue();
	});


	/*
	|--------------------------------------------------------------------------
	|  Server Events
	|--------------------------------------------------------------------------
	|
	|  Catch-all server events
	| 
	*/
	server.on('internalError', function (request, err) 
	{
	});


	/*
	|--------------------------------------------------------------------------
	| WEB Route:
	|--------------------------------------------------------------------------
	|
	|  All routes pertaining to web pages
	| 
	*/
	server.route({
		method: 'GET',
		path: '/',
		handler: function(request, reply)
		{
			reply.view('page-landing', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/reviewer/dashboard',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-dashboard', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/add/app',
		handler: function(request, reply)
		{
			reply.view('page-creator-addapp', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/dashboard',
		handler: function(request, reply)
		{
			reply.view('page-creator-dashboard', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/buy/reviews',
		handler: function(request, reply)
		{
			reply.view('page-creator-purchase', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/app/{id}',
		handler: function(request, reply)
		{
			reply.view('page-creator-app', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/reviewer/app/{id}',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-app', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/buy/history',
		handler: function(request, reply)
		{
			reply.view('page-creator-purchasehistory', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/reviewer/start/review/{id}',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-startreview', {});
		}
	});


	server.route({
		method: 'GET',
		path: '/reviewer/apps/completed',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-appscompleted', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/creator/settings',
		handler: function(request, reply)
		{
			reply.view('page-creator-settings', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/reviewer/settings',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-settings', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/onboard/reviewer',
		handler: function(request, reply)
		{
			reply.view('page-reviewer-onboard', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/onboard/creator',
		handler: function(request, reply)
		{
			reply.view('page-creator-onboard', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/login',
		handler: function(request, reply)
		{
			reply.view('page-login', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/getstarted',
		handler: function(request, reply)
		{
			reply.view('page-chooseuser', {});
		}
	});


	/*
	|--------------------------------------------------------------------------
	| API Route: Checkout
	|--------------------------------------------------------------------------
	|
	| Checkout Routes
	|
	*/
	server.route({
		method: 'GET',
		path: '/purchase/{itemCode}',
		handler: function(request, reply)
		{
			var itemPrice   = 0
			var itemCode   = request.params.itemCode
			var itemName  = ""
			var itemCurrency = "USD";

			var token  = (hat.rack())();
			var PEC = require('paypal-express-checkout');
			var PayPal = PEC.init(
			    	Credentials.Service.PayPal.username, 
			    	Credentials.Service.PayPal.password, 
			    	Credentials.Service.PayPal.signature, 
			    	Credentials.Service.PayPal.returnurl + "?item=reviews", 
			    	Credentials.Service.PayPal.cancelurl + "?item=reviews", [true]
			);
			
			for (var index in Constants.purchaseItems) 
			{ 
				if (Constants.purchaseItems[index].code == itemCode) 
				{
					itemPrice = Constants.purchaseItems[index].price
					itemCode = Constants.purchaseItems[index].code
					itemName = Constants.purchaseItems[index].name
					itemCurrency = Constants.purchaseItems[index].currency 
				} 
			}

			// Proceed to checkout if we found the corresponding item 
			// using the code specified
			if (itemName != "")
			{ 
				PayPal.pay(token, itemPrice, itemName, itemCurrency, false, function(err, url) 
				{
			    		if (err) console.log(err);
			    		reply.redirect(url);
				});
			}
			// If the code doesn't match and item we'll send them
			// to the landing page
			else 
			{ 
				reply.redirect("/");
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/purchase/finished',
		handler: function(request, reply)
		{
			reply.view('page-creator-purchase-succeeded', {});
		}
	});

	server.route({
		method: 'GET',
		path: '/purchase/cancelled',
		handler: function(request, reply)
		{
			reply.view('page-creator-purchase-failed', {});
		}
	});


	/*
	|--------------------------------------------------------------------------
	| API Route: Static Files
	|--------------------------------------------------------------------------
	|
	| Static files
	|
	*/
	server.route({
		method: 'GET',
		path: '/{path*}',
		handler: 
		{
			directory: 
			{
				path: Path.join(__dirname, 'public'),
				listing: false,
				index: true
			}
		}
	});


	/*
	|--------------------------------------------------------------------------
	| API Route: Starts Server
	|--------------------------------------------------------------------------
	|
	|  Starts server
	|
	*/
	server.start(function()
	{

		console.log("### SERVER STARTED ###");
	});

});







