
MetadataLoader.repoIsLoading = false;
MetadataLoader.repo = null;

// The URL for the document being loaded.
MetadataLoader.currentDocumentLocation = "";

// Logger
MetadataLoader.logger = function(message) { /* null default implementation */ };

MetadataLoader.extensionMetadataDomains = ["twitter.com"];

MetadataLoader.onloadCallback = function(urls, url) { /* null default implementation */ };




	
MetadataLoader.loadMMDRepo = function()
{	
	var callback = "MetadataLoader.initMetaMetadataRepo";
	var serviceURL = SEMANTIC_SERVICE_URL + "mmdrepository.jsonp?reload=true&callback=" + callback;
	  
	MetadataLoader.doJSONPCall(serviceURL);
	//console.log("requesting semantics service for mmd repository");
};


/**
 * Deserializes the metadata from the service and matches the metadata with a
 * queued RenderingTask If the metadata matches then retrieve the needed
 * meta-metadata.
 *
 * @param rawMetadata, JSON metadata string returned from the semantic service
 */
MetadataLoader.setMetadata = function(rawMetadata, requestMmd)
{  
  // TODO move MDC related code to mdc.js
  if (typeof MDC_rawMetadata != "undefined")
  {
    MDC_rawMetadata = JSON.parse(JSON.stringify(rawMetadata));
    updateJSON(true);
  }
  
  var metadata = {};
  
  var deserialized = false;
  
  for (i in rawMetadata)
  {
    if (i != "simpl.id" && i != "simpl.ref" && i != "deserialized")
    {
      metadata = rawMetadata[i];    
      metadata.meta_metadata_name = i;
    }
    
    if (i == "deserialized")
    {
      deserialized = true;
    }
  }
  
  if (!deserialized)
  {
    simplDeserialize(metadata);
  }

  // Match the metadata with a task from the queue
  var queueTasks = [];
  
  if (metadata.location)
  {
    queueTasks = MetadataLoader.getTasksFromQueueByUrl(metadata.location);
  }

  // Check additional locations for more awaiting MICE tasks
  if (metadata["additional_locations"])
  {
    for (var i = 0; i < metadata["additional_locations"].length; i++)
    {
      var additional_location = metadata["additional_locations"][i];
      var tasks = MetadataLoader.getTasksFromQueueByUrl(additional_location);
      queueTasks = queueTasks.concat(tasks);      
    }
  }
  
  for (var i = 0; i < queueTasks.length; i++)
  {
    var queueTask = queueTasks[i];
    
    if (metadata["additional_locations"])
    {
      queueTask.additionalUrls = metadata["additional_locations"];
      queueTask.url = metadata["location"].toLowerCase();
    }
    
    queueTask.metadata = metadata;
    queueTask.mmdType = metadata.meta_metadata_name;
  
    if (queueTask.clipping != null)
    {
    	
      	queueTask.clipping.rawMetadata = rawMetadata;
      
      	MetadataLoader.onloadCallback(queueTask.additionalUrls, queueTask.url);
      
    }
    
    if (typeof requestMmd === "undefined" || requestMmd == true) 
    { 	
    	if(queueTask.mmdType == null)
    	{
    		queueTask.mmdType = metadata.meta_metadata_name;
    	}
    	
    	MetadataLoader.getMMD(queueTask, "MetadataLoader.setMetaMetadata");
    }
  }
  
  if (queueTasks.length < 0)
  {
    console.error("Retreived metadata: " + metadata.location
                  + "  but it doesn't match a document from the queue.");
    console.log(MetadataLoader.queue);
  }
}

/**
 * Deserializes the meta-metadata, attempts to matche it with any awaiting
 * tasks. If the meta-metadata gets matched then renders it.
 *
 * @param mmd, raw meta-metadata json returned from the service
 */
MetadataLoader.setMetaMetadata = function (mmd)
{
  // TODO move MDC related code to mdc.js
  if (typeof MDC_rawMMD != "undefined")
  {
  	simplGraphCollapse(mmd);
    MDC_rawMMD = JSON.parse(JSON.stringify(mmd));
    simplDeserialize(mmd);
  }
  
  var tasks = MetadataLoader.getTasksFromQueueByType(mmd.name);
  
  if (tasks.length > 0)
  {
    for (var i = 0; i < tasks.length; i++)
    {
      tasks[i].mmd = mmd;

      // if the task has both metadata and meta-metadata then create and display
      // the rendering
      if (tasks[i].metadata && tasks[i].mmd)  
      {  
      	
      	// make sure any connected clippings have the correct meta_metadata_name
      	if (tasks[i].clipping && tasks[i].clipping.rawMetadata ) 
      	{
      		MetadataLoader.setClippingMetadataType(tasks[i].clipping, tasks[i].mmd);
      	}     	
      	
      	
        var metadataFields =
          MetadataLoader.createMetadata(tasks[i].isRoot, tasks[i].mmd,
                                        tasks[i].metadata, tasks[i].url);
        // Is there any visable metadata?
        if (MetadataLoader.hasVisibleMetadata(metadataFields))
        {	
          // If so, then build the HTML table	
          var styleMmdType = (tasks[i].expandedItem && tasks[i].expandedItem.mmdType && 
				tasks[i].expandedItem.mmdType.indexOf("twitter") != -1)? "twitter" : mmd.name; 
			var miceStyles = InterfaceStyle.getMiceStyleDictionary(styleMmdType);         //Adds the metadata type as an attribute to the first field in the MD
         //Adds the metadata type as an attribute to the first field in the MD
          metadataFields[0].parentMDType = mmd.name;
          tasks[i].renderer(tasks[i], metadataFields, {styles: miceStyles, type: mmd.name});
        }
      }
    }
  }
  else
  {
    console.error("Retreived meta-metadata: " + mmd.name
                  + "  but it doesn't match a document from the queue.");
  }
};


