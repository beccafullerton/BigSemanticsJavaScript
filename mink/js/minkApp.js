var minkApp ={};

minkApp.explorationSpace = new ExplorationSpace();

minkApp.metadata_collection = {};
minkApp.counter = 0;
minkApp.COLLAPSED_CARD_HEIGHT = 31;
minkApp.leftMostCol = null;
minkApp.rightMostCol = null;
minkApp.maxCols = 1;
minkApp.columnKeyGen = 0;
minkApp.offScreenColumnsLeft = 0;
minkApp.offScreenColumnsRight = 0;
minkApp.favorites = [];
minkApp.currentQuery = null;
minkApp.queryMap = new Map();
var bsService = new BSAutoSwitch(['eganfccpbldleckkpfomlgcbadhmjnlf', 'gdgmmfgjalcpnakohgcfflgccamjoipd']);
minkApp.cardDuplicateMap = new Map();


//remove from Space

minkApp.signalFavorite = function(event){
	var card = $(event.srcElement).closest('.minkCardContainer')[0];
	var exExp = $(card).find('.minkExplorablesExpander')[0];
	var minkTitleClickable = $(card).find('.minkTitleClickable')[0];

	var url = exExp.getAttribute('url');
	var favicon = $(minkTitleClickable).children('.minkFavicon')[0].src;
	var mdname = $(minkTitleClickable).children('.minkTitleField')[0].childNodes[0].innerHTML;
	var detailDetails = {type: 'minkfavorite', url: url, favicon: favicon, mdname: mdname};
	var eventDetail = {detail: detailDetails, bubbles: true};
	var myEvent = new CustomEvent("minkevent", eventDetail);
	event.target.dispatchEvent(myEvent);
}
minkApp.removeButtonHandler = function(event){
	var minkCardHTML = $(event.srcElement).closest('.minkCardContainer')[0];
	var pileId = minkCardHTML.parentNode.getAttribute('pileid');
	var pile = minkApp.currentQuery.pileMap.get(pileId);
	for (var i = 0 ; i < pile.cards.length; i++){
		if (pile.cards[i].url == minkCardHTML.getAttribute('minkcardid')){
			minkApp.removeCard(pile, pile.cards[i]);

		}
	}

}
minkApp.removeCard = function(pile, card){
	var index = $(card.html).index();
	pile.cards[index].removed = true;
	pile.cards[index].displayed = false;
	var cards = minkApp.cardDuplicateMap.get(card.url);
	for (var i = 0; i < cards.length; i++){
		minkApp.updateCardDisplay(cards[i]);
		
	}
	
//	$(card).css('display', 'none');
}
minkApp.openLink = function(event){
	var link = event.srcElement.getAttribute('outlink');
	  var win = window.open(link, '_blank');

}

minkApp.buildLinkOutControl = function(parent, link){
	var olc = buildDiv('minkCardControl')
	var openLink = document.createElement('img');
	openLink.className = 'minkCardControlIcon';
	openLink.src = './img/share-boxed.svg';
	olc.addEventListener('click', minkApp.openLink);
	olc.setAttribute('outlink', link)
	olc.appendChild(openLink);
	parent.appendChild(olc);
}

minkApp.buildCardControls = function(parent, link){
	var controlCont = buildDiv('minkCardControls');
	var r = buildDiv('minkCardControl')

	var remove = document.createElement('img');
	remove.className = 'minkCardControlIcon';
	remove.src = './img/x.svg';
	r.addEventListener('click', minkApp.removeButtonHandler)
	r.appendChild(remove);

	
	
	//see if mink::uuid, link, or mink::lin;

	
	var f = buildDiv('minkCardControl')

	var favorite = document.createElement('img');
	favorite.className = 'minkCardControlIcon';
	favorite.src = './img/star.svg';
	f.addEventListener('click', minkApp.signalFavorite)
	f.appendChild(favorite);

	
	controlCont.appendChild(f);
	if(link.startsWith('mink::')){
		var sublink = link.substring(6);
		if(!sublink.startsWith('UIDD')){
			minkApp.buildLinkOutControl(controlCont, sublink)
		}
	}else{
		minkApp.buildLinkOutControl(controlCont, link)

	}
	controlCont.appendChild(r);
	parent.appendChild(controlCont)
}

minkApp.showCardControls = function(event){
	$(event.srcElement).children('.minkCardControls')[0].style.opacity = "1";
	$(event.srcElement).children('.minkCardControls')[0].style.pointerEvents = "auto";

}
minkApp.hideCardControls = function(event){
	$(event.srcElement).children('.minkCardControls')[0].style.opacity = "0";
	$(event.srcElement).children('.minkCardControls')[0].style.pointerEvents = "none";

}





function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}

function isCardDuplicate(bucket, id){
	for (var i = 0; i < bucket.length; i++){
		if (bucket[i].displayed && bucket[i] != id){
			return true;
		}
	}
	return false;
}
function minkCard(url, div, pile){
	this.url = url;
	this.html = div;
	//is the cards pile in view?
	this.inView = true;	
	//is the card already displayed in another pile
	this.displayed;
	var bucket = minkApp.cardDuplicateMap.get(this.url)
	if(bucket){
		bucket.push(this);
		this.displayed = !isCardDuplicate(bucket, this);
		this.duplicate = true;
		this.html.style.display = "none";

	}else{
		minkApp.cardDuplicateMap.put(this.url, [this]);
		this.displayed = true;
		this.duplicate = false;
	}
	this.pile = pile;
	this.removed = false;

}



function pileIDGen(url, collection){
	if(collection){
		return url + '|' + collection;
	}
	else{ 
		return url + '|' + 'base_url';
	}


}


