
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
    	if (request.load != null)
      		loadWebpage(request.load, sendResponse);
    	else if (request.loadStudySettings != null)
    		getStudySettings(request.loadStudySettings, sendResponse);
    	else if (request.storeStudySettings != null)
    		setStudySettings(request.storeStudySettings);
    	return true;	// async response    		
	}
);

chrome.tabs.onUpdated.addListener(
		function(tabId, changeInfo, tab) {
			if (changeInfo.url) {
				chrome.tabs.sendMessage(tabId, {url: changeInfo.url});
			}
		}
	);

function getMetaMetadata(url, document, sendResponse)
{
	var serviceUrl = "http://ecology-service.cs.tamu.edu/BigSemanticsService/mmd.json?url=" + encodeURIComponent(url);
	
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function() {
		
		if (xhr.readyState==4 && xhr.status==200)
	    {
			//console.log(xhr.response);
			
			var resp = jQuery.parseJSON(xhr.response);
			var metadata = extractMetadata(document, resp.meta_metadata);
			//console.log(JSON.stringify(metadata));
			
			// mice looks for a metadata collection response
			sendResponse({doc: metadata, mmd: resp});
	    }
	};
	
	xhr.open("GET", serviceUrl, true);
	xhr.send();
}

function loadWebpage(url, sendResponse)
{
	var xhr = new XMLHttpRequest();
	xhr.responseType = "document";
	
	xhr.onreadystatechange = function() {
		
		if (xhr.readyState==4 && xhr.status==200)
	    {
			//console.log(xhr.response);
			
			getMetaMetadata(url, xhr.response, sendResponse);
	    }
	};
	
	xhr.open("GET", url, true);
	xhr.send();
}

function generateUserId(cond)
{
	var id = "";
    var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // to avoid any possible duplicate between study and normal usage
    var len = (cond == "none")? 6 : 7;
    
    for (var i = 0; i < len; i++)
        id += charSet.charAt(Math.floor(Math.random() * charSet.length));

    return id;
}

function getStudySettings(url, sendResponse)
{
	//read params from url
	var params = url.substring(url.indexOf("?")+1);
	params = params.split("&");
	
	var prevUserId = localStorage["tweetBubbleUserId"];
	var prevCondition = localStorage["tweetBubbleStudyCondition"];
	
	for (var i = 0; i < params.length; i++)
	{
		if (params[i].indexOf("condition") == 0)
			localStorage["tweetBubbleStudyCondition"] = params[i].substring(params[i].indexOf("=")+1);
		
		if (params[i].indexOf("userid") == 0)
			localStorage["tweetBubbleUserId"] = params[i].substring(params[i].indexOf("=")+1);
	}
	
	if (!localStorage["tweetBubbleStudyCondition"])
		localStorage["tweetBubbleStudyCondition"] = "none";
	
	if (!localStorage["tweetBubbleUserId"])
		localStorage["tweetBubbleUserId"] = generateUserId(localStorage["tweetBubbleStudyCondition"]);

	sendResponse({last_userid: prevUserId, userid: localStorage["tweetBubbleUserId"], 
				last_condition: prevCondition, condition: localStorage["tweetBubbleStudyCondition"],
				agree: localStorage["agreeToInformationSheet"]});
}

function setStudySettings(options)
{
	for (var k in options)
	{
		if (options.hasOwnProperty(k))
		{
			var prop = k.toString();
			localStorage[prop] = options[k];
		}		
	}
}
