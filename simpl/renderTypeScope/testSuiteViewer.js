var testSuite = null;

function setup()
{
	initTestSuite();
}

function initTestSuite()
{
	testSuite = simplTestSuites[0];
	if(testSuite)
	{
		// init label
		document.getElementById("selectedTestSuite").innerText = testSuite.name;
		
		// init type list
		var scopeList = document.getElementById("typeScopeList");
		scopeList.killChildren();
		
		for(var i in testSuite.typeScopes)
		{
			var scope = testSuite.typeScopes[i];
			var li = document.createElement('li');
			li.onclick = selectScope;
			li.innerText = scope["simpl_types_scope"]["name"];
			
			scopeList.appendChild(li);
		}
		
		// init test object list
		var objList = document.getElementById("testDataList");
		objList.killChildren();
		
		for(var i in testSuite.testObjects)
		{
			var obj = testSuite.testObjects[i];
			var li = document.createElement('li');
				li.onclick = selectObject;
			
			for(var property in obj)
				li.innerText = property;
			
			objList.appendChild(li);
		}
	}
}

var selected = null;

function selectScope(event)
{
	if(selected != null)
	{
		selected.style.background = "#808080";
	}
	
	selected = event.target;
		selected.style.background = "lightgray";
	
	var scopeName = selected.innerText;
	var scope = getScope(scopeName);
	showObject(scope, document.getElementById("content"));	
}

function selectObject(event)
{
	if(selected != null)
	{
		selected.style.background = "#808080";
	}
	
	selected = event.target;
		selected.style.background = "lightgray";
	
	var objName = event.target.innerText;
	var obj = getTestObject(objName);
	showObject(obj, document.getElementById("content"));
}

function showObject(obj, containerDiv)
{
	var controls = createControls(obj);
	var rawPrint = createRawPrint(obj);
	var prettyPrint = createPrettyPrint(obj);
	
	
	containerDiv.killChildren();
		
	containerDiv.appendChild(controls);
	containerDiv.appendChild(rawPrint);
	containerDiv.appendChild(prettyPrint);
	
	if(isSimplTypeScope(obj))
	{
		showPretty();	
	}
	else
	{
		showRaw();
	}
}

function createControls(obj)
{	
	var div = document.createElement('div');
		div.id = "displayControls";
	
	var prettyButton = document.createElement('a');
		prettyButton.className = "button";
		prettyButton.id = "prettyButton";
		prettyButton.innerText = "Pretty";
		
		if(isSimplTypeScope(obj))
		{
			prettyButton.className = "selected";
			prettyButton.onclick = showPretty;
			prettyStyle = "button";
		}
		else
		{
			prettyButton.className = "disabled";
			prettyStyle = "disabled";
		}
		
	var rawButton = document.createElement('a');
		rawButton.className = "button";
		rawButton.id = "rawButton";
		rawButton.innerText = "Raw";
		rawButton.onclick = showRaw;
		
	div.appendChild(prettyButton);
	div.appendChild(rawButton);
	return div;
}

function createRawPrint(obj)
{
	var str = JSON.stringify(obj, undefined, 2);
	var pre = document.createElement('pre');
		pre.id = "rawDisplay";
		pre.innerHTML = syntaxHighlight(str);
	
	return pre;
}

function getScope(name)
{
	for(var i in testSuite.typeScopes)
	{
		var scope = testSuite.typeScopes[i];
		if(name == scope["simpl_types_scope"]["name"])
			return scope;
	}
	return null;
}

function getTestObject(name)
{
	for(var i in testSuite.testObjects)
	{
		var obj = testSuite.testObjects[i];		
		for(var property in obj)
		{
			if(name == property)
				return obj;
		}
	}
	return null;
}

function isSimplTypeScope(obj)
{
	var firstKey = null;
	for(var property in obj)
	{
		firstKey = property;
	}
	
	if(firstKey == "simpl_types_scope")
	{
		return true;
	}
	return false;
}

var prettyStyle = "";

function showPretty()
{	
	document.getElementById("prettyDisplay").style.display = "block";
	document.getElementById("rawDisplay").style.display = "none";
	
	document.getElementById("prettyButton").className = "selected";
	document.getElementById("rawButton").className = "button";
}

function showRaw()
{	
	document.getElementById("prettyDisplay").style.display = "none";
	document.getElementById("rawDisplay").style.display = "block";
	
	document.getElementById("prettyButton").className = prettyStyle;
	document.getElementById("rawButton").className = "selected";
}






















