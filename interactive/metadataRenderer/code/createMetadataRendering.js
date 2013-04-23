var FIRST_LEVEL_FIELDS = 20;
var FIELDS_TO_EXPAND = 10;

/** Functions related to the creation of the metadata HTML **/

/**
 * Converts the metadata into a set of metadataFields using the meta-metadata.
 * If there is visible metadata then create and return the HTML table.
 * @param isRoot, is the metadata the root document in the container (for styling)
 * @param mmd, meta-metadata for the given metadata
 * @param metadata, metadata to display
 * @return table, HTML table for the metadata or null if there is no metadata to display
 */
MetadataRenderer.buildMetadataDisplay = function(isRoot, mmd, metadata)
{
	// Convert the metadata into a list of MetadataFields using the meta-metadata.
	var metadataFields = MetadataRenderer.getMetadataFields(mmd["meta_metadata"]["kids"], metadata, 0);
	
	// Is there any visable metadata?
	if(MetadataRenderer.hasVisibleMetadata(metadataFields))
		// If so, then build the HTML table	
		return MetadataRenderer.buildMetadataTable(null, false, isRoot, metadataFields, FIRST_LEVEL_FIELDS);		
		
	else
		// The metadata doesn't contain any visible fields so there is nothing to display
		return null;	
}

/**
 * Build the HTML table for the list of MetadataFields
 * @param table, the table that the metadata fields should be rendered to, null if the table should be created
 * @param isChildTable, true if the table belongs to a collection table, false otherwise
 * @param isRoot, true if table is the root table of the MetadataRendering
 * @param metadataFields, array of MetadataFields to be displayed
 * @param fieldCount, the number of fields to render before cropping with a "More" button
 * @return HTML table of the metadata display
 */