MetadataLoader.setClippingMetadataType = function(clipping, mmd)
{
	var mmdName = mmd.name;
	var unwrappedMetadata = MetadataLoader.getUnwrappedMetadata(clipping.rawMetadata);
		unwrappedMetadata.meta_metadata_name = mmdName;
	
	var newMetadata = {};
	newMetadata[mmdName] = unwrappedMetadata;

	clipping.rawMetadata = newMetadata;
};

MetadataLoader.getUnwrappedMetadata = function(wrappedMetadata)
{
	for(var key in wrappedMetadata)
	{
		if(key != "simpl.id" && key != "simpl.ref" && key != "deserialized")
		{
			return wrappedMetadata[key];
		}
	}
};

/**
 *
 */
MetadataLoader.createMetadata = function(isRoot, mmd, metadata, taskUrl)
{
  var metadataFields =
    MetadataLoader.getMetadataViewModel(mmd, mmd["kids"], metadata,
                                        0, null, taskUrl);
  
  return metadataFields;
};

/**
 * Get a matching RenderingTask from the queue 
 * @param url, target url to attempt to match to any tasks in the queue
 * @return a matching RenderingTask, null if no matches are found
 */
MetadataLoader.getTaskFromQueueByUrl = function(url)
{
  for (var i = 0; i < MetadataLoader.queue.length; i++)
  {
    if (MetadataLoader.queue[i].matches(url))
    {
      return MetadataLoader.queue[i];
    }
  }
  return null;
};

/**
 *
 */
MetadataLoader.getTasksFromQueueByUrl = function(url)
{
  var list = [];
  for (var i = 0; i < MetadataLoader.queue.length; i++)
  {
    if (MetadataLoader.queue[i].matches(url))
    {
      list.push(MetadataLoader.queue[i]);
    }
    
    else if(MetadataLoader.queue[i].additionalUrls != null){
    	//Checks to see if MMD matches any additionalLocations
    	  for (var j = 0; j < MetadataLoader.queue[i].additionalUrls.length; j++){
    		  if (MetadataLoader.queue[i].additionalUrls[j] == url){
    			  list.push(MetadataLoader.queue[i]);
    		  }
    	  }
    }
    
  }
  return list;
}

/**
 * Get all tasks from the queue which are waiting for given meta-metadata type.
 *
 * @param type, meta-metadata type to search for
 * @return array of RenderingTasks, empty if no matches found
 */
MetadataLoader.getTasksFromQueueByType = function(type)
{
  var tasks = [];
  for (var i = 0; i < MetadataLoader.queue.length; i++)
  {
    if (MetadataLoader.queue[i].mmdType == type)
    {
      tasks.push(MetadataLoader.queue[i]);
    }
  }
  return tasks;
}

/**
 * Get all tasks from the queue which are waiting for given meta-metadata type.
 *
 * @param domain, site domain to search for
 * @return array of RenderingTasks, empty if no matches found
 */
MetadataLoader.getTasksFromQueueByDomain = function(domain)
{
  var tasks = [];
  for (var i = 0; i < MetadataLoader.queue.length; i++)
  {
    if (MetadataLoader.queue[i].url.indexOf(domain) != -1)
    {
      tasks.push(MetadataLoader.queue[i]);
    }
  }
  return tasks;
}

/**
 * @returns bool, to request extension for metadata or not
 */
MetadataLoader.toRequestMetadataFromService = function(location)
{
	return !MetadataLoader.isExtensionMetadataDomain(location);
}

MetadataLoader.isExtensionMetadataDomain = function(location)
{
	for (var i = 0; i < MetadataLoader.extensionMetadataDomains.length; i++)
	{
		if (location.indexOf(MetadataLoader.extensionMetadataDomains[i]) != -1)
			return true;
	}
	return false;
}

MetadataLoader.checkForMetadataFromExtension = function()
{
	for (var i = 0; i < MetadataLoader.extensionMetadataDomains.length; i++)
	{
		var tasks = MetadataLoader.getTasksFromQueueByDomain(MetadataLoader.extensionMetadataDomains[i]);
		for (var j = 0; j < tasks.length; j++)
		{
			MetadataLoader.getMetadata(tasks[i].url, "MetadataLoader.setMetadata");
		}
	}
}


/* MetadataField and related functions */



/**
 *
 */