minkApp.restoreQueryFromHistory = function(event){
	var cont = event.srcElement.parentNode;
	var queryId = cont.getAttribute('id');
	if (queryId == minkApp.currentQuery.uuid){
		return
	}else{
		try{
			var q = minkApp.queryMap.get(queryId);
			minkApp.hidePreviousQuery();
			minkApp.currentQuery = q;
			minkApp.rebuildCurrentQuery();
		}catch(e){
			console.log('error: ' + e);
		}
		
	}
}
minkApp.newColumnId = function(){
	minkApp.columnKey++;
	return (minkApp.columnKey-1);
}
minkApp.initialize = function(minkAppHTML){
	//Dumb code that sets at 3 columns instead of checking stuff. putting this here now
	//In case there's a responsive future to be had
	minkApp.baseCol = minkAppHTML.childNodes[0];
	var columns = $(minkAppHTML).find(".minkColumn");
	//minkApp.currentQuery.columns = columns;
	minkApp.leftMostCol = columns[0];
	minkApp.rightMostCol = columns[0];
	columns[0].setAttribute('column', '1');
	minkApp.maxCols = 3;
	minkApp.HTML = minkAppHTML;
	
	$(".minkBackButton").css('display', 'none');
	$(".minkForwardButton").css('display', 'none');

	
}


minkApp.addQueryToHistory = function(){
	//build HTML representation for new query
	//if representation of current query already has a qLevel, dont build one, else add
	//add representation to appropriate qLvl
}
/*
minkApp.markPileOutOfView = function(pileID){
	var pile = minkApp.pileMap.
}

minkApp.markColumnOutOfView = function(column){
	var piles = $(column).find('.minkPile');
	for (var i = 0; i < piles.length; i++){
		var id = piles.getAttribute('pileid');
		minkApp.markPileOutOfView(id);
	}
}
*/
minkApp.hidePreviousQuery = function(){
	var keys = minkApp.currentQuery.pileMap.keys;
	for (var i = 0; i < keys.length; i++){
		var pile = minkApp.currentQuery.pileMap.get(keys[i]);
		var cards = pile.cards;
		for (var j = 0; j < cards.length; j++){
			cards[j].inView = false;
			cards[j].displayed = false;
			
		}
	}
	$("#minkColumns").empty();
	minkApp.leftMostCol =null;
	minkApp.rightMostCol = null;
	$('#contextTitle')[0].innerHTML = "";
	
	//remove add query button visbility by default
	$('.minkNewQueryButton').removeClass('visible');
	//mak
	
	
	
	
}

minkApp.updateCardDisplay = function(card){
	var bucket = minkApp.cardDuplicateMap.get(card.url);
	card.displayed = !card.removed && !isCardDuplicate(bucket, card);
	if (card.displayed){
		card.html.style.display = "";
		minkApp.updateDuplicateCount(card.pile);
		
	}else{
		card.html.style.display = "none";
		minkApp.updateDuplicateCount(card.pile);

	}
}
//will come back to, may be complicated
minkApp.rebuildCurrentQuery = function(){
	//
	minkApp.hidePreviousQuery();
	//
	var keys = minkApp.currentQuery.pileMap.keys;
	for (var i = 0; i < keys.length; i++){
		var pile = minkApp.currentQuery.pileMap.get(keys[i]);
		var c = $(pile.HTML).closest('.minkColumn')[0];
		var cnum = parseInt(c.getAttribute('column'));
		if(cnum > 0 && cnum <= 3){
			var cards = pile.cards;
			for (var j = 0; j < cards.length; j++){
				cards[j].inView = true;
				minkApp.updateCardDisplay(cards[j]);
			}
			minkApp.updateDuplicateCount(pile);
		}
		

	}
	$('#contextTitle')[0].innerHTML =  minkApp.currentQuery.contextTitle;

	var columns = minkApp.currentQuery.columns;
	var cont = $('#minkColumns')[0];
	for(var i = 0; i < columns.length; i++){
		cont.appendChild(columns[i]);
	}
	$(('#' + minkApp.currentQuery.uuid)).children('.minkNewQueryButton').addClass('visible');
}
minkApp.queryHighlight = function(event){
	var qLevel = $(event.srcElement).closest('.qLevel')[0];
	if(qLevel){
		$(qLevel).addClass('minkQHighlight');
	}else{
		$(event.srcElement).addClass('minkQHighlight-color');
	}
}
minkApp.queryUnhighlight = function(event){
	var qLevel = $(event.srcElement).closest('.qLevel')[0];
	if(qLevel){
		$(qLevel).removeClass('minkQHighlight');
	}else{
		$(event.srcElement).removeClass('minkQHighlight-color');
	}

}



