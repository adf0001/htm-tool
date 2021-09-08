
/*
	htm tool.
	
	example:

		var ht= require( "htm-tool" );
		console.log( ht.eleId( null, 'myId-' ) );
*/

"use strict";

//////////////////////////////////////////////////////////////////////////////////////////
// global variable

var globalVarName="htm-tool@npm";

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

var formatError= function( text, relatedKey, json ){
	if( typeof relatedKey !== "undefined" ) text+=", "+JSON.stringify(relatedKey);
	if( typeof json !== "undefined" ) text+=", "+JSON.stringify(json);
	return Error(text);
}

/*
	options
		options for MutationObserver.observe().
		
		if it's a string type, then it will be converted to an attribute observer.
		
	callback
		callback( mutationItem )
		
*/
var observeSingleMutation= function( target, options, callback ){
	if( typeof options==="string" ) options= { attributes:true, attributeFilter:[options], attributeOldValue:true };
	
	var mo= new MutationObserver( function(mutationList){ return callback( mutationList[mutationList.length-1] ); } );
	mo.observe(target, options);
	return mo;
}

var getPropertyDescriptor= function( obj, prop /*, _depth*/ ){
	var _depth= ( arguments[2] || 0 ), pd;
	if( !( _depth>=0 && _depth<32 ) ) return null;	//max depth 32, to prevent loop
	
	if( pd= Object.getOwnPropertyDescriptor(obj, prop) ) return pd;		//found
	
	var proto= Object.getPrototypeOf(obj)
	if( !proto || obj===proto ) return null;	//prototype list end
	
	return getPropertyDescriptor( proto, prop, _depth+1 );	//searh in prototype list
}

var mapValue= function( v, valueMapper ){
	if( ! valueMapper ) return v;
	var newV= ( typeof valueMapper==="function" ) ? valueMapper(v) : valueMapper[v];
	return (typeof newV==="undefined") ? v : newV;
}

/*
	encloseOption
		.replaceGetter
			set true to replace forcely the old getter;
			shortcut argument is a boolean value;
*/
var enclosePropertyDescriptor= function( obj, prop, newSetter, newGetter, encloseOption ){
	//arguments
	var replaceGetter;
	var typeofEo= typeof encloseOption;
	
	if( typeofEo==="boolean" ) { replaceGetter=encloseOption; encloseOption=null; }
	else if( encloseOption ){ replaceGetter= encloseOption.replaceGetter; }
	
	//enclose
	var oldDesc= getPropertyDescriptor(obj,prop) || {};
	var newDesc = { configurable: true, enumerable: true };
	
	//setter
	var oldSetter = oldDesc.set;
	if( ! oldSetter ){ if( newSetter ){ newDesc.set = newSetter; } }
	else if( !newSetter ) { newDesc.set = oldSetter; }
	else{
		newDesc.set = function (v) {
			oldSetter.call( this, v );
			newSetter.call( this, v );
		}
	}
	
	//getter
	if (oldDesc.get && !(newGetter && replaceGetter) ) { newDesc.get = oldDesc.get; newGetter= null; }
	else if( newGetter ) { newDesc.get = newGetter; }
	
	//remove old and define new
	if (obj.hasOwnProperty(prop)) delete obj[prop];
	Object.defineProperty(obj, prop, newDesc);
}

var defaultValueFilter= function(v){ return v || v===0 || v===""|| v===false; };

var findWithFilter= function( filter, v /* , v2, ... */ ){
	if( ! filter ) filter= defaultValueFilter;
	
	if( filter(v) ) return v;
	
	var i,imax=arguments.length;
	for(i=2;i<imax;i++){
		v= arguments[i];
		if( filter(v) ) return v;
	}
}

//compatible tool for dispatchEvent()
var dispatchEventByName= function( el, eventName, delay ){
	var evt;
	if( typeof Event==="function" ){ evt= new Event(eventName); }
	else
	{
		evt = document.createEvent('Event');	//ie11
		evt.initEvent(eventName, true, true);
	}
	
	if( delay>=0 ) { setTimeout( function(){ ele(el).dispatchEvent(evt); }, delay ); }
	else{ ele(el).dispatchEvent(evt); }
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
// basic common css

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
	"}",
	"ht-basic-common-css"
);

//css selected tool
var setSelected= function( selectList, unselectList, selected, selectedClass ){
	if( ! selected ) { var tmp=selectList; selectList=unselectList; unselectList=tmp; }	//exchange
	
	if( selectList ){
		if( !(selectList instanceof Array)) selectList=[selectList];
		
		var i,imax= selectList.length;
		for(i=0;i<imax;i++){
			ele( selectList[i] ).classList.add( selectedClass || "ht-selected");
		}
	}
	
	if( unselectList ){
		if( !(unselectList instanceof Array)) unselectList=[unselectList];
		
		var i,imax= unselectList.length;
		for(i=0;i<imax;i++){
			ele( unselectList[i] ).classList.remove( selectedClass || "ht-selected");
		}
	}
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

module.exports= Object.assign(
	ele,
	{
		//global var
		globalVarName: globalVarName,
		
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
		
		formatError: formatError,
		observeSingleMutation: observeSingleMutation,
		getPropertyDescriptor: getPropertyDescriptor,
		enclosePropertyDescriptor: enclosePropertyDescriptor,
		findWithFilter: findWithFilter,
		defaultValueFilter: defaultValueFilter,
		dispatchEventByName: dispatchEventByName,
		mapValue: mapValue,
		
		//xhr
		httpRequest: httpRequest,
		httpRequestJson: httpRequestJson,
		
		//css
		setSelected: setSelected,
		
	}
);

//dom global variable
if( typeof window !== "undefined" && window ){ window[globalVarName]= ele; }

