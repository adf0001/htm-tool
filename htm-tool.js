
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
// bind element & bind by name

/*
	bind item:
		an array to configure element binding,
		[ "namePath", "type", typeOption, member, memberOption ]	//basic format
		where type and typeOption is related to dom object, while member and memberOption is related to js object.
		
		or
		[ "namePath", "type", typeOption | "typeItem", member, memberOption | .biDirection/0x1 | ".notifyEvent" | .watchJs/0x2 ]	//shortcut format
		
			"namePath"
				name path string, refer to queryByName()
			
			"type"
				dom type string
			
			typeOption
				dom type option
				
				".typeItem"
					dom type sub-item string;
					shortcut argument is a string;
				
				.valueMapper
					a value mapper for setting dom item, refer to mapValue().
			
			member
				js member
					"propertyName" | "methodName" | function;
			
			memberOption
				js member option
				
				.biDirection
					set true to bind both from js to dom and from dom to js;
					if not set, bind in default way;
					shortcut argument is a boolean value, or a number value contain 0x1;
					
				.notifyEvent
					set name string of bi-direction notify event ( will automatically set biDirection=true );
					if not set, use default event "change";
					shortcut argument is a string;
				
				.watchJs
					if set true, for type "prop", watch dom property change from js ( will automatically set biDirection=true ).
					shortcut argument is a number value contain 0x2;
				
				.valueMapper
					a value mapper for setting js member, refer to mapValue().
				
		type format:
			
			"on":
				event binding by setting GlobalEventHandlers[ "on" + typeItem ],
				
					[ "namePath", "on", "click", "methodName" | function, extraArgument ]
			
			"event|evt":
				event binding by addEventListener()
				
					[ "namePath", "event|evt", "click", "methodName" | function, extraArgument={ listenerOptions } ]
			
			"attr":
				attribute binding,
				
					[ "namePath", "attr", "title", "propertyName", extraArgument={ biDirection } ]
					[ "namePath", "attr", "title", "methodName" | function, extraArgument ]		//refer to MutationRecord
			
			"style|css":
				style binding
				
					[ "namePath", "style", "display", "propertyName", extraArgument={ biDirection } ]
					[ "namePath", "style", "display", "methodName" | function, extraArgument ]		//will also evoke on any other style change; refer to MutationRecord; 
			
			"class":
				element class binding. default binding member is boolean type.
				
					[ "namePath", "class", "myClass", "propertyName", extraArgument={ biDirection } ]
					[ "namePath", "class", "myClass", "methodName" | function, extraArgument ]		//will also evoke on any other class change; refer to MutationRecord;
			
			"prop":
				property binding,
				
					[ "namePath", "prop", "value", "propertyName", extraArgument={ notifyEvent, biDirection, watchJs } ]
					[ "namePath", "prop", "value", "methodName" | function, extraArgument={ notifyEvent, watchJs, listenerOptions } ]
*/

//bind-item index constant
var BI_NAME_PATH=	0,
	BI_TYPE=		1,
	BI_TYPE_OPTION=	2,
	BI_MEMBER=		3,
	BI_MEMBER_OPTION=	4;