minkApp.nsearchKeypress = function(event){
	 if(event && event.keyCode == 13){
		 var newQueryString = event.srcElement.value;
		 var pid = event.srcElement.getAttribute('pid');
		 var nQuery = new Query(newQueryString, ['google_scholar'], pid);
		

		var column;
		if(!minkApp.currentQuery){
			column = minkApp.leftMostCol;
		}else{
			minkApp.hidePreviousQuery();

			column = minkApp.buildColumn($('#minkColumns')[0]);
			column.setAttribute('column', '1');
			$('#minkColumns')[0].appendChild(column);
		}
		$('#contextTitle')[0].innerHTML = nQuery.contextTitle;
		var pile = minkApp.buildPile(column, nQuery.urls, nQuery.urls[0], null, null, true);
		nQuery.pileMap.put(pileIDGen(nQuery.urls[0], null), pile);
		nQuery.columns.push(column);

		minkApp.currentQuery = nQuery;
		minkApp.explorationSpace.queries.push(nQuery);
		$(('#' + minkApp.currentQuery.uuid)).children('.minkNewQueryButton').addClass('visible');
		 
		 
		 
		 
		 
		 
	    $(event.srcElement.parentNode).remove();

	 }

}
minkApp.newQueryBox = function(event){
	
	//remove other search boxes
	$('minkNSearch').remove();
	//create new qlevel if needed
	var parentId = event.srcElement.parentNode.getAttribute('id');
	var parentNode = event.srcElement.parentNode;
	var parentQuery = minkApp.queryMap.get(parentId);
	var pqq = parentQuery.query;
	var level;
	if ($(parentNode).next().hasClass('qLevel')){
		level = $(parentNode).next()[0]
	}else{
		level = buildDiv('qLevel');
		$(level).insertAfter(parentNode);
		
	}
	//create search box
	var nsearch = document.createElement('input');
	nsearch.setAttribute('type', "text");
	nsearch.value = pqq;
	nsearch.setAttribute("autofocus", "");
	nsearch.className = "minkNSearch";
	nsearch.setAttribute('pid', parentId)
	nsearch.addEventListener('keypress', minkApp.nsearchKeypress);
	var holder = buildDiv('minkNSearchContainer');
	var x = document.createElement('img');
	x.className = 'minkNSearchX';
	x.src = './img/x.svg';
	holder.appendChild(nsearch);
	holder.appendChild(x);
	level.appendChild(holder);
	//set event listeners	
		
}
minkApp.exploreURL = function(url){
	//checki
	if(minkApp.currentQuery){
		if(url === minkApp.currentQuery.query){
			return;
		}
	}

	

	for (var i = 0; i < minkApp.explorationSpace.queries.length; i++){
		if(url === minkApp.explorationSpace.queries[i].query){
			minkApp.hidePreviousQuery();
			minkApp.explorationSpace.currentQuery = minkApp.explorationSpace.queries[i];
			minkApp.rebuildCurrentQuery();
			return;
		}
	}

	//var explorationSpace = new ExplorationSpace(url, null);
	var nQuery = new Query(url);
	var column;
	if(!minkApp.currentQuery){
		column = minkApp.leftMostCol;
	}else{
		minkApp.hidePreviousQuery();
		
		column = minkApp.buildColumn($('#minkColumns')[0]);
		column.setAttribute('column', '1');
		$('#minkColumns')[0].appendChild(column);
	}
	var pile = minkApp.buildPile(column, [url], url, null, null);
	$('#contextTitle')[0].innerHTML = nQuery.contextTitle;

	nQuery.pileMap.put(pileIDGen(url, null), pile);
	nQuery.columns.push(column);
	minkApp.currentQuery = nQuery;
	minkApp.explorationSpace.queries.push(nQuery);
	
	$(('#' + minkApp.currentQuery.uuid)).children('.minkNewQueryButton').addClass('visible');


}

function toGoogleUrl(searchString){
    
    
	var terms = searchString.split(" ");
	var url = "https://www.google.com/search?q=";
	for (var x in terms){
		url += terms[x];
		url += "+";
	}
    encodeURI(url);
    console.log(url);
    return url;
}


minkApp.exploreNewQuery = function(queryString){

	if(minkApp.currentQuery){
		if(queryString === minkApp.currentQuery.query){
			return;
		}
	}

	

	for (var i = 0; i < minkApp.explorationSpace.queries.length; i++){
		if(queryString === minkApp.explorationSpace.queries[i].query){
			minkApp.hidePreviousQuery();
			minkApp.currentQuery = minkApp.explorationSpace.queries[i];
			minkApp.rebuildCurrentQuery();
			return;
		}
	}
	
	
	var nQuery = new Query(queryString, ['google_scholar']);
	var column;
	if(!minkApp.currentQuery){
		column = minkApp.leftMostCol;
	}else{
		minkApp.hidePreviousQuery();

		column = minkApp.buildColumn($('#minkColumns')[0]);
		column.setAttribute('column', '1');
		$('#minkColumns')[0].appendChild(column);
	}
	$('#contextTitle')[0].innerHTML = nQuery.contextTitle;
	var pile = minkApp.buildPile(column, nQuery.urls, nQuery.urls[0], null, null, true);
	nQuery.pileMap.put(pileIDGen(nQuery.urls[0], null), pile);
	nQuery.columns.push(column);

	minkApp.currentQuery = nQuery;
	minkApp.explorationSpace.queries.push(nQuery);
	$(('#' + minkApp.currentQuery.uuid)).children('.minkNewQueryButton').addClass('visible');

	

}


//if new Column is true, ignore code about opneing a new colun
minkApp.moveForward = function(newColumn){
	//

	var already = false;
	 for(var i = 0; i < minkApp.currentQuery.columns.length; i++){
		  var colNo = parseInt(minkApp.currentQuery.columns[i].getAttribute('column'));
		 
		  if(colNo == 1){
			  minkApp.currentQuery.columns[i].classList.add('minkDeletingColumn');
			  minkApp.currentQuery.columns[i].addEventListener('animationend', minkApp.toggleDisplay)
			  minkApp.currentQuery.columns[i].setAttribute('column', "0");

			  }
		  else if(colNo == 2){
				  minkApp.leftMostCol = minkApp.currentQuery.columns[i];
		  }
		  
		  if(colNo > 1 && (already == false)) 
			  minkApp.currentQuery.columns[i].setAttribute('column', (colNo - 1).toString());
		  
	 
		 if(colNo == (minkApp.maxCols) && (newColumn != true) && (already == false)){
			  minkApp.currentQuery.columns[(i+1)].setAttribute('column', minkApp.maxCols.toString());
			  minkApp.rightMostCol = minkApp.currentQuery.columns[(i+1)];
			  minkApp.rightMostCol.style.display = '';
			  $(minkApp.rightMostCol).removeClass("minkDeletingColumnRight");
			  //this is a hacky way to ensure this code is only executed one
			  already = true;

		 }
	 }
		minkApp.offScreenColumnsLeft++;
		if(minkApp.offScreenColumnsRight > 0){
			minkApp.offScreenColumnsRight--;

		}
		$(".minkBackButton").css('display', '');
		$(".leftPlaceholder").css('display', 'none');

		if(minkApp.offScreenColumnsRight < 1){
			$(".minkForwardButton").css('display', 'none');
			$(".rightPlaceholder").css('display', '');

		}
		minkApp.currentQuery.column++;

}
minkApp.goBackwards = function(howMany){
	 for(var i = 0; i < minkApp.currentQuery.columns.length; i++){
		  var colNo = parseInt(minkApp.currentQuery.columns[i].getAttribute('column'));
		  if(colNo == 1){
			  minkApp.currentQuery.columns[(i-1)].setAttribute('column', "1");
			  minkApp.leftMostCol = minkApp.currentQuery.columns[(i-1)];
			  minkApp.leftMostCol.style.display = '';
			  $(minkApp.leftMostCol).removeClass("minkDeletingColumn");
			  

		  }
		  if(colNo == minkApp.maxCols){
			  minkApp.currentQuery.columns[i].classList.add('minkDeletingColumnRight');
			  minkApp.currentQuery.columns[i].addEventListener('animationend', minkApp.toggleDisplay)
			  minkApp.currentQuery.columns[i].setAttribute('column', "0");

			  
		  }else if(colNo > 0){
			  minkApp.currentQuery.columns[i].setAttribute('column', (colNo + 1).toString());

		  }
	 }
	 minkApp.offScreenColumnsRight++;
		minkApp.offScreenColumnsLeft--;

	 $(".minkForwardButton").css('display', '');
	 $(".rightPlaceholder").css('display', 'none');

	 if(minkApp.offScreenColumnsLeft < 1){
			$(".minkBackButton").css('display', 'none');
			 $(".leftPlaceholder").css('display', '');

		}
	minkApp.currentQuery.column--;

}
minkApp.buildColumn = function(parent){
	var column = buildDiv('minkColumn');
	parent.appendChild(column);
	return column;
}
minkApp.goBackHandler = function(event){
	console.log('hahaha')
	minkApp.goBackwards(1);
	
}
minkApp.goForwardsHandler = function(event){
	console.log('hahaha')
	minkApp.moveForward();
	
}