MetadataRenderer.buildMetadataTable = function(table, isChildTable, isRoot, metadataFields, fieldCount)
{
	if(!table)
	{
		table = document.createElement('table');
		
		if(!isRoot)
			table.className = "metadataTable";
	}
	
	// Iterate through the metadataFields which are already sorted into display order
	for(var i = 0; i < metadataFields.length; i++)
	{			
		
		var row = document.createElement('tr');
		var nameCol = document.createElement('td');
			nameCol.className = "labelCol";
			
		var valueCol = document.createElement('td');
			valueCol.className = "valueCol";
			
			
		// if the maximum number of fields have been rendered then stop rendering and add a "More" expander
		if(fieldCount <= 0)
		{
			//TODO - add "more" expander
			var moreCount = metadataFields.length - i;
			
			var fieldValueDiv = document.createElement('div');
				fieldValueDiv.className = "moreButton";
				fieldValueDiv.textContent = "More... ("+moreCount+")";
				fieldValueDiv.onclick = MetadataRenderer.morePlease;
						
			var moreData = {
				"fields": FIELDS_TO_EXPAND,
				"isChild": isChildTable,
				"data": metadataFields.slice(i, metadataFields.length)
			};
			
			
			
			var detailsSpan = document.createElement('span');
				detailsSpan.className = "hidden";
				detailsSpan.textContent = JSON.stringify(moreData);
			
			fieldValueDiv.appendChild(detailsSpan);
			
			valueCol.appendChild(fieldValueDiv);
								
			row.appendChild(nameCol);
			row.appendChild(valueCol);				
			
			table.appendChild(row);
			
			break;
		} 
			
		var metadataField = metadataFields[i];
		
		if(metadataField.value)
		{
			// If the field is an empty array then move on to the next field
			if(	metadataField.value.length != null && metadataField.value.length == 0)
				continue;
			
			if(metadataField.scalar_type)
			{				
				// Currently it only rendered Strings, Dates, Integers, and ParsedURLs
				if(metadataField.scalar_type == "String" || metadataField.scalar_type == "Date" ||metadataField.scalar_type == "Integer" || metadataField.scalar_type == "ParsedURL")
				{	
					if(metadataField.name)
					{
						var fieldLabel = document.createElement('p');
							fieldLabel.className = "fieldLabel";
							fieldLabel.innerText = MetadataRenderer.toDisplayCase(metadataField.name);
							fieldLabel.textContent = MetadataRenderer.toDisplayCase(metadataField.name);
						
						var fieldLabelDiv = document.createElement('div');
							fieldLabelDiv.className = "fieldLabelContainer";
						
						fieldLabelDiv.appendChild(fieldLabel);
						nameCol.appendChild(fieldLabelDiv);
					}
					
					// If the field is a URL then it should show the favicon and an A tag
					if(metadataField.scalar_type == "ParsedURL")
					{
						// Uses http://getfavicon.appspot.com/ to resolve the favicon
						var favicon = document.createElement('img');
							favicon.className = "favicon";
							favicon.src = "http://g.etfv.co/" + MetadataRenderer.getHost(metadataField.navigatesTo);
						
						var aTag = document.createElement('a');
						aTag.innerText = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
						aTag.textContent = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
						
						aTag.href = metadataField.value;
						aTag.className = "fieldValue";
					
						var fieldValueDiv = document.createElement('div');
							fieldValueDiv.className = "fieldValueContainer";
						
						fieldValueDiv.appendChild(favicon);
						fieldValueDiv.appendChild(aTag);
						valueCol.appendChild(fieldValueDiv);
					}
				
					// If the field navigates to a link then it should show the favicon and an A tag
					else if( metadataField.navigatesTo)
					{				
						// Uses http://getfavicon.appspot.com/ to resolve the favicon
						var favicon = document.createElement('img');
							favicon.className = "favicon";
							favicon.src = "http://g.etfv.co/" + MetadataRenderer.getHost(metadataField.navigatesTo);
						
						var aTag = document.createElement('a');
							aTag.className = "fieldValue";
							aTag.target = "_blank";
							aTag.innerText = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
							aTag.textContent = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
							
							aTag.href = metadataField.navigatesTo;
						
						var fieldValueDiv = document.createElement('div');
							fieldValueDiv.className = "fieldValueContainer";						
						
						// For the current WWW study the rendering should have incontext CiteULike bookmarklets for specific types of metadata
						if(WWWStudy)				
							WWWStudy.addCiteULikeButton(fieldValueDiv, metadataField.parentMDType, metadataField.navigatesTo)						
						
						fieldValueDiv.appendChild(favicon);
						fieldValueDiv.appendChild(aTag);
						valueCol.appendChild(fieldValueDiv);
					}
					
					// If there is no navigation then just display the field value as text
					else
					{
						var fieldValue = document.createElement('p');
							fieldValue.className = "fieldValue";
							fieldValue.innerText = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
							fieldValue.textContent = MetadataRenderer.removeLineBreaksAndCrazies(metadataField.value);
							
						var fieldValueDiv = document.createElement('div');
							fieldValueDiv.className = "fieldValueContainer";
						
						fieldValueDiv.appendChild(fieldValue);
						valueCol.appendChild(fieldValueDiv);
					}
															
					row.appendChild(nameCol);
					row.appendChild(valueCol);
					
					fieldCount--;
				}		
			}
			
			else if(metadataField.composite_type != null)
			{
				/** Label Column **/
				var childUrl = MetadataRenderer.guessDocumentLocation(metadataField.value);
				
				var fieldLabelDiv = document.createElement('div');
					fieldLabelDiv.className = "fieldLabelContainer";
					fieldLabelDiv.style.minWidth = "36px";					
					
				// Is the document already rendered?								
				if(childUrl != "" && MetadataRenderer.isRenderedDocument(childUrl) )
				{
					// If so, then don't allow the document to be expaned, to prevent looping						
					fieldLabelDiv.className = "fieldLabelContainerOpened";				
				}
				else
				{
					// If the document hasn't been download then display a button that will download it
					var expandButton = document.createElement('div');
						expandButton.className = "expandButton";
						
					expandButton.onclick = MetadataRenderer.downloadAndDisplayDocument;
					
					if(childUrl != "")
					{
						expandButton.onmouseover = MetadataRenderer.highlightDocuments;
						expandButton.onmouseout = MetadataRenderer.unhighlightDocuments;
					}
							
					var expandSymbol = document.createElement('div');
						expandSymbol.className = "expandSymbol";
						expandSymbol.style.display = "block";
						
					var collapseSymbol = document.createElement('div');
						collapseSymbol.className = "collapseSymbol";
						collapseSymbol.style.display = "block";						
										
					expandButton.appendChild(expandSymbol);
					expandButton.appendChild(collapseSymbol);
					fieldLabelDiv.appendChild(expandButton);
				}
				
				if(metadataField.name)
				{													
					//If the table isn't a child table then display the label for the composite
					if(!isChildTable)
					{
						var fieldLabel = document.createElement('p');
							fieldLabel.className = "fieldLabel";
							fieldLabel.innerText = MetadataRenderer.toDisplayCase(metadataField.name);
							fieldLabel.textContent = MetadataRenderer.toDisplayCase(metadataField.name);
						
						fieldLabelDiv.appendChild(fieldLabel);
					}
				}
				
				nameCol.appendChild(fieldLabelDiv);
				
				/** Value Column **/
				
				var fieldValueDiv = document.createElement('div');
					fieldValueDiv.className = "fieldCompositeContainer";

				// Build the child table for the composite
				var childTable =  MetadataRenderer.buildMetadataTable(null, false, false, metadataField.value, 1);
				
				// If the childTable has more than 1 row, collapse table
				if(metadataField.value.length > 1)
					MetadataRenderer.collapseTable(childTable);			
				
				fieldValueDiv.appendChild(childTable);				
				
				var nestedPad = document.createElement('div');
					nestedPad.className = "nestedPad";
				
				nestedPad.appendChild(childTable);
				
				fieldValueDiv.appendChild(nestedPad);
				
				valueCol.appendChild(fieldValueDiv);
				
				// Add the unrendered document to the documentMap
				if(childUrl != "")
					MetadataRenderer.documentMap.push(new DocumentContainer(childUrl, null, row, false));
				
				// Add event handling to highlight document connections	
				if(childUrl != "")
				{	
					nameCol.onmouseover = MetadataRenderer.highlightDocuments;
					nameCol.onmouseout = MetadataRenderer.unhighlightDocuments;
				}
				
				row.appendChild(nameCol);
				row.appendChild(valueCol);
				
				fieldCount--;
			}
			
			else if(metadataField.child_type != null)
			{		
				if(metadataField.name != null)
				{
					var fieldLabel = document.createElement('p');
						fieldLabel.className = "fieldLabel";
						fieldLabel.innerText = MetadataRenderer.toDisplayCase(metadataField.name) + "(" + metadataField.value.length + ")";
						fieldLabel.textContent = MetadataRenderer.toDisplayCase(metadataField.name) + "(" + metadataField.value.length + ")";
												
					var fieldLabelDiv = document.createElement('div');
							fieldLabelDiv.className = "fieldLabelContainer";
					
					// does it need to expand / collapse
					if(metadataField.value.length > 1)
					{
						var expandButton = document.createElement('div');
							expandButton.className = "expandButton";
							
							expandButton.onclick = MetadataRenderer.expandCollapseTable;
							
							var expandSymbol = document.createElement('div');
								expandSymbol.className = "expandSymbol";
								expandSymbol.style.display = "block";
								
							var collapseSymbol = document.createElement('div');
								collapseSymbol.className = "collapseSymbol";
								collapseSymbol.style.display = "block";						
						
							expandButton.appendChild(expandSymbol);
							expandButton.appendChild(collapseSymbol);
							
						fieldLabelDiv.appendChild(expandButton);
					}						
					fieldLabelDiv.appendChild(fieldLabel);
					nameCol.appendChild(fieldLabelDiv);
				}
					
				var fieldValueDiv = document.createElement('div');
					fieldValueDiv.className = "fieldChildContainer";
				
				var childTable =  MetadataRenderer.buildMetadataTable(null, true, false, metadataField.value, 1);
				if(metadataField.value.length > 1)
				{
					MetadataRenderer.collapseTable(childTable);			
				}					
					
				var nestedPad = document.createElement('div');
					nestedPad.className = "nestedPad";
				
				nestedPad.appendChild(childTable);
				
				fieldValueDiv.appendChild(nestedPad);
				
				valueCol.appendChild(fieldValueDiv);
								
				row.appendChild(nameCol);
				row.appendChild(valueCol);
				
				fieldCount--;
			}		
			table.appendChild(row);
		}
	}	
	return table;
}

/** 
 * Make the string prettier by replacing underscores with spaces  
 * @param string to make over
 * @return hansome string, a real genlteman
 */
MetadataRenderer.toDisplayCase = function(string)
{	
	var strings = string.split('_');
	var display = "";
	for(var s in strings)
		display += strings[s].charAt(0).toLowerCase() + strings[s].slice(1) + " ";

	return display;
}

/**
 * Remove line breaks from the string and any non-ASCII characters
 * @param string
 * @return a string with no line breaks or crazy characters
 */
MetadataRenderer.removeLineBreaksAndCrazies = function(string)
{
	string = string.replace(/(\r\n|\n|\r)/gm," ");	
	var result = "";
	for (var i = 0; i < string.length; i++)
        if (string.charCodeAt(i) < 128)
            result += string.charAt(i);
 
	return result;
}

/**
 * Gets the host from a URL
 * @param url, string of the target URL
 * @return host as a string
 */
MetadataRenderer.getHost = function(url)
{
	var host = url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
	return "http://" + host;
}