//return Error if fail
var bindElement= function( el, obj, bindItem ){
	
	//-------------------------------------
	//arguments
	
	var elId= eleId(el);
	
	//type
	var type= bindItem[BI_TYPE];
	
	//typeItem, typeOption
	var typeOption= bindItem[BI_TYPE_OPTION], typeItem, domValueMapper;
	if( typeof typeOption==="string" ){ typeItem= typeOption; typeOption= null; }
	else {
		typeItem= typeOption.typeItem;
		domValueMapper= typeOption.valueMapper;
	}
	
	if( !typeItem ) return formatError("bind typeItem empty", bindItem );
	
	//member
	var member= bindItem[BI_MEMBER];
	
	var memberValue;
	if( typeof member==="function" ){ memberValue= member; }
	else if( member in obj ) { memberValue= obj[member]; }
	else return formatError("member unfound", member, bindItem );
	
	var memberIsFunction= ( typeof memberValue==="function" );
	var memberThis= (!memberIsFunction || (memberValue!==member) ) ? obj : null;
	
	//memberOption
	var memberOption= bindItem[BI_MEMBER_OPTION], biDirection, notifyEvent,watchJs,jsValueMapper;
	var typeofMo= typeof memberOption;
	
	if( typeofMo==="boolean" ) { biDirection= memberOption; memberOption= null; }
	else if( typeofMo==="number" ){
		biDirection= memberOption & 0x1;
		watchJs= memberOption & 0x2;
		memberOption= null;
	}
	else if( typeofMo==="string" ){
		if( memberOption ) { notifyEvent= memberOption; memberOption= null; }
	}
	else if(memberOption){
		notifyEvent= memberOption.notifyEvent;
		biDirection= notifyEvent || memberOption.biDirection;
		watchJs= memberOption.watchJs;
		jsValueMapper= memberOption.valueMapper;
	}
	if( ! biDirection && (notifyEvent || watchJs) ) biDirection=true;
	
	//-------------------------------------
	//bind event
	if( type=="on" || type=="event" || type=="evt" ){
		if( !memberIsFunction ) return formatError("bind member is not a function", member, bindItem );
		
		var bindFunc= function(evt){ return memberValue.apply( memberThis || this, [ evt, memberOption]); };
		
		if( type=="on" ){ el["on"+typeItem]= bindFunc; }
		else{ el.addEventListener( typeItem, bindFunc, memberOption && memberOption.listenerOptions ); }
		
		return true;
	}
	
	//-------------------------------------
	//bind attribute group
	if( type==="attr" || type==="style" || type==="css" || type==="class" ){
		//bind attribute event
		if( memberIsFunction ){
			var attrName= ( type==="attr" )? typeItem : type;
			if( attrName==="css" ) attrName= "style";
			
			observeSingleMutation( el, attrName,
				function( mutationItem ){ return memberValue.apply( memberThis || this, [mutationItem, memberOption] ); }
			);
			return true;
		}
		
		var v0;
		if( type==="attr" ){		//bind attribute
			//variable member
			v0= findWithFilter( null, memberValue, mapValue(el.getAttribute(typeItem)||"", jsValueMapper ) );
			
			enclosePropertyDescriptor( obj, member,
				function(v){
					v=""+mapValue( v, domValueMapper );
					if( ele(elId).getAttribute(typeItem) !==v ) ele(elId).setAttribute(typeItem,v);
				},
				function(){ return mapValue( ele(elId).getAttribute(typeItem), jsValueMapper ); }
			);
			
			if( biDirection ) {
				observeSingleMutation( el, typeItem,
					function( mutationItem ){ obj[member]= mapValue( mutationItem.target.getAttribute(mutationItem.attributeName)||"", jsValueMapper ); }
				);
			}
		}
		else if( type==="style" || type==="css" ){		//bind style
			//variable member
			var v0= findWithFilter( null, memberValue, mapValue( el.style[typeItem]||"", jsValueMapper ) );
			
			enclosePropertyDescriptor( obj, member,
				function(v){
					v=""+mapValue( v, domValueMapper );
					if( ele(elId).style[typeItem] !==v ) ele(elId).style[typeItem]= v;
				},
				function(){ return mapValue( ele(elId).style[typeItem], jsValueMapper ); }
			);
			
			if( biDirection ) {
				observeSingleMutation( el, "style",
					function( mutationItem ){ obj[member]= mapValue( mutationItem.target.style[typeItem]||"", jsValueMapper ); }
				);
			}
		}
		else if( type==="class" ){		//bind class
			//variable member
			var v0= findWithFilter( null, memberValue, mapValue( el.classList.contains(typeItem), jsValueMapper ) );
			
			enclosePropertyDescriptor( obj, member,
				function(v){
					v= !! mapValue( v, domValueMapper );
					if( v && ! ele(elId).classList.contains(typeItem) ) ele(elId).classList.add(typeItem);
					else if( !v && ele(elId).classList.contains(typeItem) ) ele(elId).classList.remove(typeItem);
				},
				function(){ return mapValue( ele(elId).classList.contains(typeItem), jsValueMapper ); }
			);
			
			if( biDirection ) {
				observeSingleMutation( el, "class",
					function( mutationItem ){ obj[member]= mapValue( mutationItem.target.classList.contains(typeItem), jsValueMapper ); }
				);
			}
		}
		
		//init value
		obj[member]= v0;
		
		return true;
	}
	
	//-------------------------------------
	//bind property
	if( type==="prop" ){
		if( !(typeItem in el ) ) return formatError("bind property unfound", typeItem, bindItem );
		
		//function binding
		if( memberIsFunction ){
			var bindFunc= function(evt){ return memberValue.apply( memberThis || this, [ evt, memberOption]); };
			el.addEventListener( notifyEvent || "change", bindFunc, memberOption && memberOption.listenerOptions );
			if( watchJs ) {
				enclosePropertyDescriptor( el, typeItem,
					function(v){ dispatchEventByName( elId, notifyEvent || "change", 0 ); }
				);
			}
			return true;
		}
		
		//variable member
		var v0= findWithFilter( null, memberValue, mapValue(el[typeItem]||"", jsValueMapper ) );
		
		enclosePropertyDescriptor( obj, member,
			function(v){
				v= mapValue( v, domValueMapper );
				if( ele(elId)[typeItem] !=v ) ele(elId)[typeItem]= v;
			},
			function() { return mapValue( ele(elId)[typeItem], jsValueMapper ); }
		);
		
		if( biDirection ) {
			el.addEventListener( notifyEvent || "change", function(evt){ obj[member]= mapValue( ele(elId)[typeItem], jsValueMapper ); }, memberOption && memberOption.listenerOptions );
		}
		if( watchJs ) {
			enclosePropertyDescriptor( el, typeItem,
				function(v){ dispatchEventByName( elId, notifyEvent || "change", 0 ); }
			);
		}
		
		//init value
		obj[member]= v0;
		
		return true;
	}
	
	return formatError("unknown bind type",type,bindItem );
}

