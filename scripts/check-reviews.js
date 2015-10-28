var NanoTimer    = require('nanotimer');
var DB                 =  require('../models/db.js').connection;
var DateHelper    =  require('../models/datehelper.js');
var checking        = false;


(new NanoTimer()).setInterval(function()  {
    
    if (!checking) 
    {
            checking = true

            console.log( "### Checking ###"); 

            DB.query("SELECT * FROM user_review WHERE completed <> 1", function(err, reviews)
            {
                    if (!err && reviews.length > 0)
                    {
                        for (var index in reviews)
                        {
                                (function(review, i)
                                {

                                        DB.query("SELECT * FROM app_review WHERE appid = ? AND comment = ? ",[review.appid, review.text], function(err, results)
                                        {
                                            
                                                if (!err && results.length > 0) 
                                                {
                                                        DB.query("UPDATE user_review SET completed=1,checked_on=NOW() WHERE id = '"+review.id+"' ");
                                                }

                                                if (i == reviews.length-1) 
                                                { 
                                                    checking = false
                                                }
                                        });

                                        
                                })( reviews[index], index );
                        }
                    }
                    else checking = false
            });
    }
    else console.log("### Check still in progress. Waiting another 10 seconds ###");
}, [], '10s');
