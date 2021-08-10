
/*
	vanilla js module, or commonJS module.
	
	example:

		<script src='./htm-tool.js' htm-tool-var-name='htm_tool'></script>

		htm_tool.showLog('my message');	//only if the 'htm-tool-var-name' attribute is set to 'htm_tool' in <script>; default global variable is window['htm-tool@npm']
*/

;(function(){

	"use strict";
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// global variable
	
	//default global var
	var defaultVarName="htm-tool@npm";
	if( typeof window !== "undefined" && window && window[defaultVarName] ) return;	//already exists
	
	var defaultVarRef="window['"+defaultVarName+"']";
	
	//user defined global var
	var varName= defaultVarName;
	
	var elScript= document.querySelector("script[htm-tool-var-name]");
	if( elScript ){
		var s= elScript.getAttribute("htm-tool-var-name").replace(/(^\s+|\s+$)/g,"");
		if(s && !s.match(/[\'\"\\\/]/) ) varName= s;
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// public tool
	
	var ele= function(idOrEl){ return ( typeof idOrEl==="string")? document.getElementById(idOrEl) : idOrEl;}
	var eleFromId= function(id){ return document.getElementById(id);}
	
	var seed=0;
	
	var eleId= function (el, prefix) {
		if ( el && el.id) return el.id;
		if (!prefix) prefix = "ht-id-";

		var sid;
		while (document.getElementById(sid = prefix + (++seed))) { };

		return el?(el.id = sid): sid;
	}
	
	//----------------------------------------------------------------------------------------
	
	var eleSibling= function(el,offset){
		var m= el.id.match( /^(\D+)(\d+)$/ );
		return eleFromId( m[1]+ (parseInt( m[2] )+ offset ));
	}

	var dateString19= function (dt) {
		if( !dt ) dt= new Date();
		
		var s = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() +
			" " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
		return s.replace(/\b(\d)\b/g, "0$1");
	}

	var dateString14= function (dt) {
		return dateString19(dt).replace(/\D+/g, "");
	}

	var dateDiffStr= function ( startTime, endTime, abbr ){
		var n= endTime - startTime;		//milliseconds
		
		var sign=(n<0)?"-":"";
		if( sign ) n=-n;
		
		n= Math.round(n/1000/60);	//minutes
		var minutes= n%60;
		n= (n-minutes)/60;	//hours
		var hours= n%24;
		n= (n-hours)/24;	//days
		var days= n;
		
		return abbr?
			sign + (days?(days + 'd '):"") + (hours?(hours + 'h '):"") + minutes + 'm'
			:
			sign + (days?(days + '天'):"") + (hours?(hours + '时'):"") + minutes + '分';
	}
	
	//if the element by `styleId` already exists, its cssText will be fully replaced.
	var addCssText= function ( cssText, styleId ) {
		var style;
		if( styleId && ( style= ele(styleId) ) ){
			if( style.tagName.toUpperCase() !="STYLE" ) return;	//fail
			
			style.textContent= cssText;
		}
		else{
			style= document.createElement("style");
			style.type = "text/css";
			if( styleId ) style.id= styleId;
			
			try {
				style.appendChild(document.createTextNode(cssText));
			}
			catch (ex) {
				style.styleSheet.cssText = cssText;
			}
			document.getElementsByTagName("head")[0].appendChild(style);
		}
	}
	
	//return the first inserted element
	var appendHtml= function( parentNode, htmlText ){
		parentNode= ele( parentNode);
		var lastChild= parentNode.lastChild;
		
		parentNode.insertAdjacentHTML( 'beforeend', htmlText );
		return lastChild?lastChild.nextSibling:parentNode.firstChild;
	}
	
	var appendBodyHtml= function( htmlText ){ return appendHtml( document.body, htmlText ); }
	
	//return the first inserted element
	var prependHtml= function( parentNode, htmlText ){
		parentNode= ele( parentNode);
		parentNode.insertAdjacentHTML( 'afterbegin', htmlText );
		return parentNode.firstChild;
	}
	
	var querySelectorByAttr= function( el, head, attrName, attrValue, tail ){
		return ele(el).querySelector( (head||"")+"["+attrName+(( typeof attrValue!=="undefined" && attrValue!==null )?("='"+ (""+attrValue).replace(/(\<\>\'\"\:)/g,"\\$1")+"'"):"")+"]"+(tail||""));
	}
	
	/*
		namePath:
			array
				name string array;
			string
				name string list separated only by "." ( in priority );
				or name string list separated only by whitespace.
		strict:
			false
				it may have other names from `el` to the end of the name path;
			true
				it shouldn't have any other name from `el` to the end of the name path;
			undefined
				if `namePath` contain '.' then set strict to true, otherwise set to false.
	*/
	var queryByName= function( el, namePath, strict ){
		if( typeof namePath==="string" ){
			if( namePath.indexOf(".")>=0 ){
				if( typeof strict==="undefined" ) strict= true;
				namePath= namePath.replace(/^\./,"").split( "." );
			}
			else{
				namePath= namePath.split( /\s+/ );
			}
		}
		
		var i, imax= namePath.length, sa=[];
		for(i=0;i<imax;i++){
			sa[sa.length]= "[name='"+ namePath[i].replace(/(\<\>\'\"\:)/g,"\\$1")+"']";
		}
		
		el= ele(el);
		if( ! strict ) return el.querySelector( sa.join(" ") );
		
		// strict mode
		
		var elList= el.querySelectorAll( sa.join(" ") );
		var j,jmax= elList.length, eli;
		for(j=0;j<jmax;j++){
			//check name path
			eli= elList[j].parentNode;
			for(i=imax-2;i>=0;i--){
				while( !eli.hasAttribute("name") ){ eli= eli.parentNode; }
				if( eli.getAttribute("name")!= namePath[i] ) break;	//not match
				eli= eli.parentNode;
			}
			if(i>=0) continue;	//not match, check next
			
			//check to root
			while( 1 ){
				if( eli===el ) return elList[j];	//matched and return
				if( eli.hasAttribute("name") ) break;	//not match
				eli= eli.parentNode;
			}
		}
		return null;
	}
	
	//getSearchPart= function( name [, searchString] )
	var getSearchPart= function( name, searchString ){
		if( !searchString ) searchString= window.location.search;
		
		if( typeof URLSearchParams ==="function" ) return (new URLSearchParams(searchString)).get(name);
		
		var mr= searchString.match( new RegExp( "(^|\\?|\\&)" + name + "\\=([^\\&]*)($|\\&)" ) );
		return mr && mr[2];
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// xhr
	
	/*
		cb
			function( error:{ error, status, responseText, lastKey}, data:{responseText, lastKey} )
		
		methodOrOptions
			method: "POST"/"GET"/...
			options: { method:... , headers: {} }
	*/
	var httpRequest= function( url, methodOrOptions, postData, cb, lastKey ){
		var options = (typeof methodOrOptions==="string")?  { method: methodOrOptions, } : methodOrOptions ;

		var xq = new XMLHttpRequest();
		
		xq.open( options.method, url, true);
		if( options.headers ){
			for( var i in options.headers ){ xq.setRequestHeader( i, options.headers[i] ); }
		}
		else if( options.method=="POST" && postData ){
			xq.setRequestHeader("CONTENT-TYPE", postData.match(/^\s*[\{\[]/)? "application/json": "application/x-www-form-urlencoded" );
		}
		
		xq.onreadystatechange = function(){
	        if (xq.readyState == 4){
	        	if( xq.status==200) {
					if( cb ) cb ( null, { responseText: xq.responseText, lastKey: lastKey} );
				}
				else {
					if( cb ) cb ( { error: "status", status: xq.status, responseText: xq.responseText, lastKey: lastKey} );
				}
	        }
	    }
		
		xq.send(postData);
	}

	/*
		cb
			function( error:{ error, status, responseText, lastKey}, data:{json,responseText, lastKey} )
	*/
	var httpRequestJson= function( url, methodOrOptions, postData, cb, lastKey ){
		httpRequest(url, methodOrOptions, postData, function( error, data ){
			if( error ){ if( cb ) cb(error,data); return; }
			
			try{
				data.json= JSON.parse(data.responseText);
			}
			catch(ex){
				console.log(ex);
				data.json= null;
			}
			if(cb) cb(error,data);
		}, lastKey);
	}

	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// common css
	
		example:
			<span class='ht-cmd' onclick="...">add</span>
	*/
	
	addCssText(
		".ht-cmd {"+
			"color: green;"+
			"text-decoration: underline;"+
			"cursor: pointer;"+
			"font-size: 9pt;"+
		"}"+
		".ht-cmd:hover{"+
			"background:#eeeeee;"+
		"}"+
		".ht-hover:hover{"+
			"background:#eeeeee;"+
		"}"+
		".ht-selected{"+
			"background:lavender;"+
		"}"+
		".ht-selected:hover{"+
			"background:#F0F0FA;"+
		"}"+
		""
	);
	
	//.ht-selected tool
	var setSelected= function( selectList, unselectList, selected ){
		if( ! selected ) { var tmp=selectList; selectList=unselectList; unselectList=tmp; }	//exchange
		
		if( selectList ){
			if( !(selectList instanceof Array)) selectList=[selectList];
			
			var i,imax= selectList.length,si;
			for(i=0;i<imax;i++){
				si= selectList[i];
				si= ele(si);
				if( !si.className.match(/(^|\s)ht-selected(\s|$)/ ) ) si.className+=" ht-selected";
			}
		}
		
		if( unselectList ){
			if( !(unselectList instanceof Array)) unselectList=[unselectList];
			
			var i,imax= unselectList.length,si;
			for(i=0;i<imax;i++){
				si= unselectList[i];
				si= ele(si);
				if( si.className.match(/(^|\s)ht-selected(\s|$)/ ) ) si.className= si.className.replace(/(^|\s)ht-selected(\s|$)/g,"$1$2");
			}
		}
	}

	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// tab control
	
		example:

			<div class='ht-tab-group'>
				<span class='ht-tab-item ht-tab-item-selected' id='spTab1' onclick="htm_tool.selectTabItem('top','spTab1','divTab1')">Tab1</span>
				<span class='ht-tab-item' id='spTab2' onclick="htm_tool.selectTabItem('top','spTab2','divTab2')">Tab2</span>
			</div>
			<div id='divTab1'><b>tab1 content</b></div>
			<div id='divTab2' style='display:none;'><i>tab2 content</i></div>

			//init tab state
			htm_tool('spTab1').click();
	*/
	
	var tabGroup= null;	//map group name to [idTab,idPanel]

	var selectTabItem= function ( group, idTab, idPanel ){
		
		//init
		if( ! tabGroup ){
			tabGroup={};
			
			addCssText(
				".ht-tab-group{"+
					"border-bottom:1px solid black;"+
					"margin-bottom:0.5em;"+
				"}"+
				".ht-tab-item{"+
					"display:inline-block;"+
					"padding:0.2em 0.5em;"+
					"margin-left:0.5em;"+
					"position:relative;"+
					"left:0px;"+
					"top:0px;"+
					"background:#eee;"+
					"cursor:pointer;"+
					"border-left:1px solid #eee;"+
					"border-top:0px solid #eee;"+
					"border-right:1px solid #eee;"+
				"}"+
				".ht-tab-item-selected{"+
					"background:white;"+
					"top:1px;"+
					"cursor:default;"+
					"border-left:1px solid black;"+
					"border-top:1px solid black;"+
					"border-right:1px solid black;"+
				"}"
			);
		}
		
		//----------------------------------------------------------------------------------------
		
		var lastTabItem= tabGroup[group];
		if( !lastTabItem ){
			lastTabItem= tabGroup[group]= ["",""];
		}
		
		if( lastTabItem[0]==idTab && lastTabItem[1]==idPanel ) return;
		
		var el;
		//hide last
		if( lastTabItem[0] ){
			el= eleFromId(lastTabItem[0]);
			el.className= el.className.replace(/ht\-tab\-item\-selected/g,"").replace(/\s+/g," " );
		}
		if( lastTabItem[1] ){
			eleFromId(lastTabItem[1]).style.display="none";
		}
		
		//show selected
		el= eleFromId(idTab);
		el.className= (el.className+" ht-tab-item-selected").replace(/\s+/g," " );
		if( idPanel ) eleFromId(idPanel).style.display="";
		
		lastTabItem[0]= idTab;
		lastTabItem[1]= idPanel;
	}
	
	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// log control
	
		example:
			
			htm_tool.showLog("some log message");
	*/

	var tmidLog= null;	//log timer id
	var elidLog= null;	//element id
	
	var showLog= function( s ){
		
		//init
		var elLog= eleFromId(elidLog);
		if( ! elLog ){
			elLog= appendBodyHtml(
				"<div style='position:fixed;right:0.5em;bottom:0.5em;width:auto;height:auto;max-width:500px;background:white;border:1px solid gray;font-size:9pt;padding:0.5em;cursor:default;' onclick=\""+defaultVarRef+".showLog();\">"+
					"<span name='close' class='ht-cmd' style='float:right;text-decoration:none;padding:0em 0.3em;' onclick=\"setTimeout( function(){ "+defaultVarRef+".showLog(false);}, 0 );\" title='关闭'>&times;</span>"+
					"<span name='minimize' class='ht-cmd' style='display:none;float:right;text-decoration:none;padding:0em 0.3em;' onclick=\"setTimeout( function(){ "+defaultVarRef+".showLog(null);}, 0 );\" title='最小化'>&minus;</span>"+
					"<b>日志</b>"+
					"<div name='content' style='display:none;'></div>"+
				"</div>"
			);
			elidLog= eleId(elLog);
		}
		
		//----------------------------------------------------------------------------------------
		
		var el= queryByName(elLog,'content');
		var elMinimize= queryByName(elLog,'minimize');
		var elClose= queryByName(elLog,'close');
		
		elLog.style.display="";
		
		if( s ){
			while(el.childNodes.length>=10){
				el.removeChild(el.firstChild);
			}
			
			var tms= dateString19();
			el.innerHTML+="<div>* <span class='ht-cmd' onclick=\"this.textContent=this.title;this.style.color='green';this.onclick=this.className=this.title='';\" title='"+tms+"'>" + tms.slice(-8) + "</span> " + s + "</div>";
			el.style.display= elMinimize.style.display= elClose.style.display= "";
		}
		else{
			if( s===null || s===false ){ el.style.display= elMinimize.style.display= elClose.style.display= "none"; if(s===false) elLog.style.display= "none"; }
			else if( el.style.display=="none" && el.childNodes.length>0 ){ el.style.display= elMinimize.style.display= elClose.style.display= ""; }
		}
		
		if( el.style.display!="none" ){
			if( tmidLog ) { clearTimeout(tmidLog); tmidLog=null; }
			tmidLog=setTimeout( function(){ el.style.display= elMinimize.style.display= elClose.style.display= "none"; tmidLog= null; }, 5000 );
		}
	}
	
	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// drag tool, support mouse and multiple touches.
	
		example:
			
			<div onmousedown="htm_tool.startDrag( arguments[0], this )" ontouchstart="htm_tool.startDrag( arguments[0], this )">...</div>
	*/
	
	var dragObject= {
		
		dragSet: null,	//map drag start-key to drag start item; drag item: {itemArray,pageX0,pageY0,from,elStart,key}
		dragSetCount: 0,
		
		init: function(){		//manually called constructor
			this.dragSet= {};
			this.dragSetCount= 0;
			this._onMove= this._onStop= this._onKey= null;		//clear binding from prototype
			
			//this.startDrag= this.start.bind(this);		//binding function for start()		//not usually, cancelled.
		},
		
		//start: function ( evt, el1, el2, ..., elN )
		start: function ( evt, el1) {
			if (arguments.length < 2) return false;
			if( !evt ) evt= window.event;
			
			//check if target is an input
			if( evt.target.tagName.match( /^(input|button|textarea|select|option.*|a|label)$/i ) || (evt.target.className && evt.target.className.match("(ht-input|ht-cmd)(\s|$)") ) ){
				return false;
			}
			
			//unify event and drag-data
			var dragEvt, dragItem, evtKey;
			if( evt.type=="mousedown" ){
				dragEvt= evt;
				dragItem= { from:"mouse", elStart: evt.target, key:"mouse", };
				
				if ("mouse" in this.dragSet) this.onStop({type:"mouseup"});
			}
			else if( evt.type=="touchstart" ){
				dragEvt= evt.targetTouches[0];	//only the 1st
				evtKey= "touch-"+dragEvt.identifier;
				dragItem= { from:"touch", elStart: evt.target, key: evtKey, };
				
				if ( evtKey in this.dragSet) this.onStop({type:"touchend",changedTouches:[{identifier:dragEvt.identifier}]});
			}
			else{ return false; }	//unknown event
			
			//init drag-data
			dragItem.pageX0 = dragEvt.pageX;
			dragItem.pageY0 = dragEvt.pageY;
			
			dragItem.itemArray = [];
			var i, imax = arguments.length, el;
			for (i = 1; i < imax; i++) {
				el = arguments[i];
				dragItem.itemArray.push([el, parseInt(el.style.left)||0, parseInt(el.style.top)||0]);
			}
			
			this.dragSet[dragItem.key]= dragItem;
			this.dragSetCount++;

			if( this.dragSetCount===1 ){
				//global listener
				document.addEventListener("mousemove", this._onMove || (this._onMove=this.onMove.bind(this)), false);
				document.addEventListener("mouseup", this._onStop || (this._onStop=this.onStop.bind(this)), false);
				document.addEventListener("keyup", this._onKey || (this._onKey=this.onKey.bind(this)), false);
				document.addEventListener('touchmove',this._onMove,{passive:false});
				document.addEventListener('touchend',this._onStop,false);
			}
		},
		
		//return pairs array of [ evt1, dragItem1, evt2, dragItem2, ... ]
		getEventList: function( evt ){
			var list=[];
			var keyType= evt.type.slice(0,5);
			
			if( keyType=="mouse" ){
				list.push( evt, this.dragSet["mouse"] );
			}
			else if( keyType=="touch" ){
				var touchList= (evt.type=="touchend") ? evt.changedTouches : evt.targetTouches;
				var i,imax= touchList.length,k;
				for(i=0;i<imax;i++){
					k= "touch-" + touchList[i].identifier;
					if(k in this.dragSet) list.push( touchList[i], this.dragSet[k] );
				}
			}
			else{ return null; }	//unknown event
			
			return (list.length>0)?list:null;
		},
		
		onStop: function ( evt ) {
			//reset all
			if( evt===false ){
				for( var i in this.dragSet ){
					var dragItem= this.dragSet[i];
					var j,jmax=dragItem.itemArray.length,ai;
					for(j=0;j<jmax;j++){
						ai = dragItem.itemArray[j];
						ai[0].style.left = ai[1] + "px";
						ai[0].style.top = ai[2] + "px";
					}
				}
			}
			
			if( evt ){
				var list= this.getEventList( evt );
				if( !list ) return false;
				
				var i,imax= list.length,dragItem;
				for(i=0;i<imax;i+=2){
					dragItem= list[i+1];
					if( dragItem.key in this.dragSet ){
						delete this.dragSet[dragItem.key];
						this.dragSetCount--;
					}
				}
			}
			else{
				//stop all
				this.dragSet={};
				this.dragSetCount=0;
			}
			
			if( this.dragSetCount<1 ){
				//remove global listener
				//console.log("release drag listener");
				document.removeEventListener("mousemove", this._onMove, false);
				document.removeEventListener("mouseup", this._onStop, false);
				document.removeEventListener("keyup", this._onKey, false);
				document.removeEventListener('touchmove',this._onMove,{passive:false});
				document.removeEventListener('touchend',this._onStop,false);
			}
			
			if( this.dragSetCount<0 ){
				console.error("dragSetCount abnormal, "+ this.dragSetCount);
				this.onStop(false);	//stop all
				this.dragSetCount=0;
			}
		},
		
		onMove: function (evt) {
			var list= this.getEventList( evt );
			if( !list ) return false;
			
			var i,imax= list.length,dragItem;
			for(i=0;i<imax;i+=2){
				dragItem= list[i+1];
				
				var dx = list[i].pageX - dragItem.pageX0;
				var dy = list[i].pageY - dragItem.pageY0;
				
				var j, jmax = dragItem.itemArray.length, ai;
				for (j = 0; j < jmax; j++) {
					ai = dragItem.itemArray[j];
					ai[0].style.left = (ai[1] + dx) + "px";
					ai[0].style.top = (ai[2] + dy) + "px";
				}
			}
			
			if( evt.type=="touchmove" ){ evt.preventDefault(); }
		},
		
		onKey: function (evt) {
			var keyCode= evt.keyCode||evt.which||evt.charCode;
			
			if (keyCode==27){ this.onStop( false ); }		//ESC to reset
			else{ this.onStop(); }		//others to stop
		},
		
	};
	
	dragObject.init();
	
	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// popup panel tool
	
		example:
			<div id='divPopup1' class='ht-popup' style='display:none;'>
				<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this )' ontouchstart='htm_tool.startDrag( arguments[0], this )'>
					popup-1<hr>This is popup-1.
				</div>
			</div>
			
			htm_tool.showPopup('divPopup1');
	*/
	
	var popupStack= null;	//item: [el, cb ]
	
	var showPopup= function( el, modal, cb ){
		
		//init
		if( ! popupStack ) {
			popupStack= [];
			
			addCssText(
				".ht-popup{"+
					"position:fixed;"+
					"left:0px;"+
					"top:0px;"+
					"right:0px;"+
					"bottom:0px;"+
					"text-align:center;"+
				"}"+
				".ht-popup-back{"+
					"position:absolute;"+
					"left:0px;"+
					"top:0px;"+
					"right:0px;"+
					"bottom:0px;"+
					"background:#eee;"+
					"opacity:0.5;"+
				"}"+
				".ht-popup-body{"+
					"display:inline-block;"+
					"position:relative;"+
					"margin-top:10%;"+
					"background:white;"+
					"border:1px solid gray;"+
					"border-radius:1em;"+
					"padding:0.5em;"+
					"box-shadow:0 0 30px gray;"+
					"text-align:left;"+
				"}"+
				".ht-popup-modal{"+
					"border-radius:0px;"+
				"}"
			);

		}
		
		//----------------------------------------------------------------------------------------
		
		el= ele(el);
		
		//check closed
		while( popupStack.length>0 ){
			if( popupStack[popupStack.length-1][0].style.display=="none") popupStack.pop();
			else break;
		}
		
		//don't re-open
		var i,imax=popupStack.length;
		for(i=0;i<imax;i++) {
			if( popupStack[i][0]===el ) {
				console.error("fail to re-open popup, " + (el.id||""));
				return;
			}
		}
		
		//check body
		var elBody= el.querySelector(".ht-popup-body");
		if( ! elBody ){
			console.error("popup-body unfound, " + (el.id||""));
			return;
		}
		
		//add back
		if( ! el.querySelector(".ht-popup-back") ){
			prependHtml( el, "<div class='ht-popup-back' onclick=\"if(this.parentNode.querySelector('.ht-popup-body').className.indexOf('ht-popup-modal')<0)"+defaultVarRef+".hidePopup(this);\"></div>" );
		}
		
		//add close button
		var elClose= elBody.querySelector("span[name='ht-popup-close']");
		if( !elClose ){
			elClose= prependHtml( elBody, "<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' class='ht-cmd' onclick=\""+defaultVarRef+".hidePopup(this);\" title='关闭'>x</span>" );
		}
		
		//modal setting
		if( modal ){
			if( elBody.className.indexOf("ht-popup-modal")<0 ){ elBody.className += " ht-popup-modal"; }
			elClose.innerHTML="[&times;]";
		}
		else{
			if( elBody.className.indexOf("ht-popup-modal")>=0 ){ elBody.className = elBody.className.replace("ht-popup-modal",""); }
			elClose.innerHTML="(&times;)";
		}
		
		el.style.display="";
		
		el.style.zIndex= 10+ popupStack.length;
		
		popupStack.push([el,cb]);
	}
	
	var hidePopup= function( el, data ){
		el= ele(el);
		
		//find .ht-popup
		while( el && (! el.className || ! el.className.match(/ht-popup(\s|$)/) ) ) { el=el.parentNode; }
		if( !el ){
			console.error( "top ht-popup unfound" );
			return;
		}
		
		var i,psi;
		for(i= popupStack.length-1; i>=0;i-- ){
			psi= popupStack[i];
			if( el===psi[0] ){
				el.style.display="none";
				popupStack.pop();
				if( psi[1] ) psi[1](null, data);
				return;
			}
			
			if( psi[0].style.display=="none"){
				popupStack.pop();
				continue;
			}
			
			break;	//fail
		}
		
		if( !popupStack.length ) return;
		
 		//abnormal popup, close all.
 		console.error( "abnormal popup, close all." );
 		while( popupStack.length>0 ){
			popupStack.pop()[0].style.display="none";
		}
	}
	
	var POPUP_HTML_COUNT_MAX= 10;
	
	var showPopupHtml= function( bodyHtml, modal, cb ){
		
		//find empty html
		var i,nm,el;
		for(i=1;i<=POPUP_HTML_COUNT_MAX;i++){
			nm= "ht-popup-html-" + i;
			el= eleFromId(nm);
			if( !el ) break;
			if( el.style.display=="none" ) break;
		}
		
		if(i>POPUP_HTML_COUNT_MAX ) {
			console.error( "popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX );
			return;
		}
		
		//init
		if( ! eleFromId(nm) ){
			appendBodyHtml(
				"<div id='"+nm+"' class='ht-popup' style='display:none;'>"+
					"<div class='ht-popup-body' onmousedown=\""+defaultVarRef+".startDrag( arguments[0], this )\" ontouchstart=\""+defaultVarRef+".startDrag( arguments[0], this )\"></div>"+
				"</div>"
			);
		}
		var elBody= eleFromId(nm).querySelector(".ht-popup-body");
		elBody.innerHTML= bodyHtml;
		
		showPopup( nm, (typeof modal==="undefined")?1:modal, cb );
	}
	
	var alert= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+defaultVarRef+".hidePopup(this)\">确定</button></span>",modal, cb );
	}
	var confirm= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+defaultVarRef+".hidePopup(this,'ok')\">确定</button> <button onclick=\""+defaultVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
	}
	var confirmYnc= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+defaultVarRef+".hidePopup(this,'yes')\">是</button> <button onclick=\""+defaultVarRef+".hidePopup(this,'no')\">否</button> <button onclick=\""+defaultVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
	}
	var prompt= function( message, defaultValue, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<br><input type='text' style='width:100%;'></input></div><br><span style='float:right'><button onclick=\""+defaultVarRef+".hidePopup(this,this.parentNode.parentNode.querySelector('input').value);\">确定</button> <button onclick=\""+defaultVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
		if(defaultValue) popupStack[popupStack.length-1][0].querySelector('input').value= defaultValue;
	}
	var selectRadioList= function( message, itemList, defaultValue, modal, cb ){
		var nm= "ht-select-radio="+(++seed);
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' value='' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((v[0]===defaultValue)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='radio' name='"+nm+"' value='"+v[0]+"'"+((v[0]===defaultValue)?" checked":"")+" onchange=\"if(!this.checked)return; var oldv= this.parentNode.parentNode.getAttribute('value'); var oldel="+defaultVarRef+".querySelectorByAttr(this.parentNode.parentNode,'input','value',oldv); "+defaultVarRef+".setSelected(this.parentNode,oldel && oldel.parentNode,true);this.parentNode.parentNode.setAttribute('value',this.value)\"></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\""+defaultVarRef+".hidePopup(this,this.parentNode.parentNode.querySelector('input:checked').value);\">确定</button> <button onclick=\""+defaultVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
		if(defaultValue) popupStack[popupStack.length-1][0].querySelector('div.ht-input').setAttribute("value", defaultValue);
	}
	var selectCheckboxList= function( message, itemList, defaultValueList, modal, cb ){
		if( ! defaultValueList || typeof defaultValueList=="string" ) defaultValueList=[defaultValueList];
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((defaultValueList.indexOf(v[0])>=0)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='checkbox' value='"+v[0]+"'"+((defaultValueList.indexOf(v[0])>=0)?" checked":"")+" onchange=\""+defaultVarRef+".setSelected(this.parentNode,null,this.checked)\"></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\"var items=this.parentNode.parentNode.querySelectorAll('input:checked');var a=[];for(i=0;i<items.length;i++){a[i]=items[i].value;};"+defaultVarRef+".hidePopup(this,a);\">确定</button> <button onclick=\""+defaultVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// polyfill
	
	//Object.assign()
	if( ! Object.assign ){
		Object.assign= function( target, varArgs ){
			if (target === null || target === undefined) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);
			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];
				if (nextSource !== null && nextSource !== undefined) {
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		}
	}
	
	var deriveObject= function( proto, properties /*, properties2, ...*/ ){
		return Object.assign.apply( Object, [Object.create( proto )].concat( Array.prototype.slice.call( arguments, 1 ) ) );
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// export module
	
	var htm_tool= ele;
	Object.assign( htm_tool,
		{
			//global var
			varName: varName,
			
			//element and id
			ele: ele,
			eleFromId: eleFromId,
			eleId: eleId,
			
			//tools
			eleSibling: eleSibling,
			
			dateString19: dateString19,
			dateString14: dateString14,
			dateDiffStr: dateDiffStr,
			
			addCssText: addCssText,
			
			appendHtml: appendHtml,
			appendBodyHtml: appendBodyHtml,
			prependHtml: prependHtml,
			
			querySelectorByAttr: querySelectorByAttr,
			queryByName: queryByName,
			getSearchPart: getSearchPart,
			
			deriveObject: deriveObject,
			
			//xhr
			httpRequest: httpRequest,
			httpRequestJson: httpRequestJson,
			
			//css
			setSelected: setSelected,
			
			//ui
			selectTabItem: selectTabItem,
			showLog: showLog,
			//startDrag: dragObject.startDrag,
			startDrag: dragObject.start.bind(dragObject),
			showPopup: showPopup,
			hidePopup: hidePopup,
			showPopupHtml: showPopupHtml,
			alert: alert,
			confirm: confirm,
			confirmYnc: confirmYnc,
			prompt: prompt,
			selectRadioList: selectRadioList,
			selectCheckboxList: selectCheckboxList,
			
			//object
			dragObject: dragObject,
			
			//extend name-space
			ns: {},
			
		}
	);
	
	//commonJS module
	if ( typeof module === "object" && module && typeof module.exports === "object" ) { module.exports = htm_tool; }

	//dom module
	if( typeof window !== "undefined" && window ){
		window[defaultVarName]= htm_tool;
		if(varName!==defaultVarName) window[varName]= htm_tool;
	}

})();