minkApp.addFavorite = function(url, mdName, faviconLink, srcHTML){
	
	var found = -1;
	
	for(var i = 0; i < minkApp.favorites.length; i++){
		if (minkApp.favorites[i].url == url){
			found = i;
		}
	}
	
	if(found < 0){
		var favorite = {url: url, src: srcHTML, mdname: mdName, favicon: faviconLink, html: null};
		minkApp.favorites.push(favorite);

	}else{
		var toBack = minkApp.favorites[found];
		minkApp.favorites.splice(found, 1);
		minkApp.favorites.push(toBack);
	}
	
	minkApp.updateFavoritesDisplay();
	
	
}

minkApp.buildFavorite = function(favorite){
	var favoriteCont = buildDiv('minkFavorite');
	var favoriteTitle = buildDiv('minkFavoriteTitlebar');
	var favoriteIcon = document.createElement('img');
	favoriteIcon.className = "minkFavoriteIcon";
	favoriteIcon.setAttribute('src', favorite.favicon);
	var favoriteLink = document.createElement('a');
	favoriteLink.className = "minkFavoriteLink";
	favoriteLink.innerHTML = favorite.mdname;
	favoriteLink.href = favorite.url;
	favoriteTitle.appendChild(favoriteIcon);
	favoriteTitle.appendChild(favoriteLink);
	favoriteCont.appendChild(favoriteTitle);
	return favoriteCont;
}
minkApp.updateFavoritesDisplay = function(){
	var favoritesContainer = $('#minkFavorites')[0];
	favoritesContainer.childNodes = [];
	for(var i = minkApp.favorites.length-1; i >=0 ; i--){
		
		
		if(minkApp.favorites[i].html == null){
			minkApp.favorites[i].html = minkApp.buildFavorite(minkApp.favorites[i])
		}
		favoritesContainer.appendChild(minkApp.favorites[i].html);
	}
	if(minkApp.favorites.length >0){
		var expander = $('#minkFavoritesExpander')[0];
		if(!$('#minkFavoritesExpander').hasClass('nonempty')){
					$('#minkFavoritesExpander').addClass('nonempty');

		}
		$('#minkFavoritesExpander').removeClass('flash');
		setTimeout(function(){$('#minkFavoritesExpander').addClass('flash')}, 1)

	}
}
minkApp.favoritesToggleHandler = function(event){
	
	var minkFavorites = $('#minkFavorites');
	var expander = $('#minkFavoritesExpander');
	if(minkFavorites.hasClass('mfShow')){
		minkFavorites.removeClass('mfShow');
		minkFavorites.addClass('mfHidden');
		expander.removeClass('expanded');
		expander.addClass('deflated');


	}else if(minkApp.favorites.length > 0){
		minkFavorites.removeClass('mfHidden');
		minkFavorites.addClass('mfShow');
		expander.removeClass('deflated');
		expander.addClass('expanded');

	}


}