//return Error if fail
var bindByName= function( el, obj, bindItemArray ){
	el=ele(el);
	
	var elLast=el,lastName="";
	var i,imax= bindItemArray.length, bi, ret, namePath;
	
	var nm={			//name mapping;
		"": eleId(elLast)	//map "" to root element
	};
	
	for( i=0;i<imax;i++ ){
		bi= bindItemArray[i];
		namePath= bi[BI_NAME_PATH]||"";
		if( typeof namePath !=="string" ) return formatError("bind name path is not a string", namePath, bi );
		
		if( ! namePath ){	//omitted "namePath"
			bi[BI_NAME_PATH]= lastName;	//fill back omitted "namePath"
			
			if( i ){	//copy other omitted item from previous value
				if( !bi[BI_TYPE] ){
					bi[BI_TYPE]= bindItemArray[i-1][BI_TYPE];	//fill back omitted "type"
					if( !bi[BI_TYPE_OPTION] ) bi[BI_TYPE_OPTION]= bindItemArray[i-1][BI_TYPE_OPTION];	//fill back omitted typeOption | "typeItem"
				}
			}
		}
		else if( namePath!=lastName ){		//new namePath
			elLast= queryByName( el, namePath );
			if( !elLast ) return formatError("bind name path unfound", namePath, bi );
			nm[namePath]=eleId(elLast);
			lastName= namePath;
			
			if( bi.length===1 ) continue;	//only build name mapping
		}
		
		ret= bindElement( elLast, obj, bi );
		if( ret instanceof Error ) return ret;
	}
	return true;
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
		
		bindElement: bindElement,
		bindByName: bindByName,
		
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
		
	}
);

//dom global variable
if( typeof window !== "undefined" && window ){ window[globalVarName]= ele; }

