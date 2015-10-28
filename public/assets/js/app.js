var AR = {}; 

AR.config = {
    endpoint: "/api/"
}; 

AR.getAppFromApple = function(appid) 
{
        return $.get(this.config.endpoint + "apple/app/lookup/" + appid); 
}; 

AR.getApp = function(appid)  
{ 
}; 

AR.getMyApps = function() 
{ 
};

AR.saveSettings = function(data) 
{ 
}; 

AR.onboard = function(data) 
{ 
};

AR.signin = function(data) 
{ 
};

AR.signout = function() 
{ 
}; 

AR.addApp = function(data) 
{ 
};

AR.showNotice = function(content) 
{
    var $body = $("body");
    var $notice = $('<div id="notice">\
        <div id="notice-overlay"></div>\
        <div id="notice-message">'+content+'</div>\
    </div>');
    $body.prepend($notice);
    setTimeout(function()
    {
            $notice.remove();
    },2000);
}; 


/******* Bindings **********/
$(function() {

            // DOM Cache
            var $findAppBtn = $("#findappbtn"); 
            var $findAppField = $("#findappfield");
            var $findApps = $("#appsfound");

            // Bindings
            $findAppBtn.on('click', function()
            {
                    AR.getAppFromApple($findAppField.val())
                        .success(function(data)  {
                                   if (typeof data.response == "object" && typeof data.response.results == "object" && data.response.results.length >  0) {
                                            $findApps.html($('<p>We were able to find <strong>'+data.response.results.length+'</strong> app'+(data.response.results.length==1?'':'s')+' on the App Store with the App ID <strong>'+$findAppField.val()+'</strong>. Select the app to add.</p>'));
                                            for (var index in data.response.results) {
                                                var result = data.response.results[index];
                                                $findApps.append($('<div class="app">\
                                                    <div class="thumb" style="background-image: url('+result.artworkUrl100+')"></div>\
                                                    <strong>'+result.trackName+'</strong> by '+result.artistName+'<br>Version: <strong>'+result.version+'</strong>\
                                                </div>'));
                                            }
                                    }
                                    else {
                                        $findApps.html($('<p>We were able to find <strong>'+data.response.results.length+'</strong> app'+(data.response.results.length==1?'':'s')+' on the App Store with the App ID <strong>'+$findAppField.val()+'</strong>. Check the App ID provided.</p>'));
                                    }
                            }) .fail(function()  { 
                        });
            });
            
            $findAppField.on('input', function()
            {
                    if ($(this).val().length === 0) { 
                        $findApps.html("");
                        $findAppBtn.hide();
                    } else $findAppBtn.show();
            });

            $findApps.on('click','.app', function()
            {
                    AR.showNotice("<i class='fa fa-check'></i> App Added!");
            })
});