minkApp.newPile = function(details, srcElement){
	//Determine which column the event comes from
	 var nextCol = null;
	 var targetColumn = $(srcElement).closest(".minkColumn")[0];
	 var columnNumber = parseInt(targetColumn.getAttribute('column'));
	 console.log(columnNumber);
	 if((targetColumn == minkApp.rightMostCol) || (minkApp.rightMostCol == null)){
		 if(columnNumber < minkApp.maxCols){
			 //makes new column and add it in
			  nextCol = minkApp.buildColumn($(minkApp.HTML).find('.minkColumns')[0]);
			  nextCol.setAttribute('column', (columnNumber+1).toString());
			  minkApp.currentQuery.columns.push(nextCol);
			  minkApp.rightMostCol = nextCol;

		 }else{
			
			  nextCol = minkApp.buildColumn($(minkApp.HTML).find('.minkColumns')[0]);
				nextCol.setAttribute('column', (minkApp.maxCols).toString());
				  minkApp.rightMostCol = nextCol;

			  minkApp.moveForward(true);
				minkApp.currentQuery.columns.push(nextCol);

			  
		 }
		 //move forwards
	 }/*else if(minkApp.rightMostCol == null){
 		  nextCol = minkApp.buildColumn($(minkApp.HTML).find('.minkColumns')[0]);
		  nextCol.setAttribute('column', (columnNumber+1).toString());
		  minkApp.currentQuery.columns.push(nextCol);
		  minkApp.rightMostCol = nextCol;
	 }*/
	 else{
		 var searchForCol = (columnNumber+1).toString();
		 nextCol = $("div[column='" + searchForCol + "']")[0];
		 
		 
		 
	 }
	 var pile = minkApp.buildPile(nextCol, event.detail.links, event.detail.rooturl, event.detail.collectionname, event.srcElement)

	 
	 minkApp.currentQuery.pileMap.put(pileIDGen(details.rooturl, details.collectionname), pile);
	 srcElement.addEventListener('click', minkApp.showHidePileHandler);
	 srcElement.removeEventListener('click', Mink.showExplorableLinks);
	
}
minkApp.minkEventHandler = function(event){
	 
	 if(event.detail.type == 'minknewpile'){
		
		 minkApp.newPile(event.detail, event.srcElement);

		 
		 
	 }else if(event.detail.type == 'minkshowless'){
		 var id = pileIDGen(event.detail.rooturl, event.detail.collectionname);
		 var pile = minkApp.currentQuery.pileMap.get(id);
		 pile.rootHTML = event.srcElement;
	 }else if(event.detail.type=='minkshowmore'){
		 var id = pileIDGen(event.detail.rooturl, event.detail.collectionname);
		 var pile = minkApp.currentQuery.pileMap.get(id);
		 pile.rootHTML = event.srcElement;
	 }else if(event.detail.type=="minkshowhide"){
		 minkApp.showHidePileHandler(event);
	 }else if(event.detail.type=='minkfavorite'){
		 minkApp.addFavorite(event.detail.url, event.detail.mdname, event.detail.favicon);
	 }else if(event.detail.type=='minksearchstripper'){
		 
		 var pileID = event.srcElement.getAttribute('pileID');
		 var pile =  minkApp.currentQuery.pileMap.get(pileID);
		 pile.cards.pop();
		 pile.HTML.removeChild(pile.HTML.childNodes[0]);
		 var cards = minkApp.buildCards(pile.HTML, event.detail.links.links, true, pile);
		 pile.cards = cards;
		 
		 
		 
		 
		 
		 console.log(event.detail.links);
	 }
	 
}
minkApp.toggleDisplay = function(event){
	if(event.target.style.display != 'none'){
		event.target.style.display = 'none';
	}else{
		event.target.style.display = '';
	}
	event.target.removeEventListener('animationend',minkApp.toggleDisplay )
}
minkApp.formStack = function(secondCard, thirdCard){
	secondCard.style.transform = "translateY(" + (-1/2 * minkApp.COLLAPSED_CARD_HEIGHT + 4) + "px)";
	secondCard.style.zIndex = "3";

	if(thirdCard){
		thirdCard.style.transform = "translate(5px, " + (-1/2 * minkApp.COLLAPSED_CARD_HEIGHT - 8) + "px)";
		thirdCard.style.zIndex = "2";


	}
}
minkApp.minimizePile = function(pile, numberOfCards){
	var oldHeight = pile.clientHeight;
	var newHeight;
	var ph = $(pile).outerHeight();
	var $el = $(pile);
	$el.css('height', ph + 'px');
	newHeight = ((2.5 * minkApp.COLLAPSED_CARD_HEIGHT) + 4);

	$(pile).attr('collapsed', 'true');
	
	
	var speed = ((newHeight - oldHeight)) / (0.25);

//	$(pile).css('height', ph + 'px')
	//every 1/60'th of a second, add, 1/60th of speed to height
	var thisInterval = setInterval(function() {
		var float = parseFloat(pile.style.height.substring(0, (pile.style.height.length-2)));
		float += ((1/60)*speed)
		ph =  float.toString()  + "px";
		$(pile).css('height', ph)
    }, (1/60 * 1000));
	setTimeout(function(){clearInterval(thisInterval);
		pile.style.height = newHeight.toString() + "px";
	}, 250);
	
	

	
		
		
}
minkApp.expandPile = function(pile){
	var cardCount = pile.childNodes.length;
	pile.style.minHeight = "";
	pile.style.marginTop =  '0px';
	$(pile).attr('collapsed', 'false');
	var speed = 0;
	if(cardCount > 3){
		speed = (((cardCount) * 41) - pile.clientHeight) * 2; //pixels per second 
	}else if(cardCount == 3){
		speed = (141-106)/(.5);
	}
	var ph = pile.clientHeight -8;
//	$(pile).css('height', ph + 'px')
	//every 1/60'th of a second, add, 1/60th of speed to height
	var thisInterval = setInterval(function() {
	/*	var float = parseFloat(pile.style.height.substring(0, (pile.style.height.length-2)));
		float += ((1/60)*speed)
		ph =  float.toString()  + "px";*/
		var totalHeight = 0;
		$(pile).children().each(function(){
		    totalHeight = totalHeight + $(this).outerHeight(true) + 8;
		});
		if(totalHeight < pile.clientHeight){
			ph = totalHeight + "px"
		}else{
			ph = pile.clientHeight + "px";

		}
		
		$(pile).css('height', ph)
    }, (1/60 * 1000));
	setTimeout(function(){clearInterval(thisInterval); $(pile).css('height', '')}, 500);

}
minkApp.displayNone = function(event){
	var target = event.target;
	if(!$(target).hasClass('minkCardContainer')){
	 target = $(event.target).closest('.minkCardContainer')[0];
	}
	target.style.display = 'none';
}
minkApp.resumeAnimation = function(event){
	var target = event.target;
	if(!$(target).hasClass('minkCardContainer')){
	 target = $(event.target).closest('.minkCardContainer')[0];
	}
	var mcontainer = $(target).find(".minkContainer")[0];
}
minkApp.showHidePile = function(pile, hide){
	console.log('yeah');
	if(pile.visible || hide){
		pile.visible = false;
		$(pile.HTML.parentNode).removeClass('minkPileWrapperShow');
		$(pile.HTML.parentNode).addClass('minkPileWrapperHide');
		$(pile.rootHTML).attr('expanded', 'false');
		pile.HTML.parentNode.addEventListener('animationend', minkApp.toggleDisplay);


	}else{
		pile.visible = true;
		pile.HTML.parentNode.removeEventListener('animationend', minkApp.toggleDisplay);

		pile.HTML.parentNode.style.display = '';
		$(pile.HTML.parentNode).removeClass('minkPileWrapperHide');
		$(pile.HTML.parentNode).addClass('minkPileWrapperShow');
		$(pile.rootHTML).attr('expanded', 'true');



	}
	
}
minkApp.showHidePileHandler = function(event){
	var rootHTML = $(event.target).closest('.minkExplorableField')[0];
	var url = $(rootHTML).attr('rooturl');
	var collection = $(rootHTML).attr('collectionname');
	var id = pileIDGen(url, collection);
	
	var pile = minkApp.currentQuery.pileMap.get(id);
	minkApp.showHidePile(pile, event.detail.hide);
	
	
}
minkApp.expandCollapsePile = function(event){
	var pile = $(event.currentTarget).closest('.minkPileWrapper')[0];
	pile = $(pile).find('.minkPile')[0];
	var kids = $(pile).children('.minkCardContainer');
	/*
	 * Hide all faceted controls, etc.
	 */
	
	/*
	 * Check for uncollapseable cards, put one in front of stack
	 */
	
	/*
	 * If none are uncollapseable, shrink all cards to snippet form and put behind first card
	 */
	var ogHeight = pile.clientHeight -8;

	for(var i = 0; i < kids.length; i++){
		if($(pile).attr('collapsed')!= 'true'){
			console.log('shrinking')
			var target = $(kids[i]).find(".minkTitleClickable")[0];
			var controls = $(kids[i]).find(".minkCardControls").css('display', 'none');
			
			var contentContainer = $(target).closest('.minkContentContainer')[0];
			if($(contentContainer).attr('grown') == "true"){
				Mink.shrink(target, true);
			}
			kids[i].style.zIndex = kids.length - i;

			if(i>0){
				/*$(kids[i]).removeClass('animatingExpand');
				$(kids[i]).addClass('animatingCollapse');
				kids[i].addEventListener("animationend", minkApp.displayNone, false);*/

				if(i == 1){
					kids[i].style.transform = "translate(0px, " + (-1/2 * minkApp.COLLAPSED_CARD_HEIGHT - (8 * (i)) + 8) + "px)";

				}else if (i < 3 && i > 1){
					kids[i].style.transform = "translate(" + (5*(i-1)) + "px, " + (-1/2 * minkApp.COLLAPSED_CARD_HEIGHT - (8 * (i-1)) - 8) + "px)";

				}
				else{
					kids[i].style.transform = "translateY(" + (-i*20) + "px)";

				}
				if(i > 2){
					kids[i].style.display = 'none';

				}
	
			}else{
				kids[i].style.transform = 'translateX(-5px)';
			}
		}else{
			console.log('expanding')
			var target = $(kids[i]).find(".minkTitleClickable")[0];
			var contentContainer = $(target).closest('.minkContentContainer')[0];
			var controls = $(kids[i]).find(".minkCardControls").css('display', '');

			if($(contentContainer).attr('grown') == "true"){
				Mink.grow(target, true);
			}
			
				kids[i].style.transform = "none";
				kids[i].style.zIndex = '';
				kids[i].style.opacity = '1';
				kids[i].style.display= "";
			
		}
		
	}
	if($(pile).attr('collapsed')!= 'true'){
		minkApp.minimizePile(pile, kids.length, ogHeight);

		//minkApp.formStack(kids[1], kids[2]);
	}else{

		    
		minkApp.expandPile(pile, kids.length);
		
		//First card becomes front by going down to the middle of the pile.
		/*var firstCard = kids[0];
		minkApp.toMiddleOfPile(firstCard, pile);
		minkApp.formStack(kids[1], kids[2]);*/
	}
  
	
	//Two others shrink down to a smaller size
	//a
	
	
}

