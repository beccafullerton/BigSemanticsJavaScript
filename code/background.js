/** Chrome extension message listener
 * Registers a listener for a request contains 'loadOptions'
 * replies with the extension's options.
 * This is needed because in a Chrome extension the content scripts cannot access localStorage.
 */
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
    	if (request.loadOptions != null)
      		sendResponse(getOptions());
//      	if (request.test != null)
//      		sendResponse(test());
	  	if (request.append_to_log != null)
      		sendResponse(append_to_log(JSON.parse(request.item), request.type));
	}
);


chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log("Activated...");
	console.log(activeInfo);
});

chrome.tabs.onHighlighted.addListener(function(activeInfo) {
	console.log("Highlighted...");
	console.log(activeInfo);
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
	console.log("focus of window changed...");
	console.log(windowId);
});


var HIST = "hister";

function getHist()
{
	if(!localStorage.hasOwnProperty(HIST))
	{
		localStorage[HIST] = JSON.stringify({});
	}
	return JSON.parse(localStorage[HIST]);
}

function setHist(hist)
{
	localStorage[HIST] = JSON.stringify(hist);
}

function visitIdToString(id)
{
	var hist = getHist();
	var retString = "";
	var item = hist[id+""];
	while(item)
	{
		retString = item.title+"->"+retString;
		
		item = hist[item.parent_id];
	}
	return retString;
}

function combinedToHistoryCrumb(combined)
{
	//
	/*
	{
  "timestamp": universal time,
  "source": {
    "title": title or name of the document,
    "url": url of the document
  },
  "parents": [
    { // parent document
      "title": document title,
      "url": document location
    },
   { // grand parent document
      "title": document title,
      "url": document location
    }
  ]
	
	*/
	var history_crumb = Object();
	history_crumb.timestamp = new Date().getTime();
	history_crumb.source = {title:combined.title , url:combined.title}
	history_crumb.parents = [];
	//add parents
	
	
	var hist = getHist();
	var retString = "";
	var item = hist[combined.parent_id];
	while(item)
	{
		//retString = item.title+"->"+retString;
		history_crumb.parents.push({title:item.title, url: item.url});
		item = hist[item.parent_id];
	}
	return history_crumb;
}

function addVisitAction(visit_item, history_item)
{
	

	//localStorage[HIST] = localStorage[HIST] + tt+"\n";
	//return localStorage["HIST"];
	//*/
	var combined = Object();
	combined.id = history_item.visitId;
	combined.timestamp = visit_item.visitTime;
	combined.url = visit_item.url;
	combined.title = visit_item.url;
	combined.transition = history_item.transition;
	combined.parent_id = history_item.referringVisitId;

	//console.log("adding visit item...");
	//console.log(combined);
	var hist = getHist();
	hist[combined.id] = combined;
	setHist(hist);
	append_to_log(combined, "page_load_raw");
	append_to_log(combinedToHistoryCrumb(combined),"page_load_crumb");
}


chrome.history.onVisited.addListener(
	function(visit_item) {
		//addVisitAction(visit_item);
//		append_to_log("FROM history item:"+visit_item.title+" at "+visit_item.url);
//			chrome.history.getVisits(visit_item);
//	     append_to_log("END"); // here you can access it.	
//console.log ("In the log...");
//console.log (visit_item.url);
chrome.history.getVisits({url:visit_item.url}, function(dddd)
{
	//console.log("results?");
	//console.log(dddd);
	////console.log("most recent");
	var last = "";
	for(i in dddd)
	    last = dddd[i]; 
	//console.log("start ..");
	//console.log(visit_item);
	//console.log(last);
	addVisitAction(visit_item,last);
//	console.log(visitIdToString(last.visitId));
	//console.log("end ..");
	
});
      //console.log(visit_item);
	}
);




function test()
{
	console.log("I am returning the number 15");
	return 15;
}

function append_to_log(item, type)
{
	if(!localStorage.hasOwnProperty("log_file"))
	{
		localStorage["log_file"] = "";
	}
	options = getOptions();
	if(options.is_on=='no')
	    return "";
	var uid = options.uid;
	var note = options.note;
	var logstamp = new Date().getTime();
	var log_me = JSON.stringify( {uid:uid, note:note, timestamp: logstamp, type:type, item:item} );
	localStorage["log_file"] = localStorage["log_file"] + log_me+"\n";
	return localStorage["log_file"];
}

/** getOptions
 * Builds a simple object representing the user preferences for the extension.
 * @return an object holding the preference values
 */
function initOptionsIfNull()
{
	if(!localStorage['log_file'])
		localStorage['log_file'] = "";
	if(!localStorage[HIST])
		getHist();
	if(!localStorage['is_on'])
		localStorage['is_on'] ='yes';
	if(!localStorage['uid'])
		localStorage['uid'] = "";
	if(!localStorage['note'])
		localStorage['note'] = ""; 
	
}
function getOptions() {
	initOptionsIfNull();
	var options = 	{
						logs: localStorage['log_file'],
						is_on: localStorage['is_on'],
						uid: localStorage['uid'],
						note: localStorage['note'],
      					// service: localStorage["service"],
      					// serviceUrl: localStorage["serviceUrl"],
      					// metadataInjection: localStorage["metadataInjection"],
      					// attributeInjection: localStorage["attributeInjection"],
      					// selectionInjection: localStorage["selectionInjection"],
      					// debugMmd: localStorage["debugMmd"],
      					// debugMetadata: localStorage["debugMetadata"]      					
      				};
     return options;
}

function clearLogFile()
{
	localStorage['log_file'] = "";
}
function setOptions(opts)
{
	for(i in opts)
	{
		//console.log("set "+i+" to "+opts[i])
		localStorage[i] = opts[i];
	}
	getOptions();
}
  
/** loadOptions
 * Loads the current preferences,
 * if none are set then they set to the default.
 */
function loadOptions() {
	var options = getOptions();
}

// loadOptions should be called whenever Chrome is started.
loadOptions();
