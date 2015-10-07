/*
|--------------------------------------------------------------------------
| Date Format
|--------------------------------------------------------------------------
| 
|  As the name implies, formats date into format of string specified
| 
*/
var dateFormat 	= require('dateformat');
var moment 		= require('moment');


/*
|--------------------------------------------------------------------------
| DateHelper
|--------------------------------------------------------------------------
| 
| Manages Date Helper 
| 
*/
var DateHelper = {}; 


/*
|--------------------------------------------------------------------------
| Add to Date
|--------------------------------------------------------------------------
| 
| Adds a variable amount of time to a date
| 
*/
DateHelper.dateAdd = function(date, interval, units) 
{
	var d; 

	if (!(typeof date === "string") || !date)  d = new Date(this.now());
	else d = new Date(date); 

	if (typeof interval === "string")
	{
		switch(interval.toLowerCase()) 
		{
			case 'year'   :  d.setFullYear(d.getFullYear() + units);  break;
			case 'quarter':  d.setMonth(d.getMonth() + 3*units);  break;
			case 'month'  :  d.setMonth(d.getMonth() + units);  break;
			case 'week'   :  d.setDate(d.getDate() + 7*units);  break;
			case 'day'    :  d.setDate(d.getDate() + units);  break;
			case 'hour'   :  d.setTime(d.getTime() + units*3600000);  break;
			case 'minute' :  d.setTime(d.getTime() + units*60000);  break;
			case 'second' :  d.setTime(d.getTime() + units*1000);  break;
			default:  break;
		}
	}

	return dateFormat(d, "yyyy-mm-dd HH:MM:ss");
};


/*
|--------------------------------------------------------------------------
| Current Datetime
|--------------------------------------------------------------------------
| 
|  Constructs formatted string of current datetime based on 
|   server
| 
*/
DateHelper.now = function()
{
	//var d = new Date();
	//return dateFormat(d, "yyyy-mm-dd HH:MM:ss");
	return moment.utc().format('YYYY-MM-DD HH:mm:ss')
}


DateHelper.minDiff = function(datestring1, datestring2)
{
	var then =datestring1
	var now  = datestring2
	
	var startTime = new Date(datestring1); 
	var endTime = new Date(datestring2);
	var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
	var resultInMinutes = Math.round(difference / 60000);
	return resultInMinutes;
}


module.exports = DateHelper;