minkApp.buildDuplicateCount = function(pile){
	var dupCont = buildDiv('minkDupIndicator');
	var dupCount = 0;
	for (var i = 0; i < pile.cards.length; i++){
		if(pile.cards[i].duplicate && !pile.cards[i].displayed){
			dupCount++;
		}
	}
	if(dupCount > 0){
		var txt = dupCount.toString() + " duplicate cards hidden";
		dupCont.innerHTML = txt;

	}
	pile.HTML.appendChild(dupCont);
}
minkApp.updateDuplicateCount = function(pile){
	var dupCont = $(pile.HTML).find('.minkDupIndicator')[0];
	var dupCount = 0;
	var rmCount = 0;
	for (var i = 0; i < pile.cards.length; i++){
		if(pile.cards[i].duplicate && !pile.cards[i].displayed && !pile.cards[i].removed){
			dupCount++;
		}
		if(pile.cards[i].removed){
			rmCount++;
		}
	}
	if(dupCount > 0){
		var txt = dupCount.toString() + " duplicate cards hidden";
		dupCont.innerHTML = txt;
	}else if(rmCount == pile.cards.length){
		dupCont.innerHTML = "all cards removed";
	}else{
		dupCont.innerHTML = "";
	}
	

}


minkApp.contextualize = function(md_and_mmd){
	var ct = $('#contextTitle')[0];
	var unwrapped = BSUtils.unwrap(md_and_mmd.metadata)

	if(ct.innerHTML == '' && minkApp.currentQuery.query  == unwrapped.location){
		ct.innerHTML = unwrapped.title;
		minkApp.currentQuery.contextTitle = unwrapped.title;
	}
}
minkApp.buildCards = function(parent, links, expandCards, pile){
	var cards = [];
	parent.addEventListener('minkloaded', minkApp.addCardToPile);
	//Note, in the future will use yin's structure from google doc. In the meantime, just gonna do it 'the easy way'
	minkApp.counter = links.length;
	//Builds card
	//parent.style.height = (links.length * 39 -2 ).toString() + "px";
	
	var faviconLink = "";
	if(links[(links.length-1)].startsWith("fav::")){
		faviconLink = links.pop();
		faviconLink = faviconLink.substring(5);
	}
	for(var i = 0; i < links.length; i++){
		var link = links[i];
		//Right now I just tell mink to render it with a static message, but I should add loading icons and some kinda queue
		//gonna look through kade's code
		var cardDiv = buildDiv('minkCardContainer');
		cardDiv.addEventListener('mouseenter', minkApp.showCardControls);
		cardDiv.addEventListener('mouseleave', minkApp.hideCardControls);
		minkApp.buildCardControls(cardDiv, link);
		parent.appendChild(cardDiv);
		var spinner = document.createElement('img');
		spinner.src = "./img/loading.gif";
		spinner.className = "minkLoadingSpinner";
		cardDiv.appendChild(spinner);
		cardDiv.setAttribute('minkCardId', link)
		//check to see if there's metadata contained therein{
		if(link.startsWith('mink::')){
			var metadata = Mink.minklinkToMetadataMap.get(link);
			metadata['minkfav'] = faviconLink;
			var clipping = {viewModel: metadata};
			RendererBase.addMetadataDisplay(cardDiv, link, clipping, Mink.render, {expand: true, callback: minkApp.contextualize});

		}else{
			RendererBase.addMetadataDisplay(cardDiv, link, null, Mink.render, {expand: true, callback: minkApp.contextualize});

		}
		
		var card = new minkCard(link, cardDiv, pile);
		cards.push(card);
	}
	return cards;

}


