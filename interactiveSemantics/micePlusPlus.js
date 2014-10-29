MICE.urlCollections = new Map;
MICE.htmlContainers = new Map;
MICE.filters = new Map;
var htmlID = 0;

var facetID = 0;


var alphabet = ['a', 'b', 'c','d', 'e', 'f', 'g', 'h', 'i', 'j',
                'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                'u', 'v', 'w', 'x', 'y', 'z', '{'];








MICE.buildMetadataFieldCollectionHook = function(parentUrl, metadataField, row, childTable, fieldLabelDiv){

	var facets = document.createElement('div');
	facets.className = "facetContainer";
	for (var i = 0; i < metadataField.facets.length; i++){
		var facetDiv = MICE.buildFacets(parentUrl, metadataField.mmdName, metadataField.facets[i], false);
		facets.appendChild(facetDiv);
	}
	
	fieldLabelDiv.appendChild(facets);

	var urls = [];
	for(var k = 0; k < metadataField.value.length; k++){
		var key = metadataField.value[k].value[0].navigatesTo + htmlID.toString();
		urls.push(key);
		var row = childTable.childNodes[k];
		var rowWrapper = new RowWrapper(metadataField.value[k].value[0].navigatesTo, row);
		MICE.htmlContainers.put(key, row);
		htmlID++;
	}
	var urlAndTable = {};
	urlAndTable.urls = urls;
	urlAndTable.container = row.parentNode;
	MICE.urlCollections.put(metadataField.mmdName + parentUrl, urlAndTable);
	
};


MICE.buildFacets = function (parentUrl, collectionName, facetName){
	/*build the sort version of the facet*/
	var facet = document.createElement('div');
	facet.className = 'facet';
	var facetCheckBox = document.createElement('span');
	facetCheckBox.className = "facetCheckBox";
	var facetCheckBoxInput = document.createElement('input');
	facetCheckBoxInput.setAttribute('type', 'checkbox');
	
	facetCheckBoxInput.setAttribute('name', facetName);
	facetCheckBoxInput.setAttribute('id',  facetID.toString());
	facetCheckBoxInput.setAttribute('parenturl', parentUrl);
	facetCheckBoxInput.setAttribute('collectionname', collectionName);
	facetCheckBoxInput.setAttribute('onclick', "MICE.sortFacet()");
	facetCheckBox.appendChild(facetCheckBoxInput);
	var mySlider = document.createElement('div');
	document.body.appendChild(mySlider);
	mySlider.setAttribute('id', facetID.toString());
	

	/* Establish Min and Max value displayers */
	var minLabel = document.createElement('label');
	var maxLabel = document.createElement('label');
	minLabel.setAttribute('for', 'minValue' + facetID.toString());
	maxLabel.setAttribute('for', 'maxValue' + facetID.toString());
	minLabel.innerHTML = "Min: ";
	maxLabel.innerHTML = "Max: ";
	var minValue = document.createElement('input');
	minValue.setAttribute('type', 'text');
	minValue.setAttribute('id', 'minValue' + facetID.toString());
	minValue.value='a';
	var maxValue = document.createElement('input');
	maxValue.setAttribute('type', 'text');
	maxValue.setAttribute('id', 'maxValue' + facetID.toString());
	maxValue.value='z';
	mySlider.setAttribute('name', facetName);
	mySlider.setAttribute('parenturl', parentUrl);
	mySlider.setAttribute('collectionname', collectionName);
	$( "#" + facetID.toString() ).slider({ range: true, values: [0, 25], min:0 , max: 25,
		step: 1,   
		slide: function( event, ui ) {
            $( "#minValue" + event.target.id)
            .val(alphabet[ui.values[ 0 ] ])
            $( "#maxValue" + event.target.id).val(alphabet[ui.values[ 1 ]])
         },
	 	stop: function( event, ui ) {
	 		//call the filter func
	 		var name = event.target.getAttribute('name');
	 		var parent = event.target.getAttribute('parenturl');
	 		var collection = event.target.getAttribute('collectionname');
	 		MICE.filter(ui.values[0], ui.values[1], name, parent, collection)
	 	}
		
	});


	facet.appendChild(mySlider);
	facet.appendChild(minLabel);
	facet.appendChild(minValue);
	facet.appendChild(maxLabel);
	facet.appendChild(maxValue);
	facet.appendChild(facetCheckBox);
	facetID++;


	return facet;
}

MICE.sortFacet = function(){
	var checkbox = event.target;
	var parent = checkbox.getAttribute('parenturl');
	var collectionName = checkbox.getAttribute('collectionName');
	var facetName = checkbox.getAttribute('name');
	

	var filter_sort_request = MICE.filters.get((collectionName + parent));
	if(filter_sort_request == null){
		filter_sort_request = {};
		var target_collection = {};
		target_collection.parentUrls = [parent];
		target_collection.collectionName = collectionName;
		filter_sort_request.filter = [];
		filter_sort_request.sort = {};
		filter_sort_request.target_collection = target_collection;

	}
	var facet = {};
	facet.name = facetName;
	if (checkbox.checked){
		facet.direction = "ascending";
	}
	else{
		facet.direction = "descending";
	}
	filter_sort_request.sort = facet;
	MICE.filters.put(collectionName + parent, filter_sort_request);
	MICE.applyFilterSortRequest(filter_sort_request);
	
	
}

MICE.filter = function(min, max, name, parent, collection){
	var colPar = collection + parent;
	var filter_sort_request = MICE.filters.get(colPar);
	if(filter_sort_request == null){
		filter_sort_request = {};
		var target_collection = {};
		target_collection.parentUrls = [parent];
		target_collection.collectionName = collection;
		filter_sort_request.filter = [];
		filter_sort_request.sort = {};
		filter_sort_request.target_collection = target_collection;
	}
	
	for(var i = 0; i < filter_sort_request.filter.length; i++){
		if (filter_sort_request.filter[i].name == name){
			filter_sort_request.filter.splice(i, 1);
			i--;
		}
	}
	var facet = {}
	facet.name = name;
	facet.lower_limit = alphabet[min];
	max++;
	facet.upper_limit = alphabet[max];
	filter_sort_request.filter.push(facet);
	MICE.filters.put(colPar, filter_sort_request);
	MICE.applyFilterSortRequest(filter_sort_request);
	
}

//This function's code is meant to imitate future debi functions. Please look forward to it!
MICE.applyFilterSortRequest = function(request){
	var collection = request.target_collection.collectionName;
	for (var i = 0; i < request.target_collection.parentUrls.length; i++){
		var parent = request.target_collection.parentUrls[i];
		var urlAndContainer = MICE.urlCollections.get(collection + parent);
		var parent = urlAndContainer.container;
		var urls = urlAndContainer.urls.slice(0);
		if(request.sort != null){
			urls.sort();
			if(request.sort.direction == "descending"){
				urls.reverse();
			}
		}
		var newUrlList = urls;
		
		for (var i = 0; i < request.filter.length; i++){	
			
				for(var j = 0; j < newUrlList.length; j++){
					//Here, I'm going to implement something super specific to the amazon.com example - this
					//has nothing to do with final implementation and is strictly for my sanity.
					var pattern = "https://www\.amazon\.com/";
					var immediateUrl = newUrlList[j];
					var re = new RegExp("http://www\.amazon\.com/");
					immediateUrl = immediateUrl.replace(re, "");
					immediateUrl = immediateUrl.toLowerCase();
					if(!((immediateUrl >= request.filter[i].lower_limit) && (immediateUrl < request.filter[i].upper_limit))){
						//remove
						newUrlList.splice(j, 1);
						j--;
					}
				}
		}
		
		MICE.displayNewUrlList(newUrlList, parent);
	}

}

//This code strips down the parent Collection display and rebuilds from the rubble
MICE.displayNewUrlList = function(urls, parentContainer){

	while(parentContainer.hasChildNodes()){
		parentContainer.removeChild(parentContainer.childNodes[0]);
	}
	for(var i = 0; i < urls.length; i++){
		parentContainer.appendChild(MICE.htmlContainers.get(urls[i]));

	}
}


