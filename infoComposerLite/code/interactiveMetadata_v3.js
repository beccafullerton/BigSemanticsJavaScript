function createMetadataBrowser(metadata) {
	return new MetadataBrowser(metadata);
}

function createGoldenColumn() {
	var column = document.createElement('div');
	column.className = "goldenColumn";
	return column;
}

function createRowDivider() {
	var column = document.createElement('div');
	column.className = "rowDivider";
	return column;
}

function spaceRemove(string) {
	string =  string.replace(/ /g, "");
	string =  string.replace(/\./g, "");
	string =  string.replace(/\'/g, "");
	return string;
}

function MetadataBrowser(metadata) {
	this.metadata = metadata;
	this.depth = 1;

	this.rootVisual = document.createElement('div');
	
	this.history = [];
			
	this.rootDisplay = new MetadataDisplay(this, this, this.metadata, -1);
	
	this.rootDisplay.view = this.rootDisplay.buildMetadataMainView(this.rootDisplay.metadata);
	
	this.history.push(this.rootDisplay);
	
	this.columns = [];
	this.columns.push(createGoldenColumn());
	
	this.columns[0].appendChild(this.rootDisplay.view);
	
	this.rebuildVisual();
	
	attachInlinkHovers();
}

function MetadataDisplay(b, p, md, i) {
	this.browser = b;
	this.parent = p;
	this.metadata = md;
	this.index = i;
	
	this.openChildren = [];
	this.children = [];

	//this.listView = this.buildListView();
}

MetadataDisplay.prototype.buildListView = function() {
	var listItem = document.createElement('li');
		listItem.className = "childListItem";

	var titleValue = document.createElement('a');
		titleValue.id = "li_"+spaceRemove(this.metadata.title.value);	
		titleValue.className = "inlink";
		titleValue.innerText = this.metadata.title.value;	
		
	var index = this.index;
	var p = this.parent;
	var b = this.browser
		
		
	titleValue.onclick = function() { 
		openChild(b, p, index);
	};
		
	listItem.appendChild(titleValue);
	
	return listItem;
};

MetadataDisplay.prototype.hasOpenChildren = function() {
	return this.openChildren.length > 0;
}

function openChild(browser, parent, i) {
	parent.openChildren.push(parent.children[i]);
	
	browser.history.push(parent.children[i]);
	
	while (browser.rootVisual.hasChildNodes()) {
	    browser.rootVisual.removeChild(browser.rootVisual.lastChild);
	}
	
	browser.rebuildVisual();	
}

MetadataBrowser.prototype.buildColumns = function() {
	var columns = [];
	
	columns.push(createGoldenColumn());	
	columns[0].appendChild(this.rootDisplay.view);
	
	var parents = [];
	parents.push(this.rootDisplay);

	while(hasOpenChildren(parents)) {
		columns.push(createColumnForParents(parents));	
		
		parents = getAllOpenChildren(parents);
	}
	return columns;
}

function hasOpenChildren(parents) {
	for(var p in parents)
		if(parents[p].hasOpenChildren())
			return true;
			
	return false;
}

function getAllOpenChildren(parents) {
	var children = [];
	for(var p in parents) {
		if(parents[p].hasOpenChildren()){
			for(var c in parents[p].openChildren) {
				children.push(parents[p].openChildren[c]);
			}				
		}
	}	
	return children;
}

function getEqualDimension(count) {
	var w = 100 / count;
	return w.toString() + '%';
}

function createColumnForParents(parents) {
	var hadChildren = false;
	var col = createGoldenColumn();
	
	var count = getAllOpenChildren(parents).length;
	
	for(var p in parents) {		
		if(parents[p].hasOpenChildren()) {			
			if(hadChildren) {
				col.appendChild(createRowDivider());
			}
		
			hadChildren = false;
			
			for(var c in parents[p].openChildren) {
				hadChildren = true;
				
				parents[p].openChildren[c].view = parents[p].openChildren[c].buildMetadataMainView(parents[p].openChildren[c].metadata);
				parents[p].openChildren[c].view.style.height = getEqualDimension(count);
				col.appendChild(parents[p].openChildren[c].view);
			}
		}
	}
	return col;
}

MetadataBrowser.prototype.rebuildVisual = function() {
	this.columns = this.buildColumns();
	
	
	for(var c = 0; c < this.columns.length; c++) {
		var div = this.columns[c];
			
		switch(this.columns.length)
		{
			case 1: div.style.width = "100%";
					break;
					
			case 2: switch(c)
					{
						case 0: div.style.width = "38%";
								break;
						case 1: div.style.width = "62%";
								break;
					}
					break;
					
			case 3: switch(c)
					{
						case 0: div.style.width = "19%";
								break;
						case 1: div.style.width = "31%";
								break;
						case 2: div.style.width = "50%";
								break;
					}
					break;
			case 4: switch(c)
					{
						case 0: div.style.width = "10%";
								break;
						case 1: div.style.width = "17%";
								break;
						case 2: div.style.width = "28%";
								break;
						case 3: div.style.width = "45%";
								break;
					}
					break;
			case 5: switch(c)
					{
						case 0: div.style.width = "6%";
								break;
						case 1: div.style.width = "10%";
								break;
						case 2: div.style.width = "16%";
								break;
						case 3: div.style.width = "26%";
								break;
						case 4: div.style.width = "42%";
								break;
					}
					break;									
		}
		this.rootVisual.appendChild(div);
	}
}

function attachInlinkHovers() {
	inlinks = document.getElementsByClassName("inlink");
	
	for(i in inlinks) {
		console.log($("#" + inlinks[i].id).hover);
		
		$("#" + inlinks[i].id).hover(
			function() {
				highlightAll(this);
			},
			function() {
				returnAll(this);
			});
	}
}

function highlightAll(obj) {
	inlinks = document.getElementsByClassName("inlink");	
	for(i in inlinks) {
		if(inlinks[i].id == obj.id)
			inlinks[i].style.backgroundColor = "yellow";
	}
	
	containers = document.getElementsByClassName("metadataContainer");	
	for(i in containers) {
		targetId = "div_" + obj.id.substring(3);
		if(containers[i].id == targetId)
			containers[i].style.backgroundColor = "white";
	}
}

function returnAll(obj) {
	inlinks = document.getElementsByClassName("inlink");	
	for(i in inlinks) {
		if(inlinks[i].id == obj.id)
			inlinks[i].style.backgroundColor = "lightgray";
	}
	
	containers = document.getElementsByClassName("metadataContainer");	
	for(i in containers) {
		targetId = "div_" + obj.id.substring(3);
		if(containers[i].id == targetId)
			containers[i].style.backgroundColor = "lightgray";
	}
}

MetadataDisplay.prototype.buildMetadataMainView = function(metadata) {
	var rootVisual = document.createElement('div');
		rootVisual.className = "metadataContainer";
		if(metadata.title != null)
			rootVisual.id = "div_"+spaceRemove(metadata.title.value);
		else
			rootVisual.id = "div_"+spaceRemove(metadata[0]);
		
	var table = document.createElement('table');
		table.className = "metadataView";
	
	for(var key in metadata) {
		var row = document.createElement('tr');
		var nameCol = document.createElement('td');
		var valueCol = document.createElement('td');
		
		if(metadata[key].scalar_type != null) {
			
			if(metadata[key].scalar_type == "String") {
				
				// Title field - special case
				if(key == "title") {					
					var titleValue = document.createElement('span');
						titleValue.className = metadata.title.style;
						titleValue.innerText = metadata.title.value;	
					
					var domainSpan = document.createElement('span');
						domainSpan.className = "domainSpan";
						
					if(metadata.location != null) 	
						domainSpan.innerText = getURLDomain(metadata.location.value);
													
					var titleCol = document.createElement('td');	
						titleCol.colSpan = 2;
									
					titleCol.appendChild(titleValue);
					titleCol.appendChild(domainSpan);
					
					row.appendChild(titleCol);
				}
				else {
					if(metadata[key].name != null) {
						var fieldLabel = document.createElement('span');
							fieldLabel.className = "fieldLabel";
							fieldLabel.innerText = toDisplayCase(metadata[key].name);
						
						nameCol.appendChild(fieldLabel);
					}
					
					var fieldValue = document.createElement('span');
						fieldValue.className = "fieldValue";
						fieldValue.innerText = metadata[key].value;						
						
					valueCol.appendChild(fieldValue);
					
					row.appendChild(nameCol);
					row.appendChild(valueCol);
				}
			}
				
			else if(metadata[key].scalar_type == "ParsedURL") {
				var aTag = document.createElement('a');
					aTag.innerText = metadata[key].name;
					aTag.href = metadata[key].value;
					
				var domainSpan = document.createElement('span');
					domainSpan.className = "domainSpan";
					domainSpan.innerText = getURLDomain(metadata[key].value);
					
				valueCol.appendChild(aTag);
				valueCol.appendChild(domainSpan);
				
				row.appendChild(nameCol);
				row.appendChild(valueCol);
			}			
		}
		
		else if(metadata[key].child_type != null){
			if(metadata[key].name != null) {
				var fieldLabel = document.createElement('span');
					fieldLabel.className = "fieldLabel";
					fieldLabel.innerText = toDisplayCase(metadata[key].name);
					
				nameCol.appendChild(fieldLabel);
			}
			
			var childList = metadata[key].value[metadata[key].child_type]
			
			switch(metadata[key].child_type) {
				case 'image': 		if(childList.length == 1)
										valueCol.appendChild(this.createImgDisplay(childList[0]));
									break;
				case 'person': 		valueCol.appendChild(this.createChildList(childList));
									break;
			}
			
			row.appendChild(nameCol);
			row.appendChild(valueCol);
		}		
		
		table.appendChild(row);
	}
	
	rootVisual.appendChild(table);
	return rootVisual;
};

MetadataDisplay.prototype.createImgDisplay = function(imgField) {

	var a = document.createElement('a');
		a.className = "fieldValue";
		
	var img = document.createElement('img');
		img.src = imgField.location.value;
		img.onclick = toggleImageSize;
		
	a.appendChild(img);
	return a;
}

MetadataDisplay.prototype.createChildList = function(children) {
	var childList = document.createElement('ul');
	
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		console.log(child);
		
		this.children.push(new MetadataDisplay(this.browser, this, child, this.children.length));		
		childList.appendChild(this.children[this.children.length - 1].listView);	
		
	}	
	
	return childList;
}

function getURLDomain(url) {
	return url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
}

function toDisplayCase(string) {
	var strings = string.split('_');
	var display = "";
	for( var s in strings) {
		display += strings[s].charAt(0).toUpperCase() + strings[s].slice(1) + " ";
	}
	return display;
}

function toggleImageSize(sender) {
	img = sender.srcElement;
	maxHeight = img.style.maxHeight
	if(maxHeight == "600px")
		img.style.maxHeight = "120px";
	else {
		img.style.maxHeight = "600px";
	}
}