minkApp.buildPile = function(parent, links, rooturl, collectionname, src, expandChildren){
	console.log('links: ');
	console.log(links);
	var wrapper= buildDiv('minkPileWrapper');
	
	if(src){
		var collapseButton = buildDiv('sampleCollapse');
		collapseButton.addEventListener('click', minkApp.expandCollapsePile);
		wrapper.appendChild(collapseButton);
	}
	
	var newPile = buildDiv('minkPile minkPileExpanded');
	parent.appendChild(wrapper);
	
	var pileId = pileIDGen(rooturl, collectionname);
	var parentPile = null;
	if(src){
		var parentPileHTML = $(src).closest('.minkPile')[0];
		parentPile = minkApp.currentQuery.pileMap.get(parentPileHTML.getAttribute('pileid'));
	}
	var pile = new minkPile(pileId, null, src, newPile, parentPile);
	pile.cards = minkApp.buildCards(newPile, links, expandChildren, pile);
	//pile.setAttribute('pileID', pileId);
	wrapper.appendChild(newPile);
	newPile.setAttribute('pileid', pileId);
	minkApp.buildDuplicateCount(pile);
	return pile;
	//Logic to let varius maps and storage representations know about what's going one
	//In thefuture will also need to handle stuff involving the canvas.
}







/*
 * 
 * Everything below here is essentially default bootstrap stuff and remnants of the MICE visualizer
 */



/*
 * NOTE: I'm going to rely on the service, since this is a test of a renderer, not a full app
 */function getParameter(param) {
  var val = document.URL;

  var loc = val.indexOf(param);

  if(loc === -1) {
    return -1;
  } else {
    var url = val.substr(loc);
    var n=url.replace(param+"=","");
    return n;
  }
}
 var reload_md = false;
 
 var mainloop = function() {
     updateGame();
     drawGame();
 };

 var animFrame = window.requestAnimationFrame;

 var recursiveAnim = function() {
     redrawCanvas();
     animFrame( recursiveAnim );
 };

 // start the mainloop
function redrawCanvas(){
	var canvas = document.getElementById('minkAppCanvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	  ctx.canvas.height = document.body.clientHeight;

	var canvasY = canvas.getBoundingClientRect().top;
	var canvasX = canvas.getBoundingClientRect().left;
	if(minkApp.currentQuery){
		for (var i = 0; i < minkApp.currentQuery.pileMap.keys.length; i++){
			var pile = minkApp.currentQuery.pileMap.get( minkApp.currentQuery.pileMap.keys[i]);
			if(pile.rootHTML){
				if (pile.visible && $(pile.rootHTML.closest('.minkColumn')).is(':visible') && $(pile.HTML.closest('.minkColumn')).is(':visible')){
					var rootRect = pile.rootHTML.getBoundingClientRect();
					var rootAttachPointX = rootRect.left + rootRect.width - canvasX;
					var rootAttachPointY = (rootRect.top + rootRect.height / 2) - canvasY;
					
					var pileRect = pile.HTML.getBoundingClientRect();
					var pileTopAttachPointX = pileRect.left - canvasX;
					var pileTopAttachPointY = (pileRect.top) - canvasY;
					
					var pileBotAttachPointX = pileRect.left - canvasX;
					var pileBotAttachPointY = (pileRect.top) + pileRect.height - canvasY;
		
					
					var pathSplitX = rootAttachPointX + 1/2 * (pileTopAttachPointX - rootAttachPointX);
					var pathSplitY = (pileTopAttachPointY + pileRect.height/2);
				
					ctx.beginPath();
					ctx.strokeStyle = '#999999';
					ctx.moveTo(rootAttachPointX, rootAttachPointY);
					ctx.bezierCurveTo((rootAttachPointX + (1/2 * Math.abs(pathSplitX - rootAttachPointX))), rootAttachPointY, pathSplitX - (1/2 * Math.abs((pathSplitX - rootAttachPointX))), pathSplitY, pathSplitX, pathSplitY);
					ctx.stroke();
					
					ctx.beginPath();
					ctx.strokeStyle = '#999999';
					ctx.moveTo(pathSplitX, pathSplitY);
					ctx.bezierCurveTo((pathSplitX + (1/2 * Math.abs(pileTopAttachPointX - pathSplitX))), pathSplitY, pileTopAttachPointX - (1/2 * Math.abs((pileTopAttachPointX - pathSplitX))), pileTopAttachPointY, pileTopAttachPointX, pileTopAttachPointY);
					ctx.stroke();
					
					ctx.beginPath();
					ctx.strokeStyle = '#999999';
					ctx.moveTo(pathSplitX, pathSplitY);
					ctx.bezierCurveTo((pathSplitX + (1/2 * Math.abs((pileBotAttachPointX - pathSplitX)))), pathSplitY, pileBotAttachPointX - (1/2 * Math.abs((pileBotAttachPointX - pathSplitX))), pileBotAttachPointY, pileBotAttachPointX, pileBotAttachPointY);
					ctx.stroke();
		
			}
		}
		}
	}
	
	
	//Find all expanded collections and draw lines to the top and bottom of their piles
}
function onBodyLoad() {
	var minkapp = $("#minkAppContainer")[0];
	//SEMANTIC_SERVICE_URL = "http://128.194.128.84:8080/BigSemanticsService/";
	
	  if (document.URL.indexOf("http://localhost:") > -1 || document.URL.indexOf("file:///") > -1){
		  
		  
			SEMANTIC_SERVICE_URL = "http://localhost:8080/BigSemanticsService/";

	  }
	  else{
		   SEMANTIC_SERVICE_URL = "http://ecology-service.cse.tamu.edu/BigSemanticsService/";

	  }
	var canvas = document.createElement('canvas');
	canvas.className = "minkAppCanvas";
	canvas.width = 1800;
	canvas.height = 1080;
	canvas.id = 'minkAppCanvas';
	animFrame(recursiveAnim);

	
	
	$(minkapp).prepend(canvas);

	RendererBase.idealRenderer = false;
	$(".collapse").collapse();
	minkapp.addEventListener('minkevent', minkApp.minkEventHandler);
	minkApp.initialize(minkapp);
 
  //Try to get passed in parameter url
  var n = getParameter("url");
  if(n == -1) {
    showMetadata();
  } else {
    var linkInput = document.getElementById("targetURL");
    linkInput.value=decodeURIComponent(n);
    showMetadata();
  }
}
function syntaxHighlight(json) {
	  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
	    var cls = 'number';
	    if (/^"/.test(match)) {
	        if (/:$/.test(match)) {
	            cls = 'key';
	        } else {
	            cls = 'string';
	        }
	    } else if (/true|false/.test(match)) {
	        cls = 'boolean';
	    } else if (/null/.test(match)) {
	        cls = 'null';
	    }
	    return '<span class="' + cls + '">' + match + '</span>';
	  });
	}


//Stringify the JSON and make it pretty looking



//Sets the value of the link text box in the linking modal view
function setLinkValue()
{
  var linkInput = document.getElementById("modalLinkValue");
  var targetURL = document.getElementById("targetURL").value;
  var linkURL = document.URL;

  //If a target URL is already included in the document.URL, strip it out
  if(getParameter("url") != -1) {
    var loc = linkURL.indexOf("?url=");
    linkURL = linkURL.substr(0, loc);
  }

  //Append the targetURL for the new link
  linkInput.defaultValue=linkURL + "?url=" + encodeURIComponent(targetURL);
}

function onNewMMD(metametadata) {
  rawMMD = metametadata;
  console.log(metametadata);
}

function onNewMetadata(metadata) {
  rawMetadata = metadata;
  
	console.error("Error: calling onNewMetadata()");
  
  updateJSON(true);

  //Hate this but it's necessary for now... Service does funky redirect stuff when you request MMD with a URL
  var first;
  for(first in metadata)
    break;

  $.ajax({
    url: 'http://ecology-service.cse.tamu.edu/BigSemanticsService/mmd.jsonp',
    jsonp: 'callback',
    dataType: 'jsonp',
    data: { name: first},
    success: onNewMMD
  });

}

function getJSONData (targeturl)
{
	console.error("Error: calling getJSONData()");
	
  $.ajax({
    url: 'http://ecology-service.cse.tamu.edu/BigSemanticsService/metadata.jsonp',
    jsonp: 'callback',
    dataType: 'jsonp',
    data: { url: targeturl},
    success: onNewMetadata
  });
  
}
function toggleReload(){
	reload_md = !reload_md;
}

function onEnterShowMetadata(event)
{
  if(event.keyCode == 13)
    showMetadata(); 
}

function isUrl(string){
	var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(string);
	return valid;
}

function showMetadata(url)
{
	if (url){
		if(isUrl(url)){
			minkApp.exploreURL(url);
		}else{
			minkApp.exploreNewQuery(url);
		}
		
	}else{
		var url = document.getElementById("targetURL").value;
		if(isUrl(url)){
			minkApp.exploreURL(url);
		}else{
			minkApp.exploreNewQuery(url);
		}

	}


}

(function ($) {
    /*
        jquery.slide-transition plug-in

        Requirements:
        -------------
        You'll need to define these two styles to make this work:

        .height-transition {
            -webkit-transition: max-height 0.5s ease-in-out;
            -moz-transition: max-height 0.5s ease-in-out;
            -o-transition: max-height 0.5s ease-in-out;
            transition: max-height 0.5s ease-in-out;
            overflow-y: hidden;            
        }
        .height-transition-hidden {            
            max-height: 0;            
        }

        You need to wrap your actual content that you
        plan to slide up and down into a container. This
        container has to have a class of height-transition
        and optionally height-transition-hidden to initially
        hide the container (collapsed).

        <div id="SlideContainer" 
                class="height-transition height-transition-hidden">
            <div id="Actual">
                Your actual content to slide up or down goes here
            </div>
        </div>

        To call it:
        -----------
        var $sw = $("#SlideWrapper");

        if (!$sw.hasClass("height-transition-hidden"))
            $sw.slideUpTransition();                      
        else 
            $sw.slideDownTransition();
    */
    $.fn.slideUpMinkApp = function() {
        return this.each(function() {
            var $el = $(this);
            $el.css("max-height", "0");
            $el.addClass("height-transition-hidden");
                    
        });
    };

    $.fn.slideUpMinkApp = function() {
        return this.each(function() {
            var $el = $(this);
            $el.removeClass("height-transition-hidden");

            // temporarily make visible to get the size
            $el.css("max-height", "none");
            var height = $el.outerHeight();

            // reset to 0 then animate with small delay
            $el.css("max-height", "0");

            setTimeout(function() {
                $el.css({
                    "max-height": height
                });
            }, 1);
        });
    };
})(jQuery);