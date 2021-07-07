
/*
	vanilla js module, or commonJS module.
	
	example:

		<script src='./htm-tool.js' ht-var-name='ht'></script>

		htm_tool.alert('message 1');
		ht.showLog('message 2');	//only if the 'ht-var-name' attribute is set to 'ht' in <script>
*/

(function(){
	if( typeof htm_tool !== "undefined" && htm_tool ) return;	//already exists
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// public tool
	
	var ele= function(id){ return document.getElementById(id);}
	
	var eleSibling= function(el,offset){
		var m= el.id.match( /^(\D+)(\d+)$/ );
		return ele( m[1]+ (parseInt( m[2] )+ offset ));
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

	var dateDiffStr= function ( startTime, endTime, english ){
		var usedTime = endTime - startTime; // 相差的毫秒数
		var days = Math.floor(usedTime / (24 * 3600 * 1000)); // 计算出天数
		var leavel = usedTime % (24 * 3600 * 1000); // 计算天数后剩余的时间
		var hours = Math.floor(leavel / (3600 * 1000)); // 计算剩余的小时数
		var leavel2 = leavel % (3600 * 1000); // 计算剩余小时后剩余的毫秒数
		var minutes = Math.floor(leavel2 / (60 * 1000)); // 计算剩余的分钟数
		return english?
			(days?(days + 'd '):"") + (hours?(hours + 'h '):"") + minutes + 'm'
			:
			(days?(days + '天'):"") + (hours?(hours + '时'):"") + minutes + '分';
	}

	var addCssText= function (cssText) {
		var style = document.createElement("style");
		style.type = "text/css";
		try {
			style.appendChild(document.createTextNode(cssText));
		}
		catch (ex) {
			style.styleSheet.cssText = cssText;
		}
		document.getElementsByTagName("head")[0].appendChild(style);
	}
	
	var appendBodyHtml= function( htmlText ){
		document.body.insertAdjacentHTML( 'beforeend', htmlText );
	}
	
	var querySelectorByAttr= function( el, head, attrName, attrValue, tail ){
		return el.querySelector( (head||"")+"["+attrName+"='"+ attrValue.replace(/(\<\>\'\"\:)/g,"\\$1")+"']"+(tail||""));
	}
	
	var seed=0;
	
	var eleId= function (el, prefix) {
		if (el.id) return el.id;
		if (!prefix) prefix = "ht-id-";

		var sid;
		while (ele(sid = prefix + (++seed))) { };

		return el.id = sid;
	}
	
	/*
		cb
			function(responseText, lastKey)
		
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
	        if (xq.readyState == 4 && xq.status==200) {
				if( cb ) cb ( xq.responseText, lastKey );
	        }
	    }
		
		xq.send(postData);
	}

	/*
		cb
			function( json, responseText, lastKey)
	*/
	var httpRequestJson= function( url, methodOrOptions, postData, cb, lastKey ){
		httpRequest(url, methodOrOptions, postData, function(responseText, lastKey){
			try{
				var json= JSON.parse(responseText);
				cb(json,responseText, lastKey)
			}
			catch(ex){
				cb(null,responseText, lastKey)
			}
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
				if( typeof si==="string" ) si= ele(si);
				if( !si.className.match(/(^|\s)ht-selected(\s|$)/ ) ) si.className+=" ht-selected";
			}
		}
		
		if( unselectList ){
			if( !(unselectList instanceof Array)) unselectList=[unselectList];
			
			var i,imax= unselectList.length,si;
			for(i=0;i<imax;i++){
				si= unselectList[i];
				if( typeof si==="string" ) si= ele(si);
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
			el= ele(lastTabItem[0]);
			el.className= el.className.replace(/ht\-tab\-item\-selected/g,"").replace(/\s+/g," " );
		}
		if( lastTabItem[1] ){
			ele(lastTabItem[1]).style.display="none";
		}
		
		//show selected
		el= ele(idTab);
		el.className= (el.className+" ht-tab-item-selected").replace(/\s+/g," " );
		if( idPanel ) ele(idPanel).style.display="";
		
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

	var showLog= function( s ){
		
		//init
		var elLog= ele("div-ht-log");
		if( ! elLog ){
			appendBodyHtml(
				"<div id='div-ht-log' style='position:fixed;right:0.5em;bottom:0.5em;width:auto;height:auto;max-width:500px;background:white;border:1px solid gray;font-size:9pt;padding:0.5em;cursor:default;' onclick='htm_tool.showLog();'>"+
					"<span id='sp-ht-log-close' class='ht-cmd' style='float:right;text-decoration:none;padding:0em 0.3em;' onclick='setTimeout( function(){ htm_tool.showLog(false);}, 0 );' title='关闭'>&times;</span>"+
					"<span id='sp-ht-log-minimize' class='ht-cmd' style='display:none;float:right;text-decoration:none;padding:0em 0.3em;' onclick='setTimeout( function(){ htm_tool.showLog(null);}, 0 );' title='最小化'>&minus;</span>"+
					"<b>日志</b>"+
					"<div id='div-ht-log-content' style='display:none;'></div>"+
				"</div>"
			);
			elLog= ele("div-ht-log");
		}
		
		//----------------------------------------------------------------------------------------
		
		var el= ele('div-ht-log-content');
		var elMinimize= ele('sp-ht-log-minimize');
		var elClose= ele('sp-ht-log-close');
		
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
		
		dragSet: {},	//map drag start-key to drag start item; drag item: {itemArray,pageX0,pageY0,from,elStart,key}
		dragSetCount: 0,
		
		//onStart: function ( evt, el1, el2, ..., elN )
		onStart: function ( evt, el1) {
			if( this!== dragObject ) return dragObject.onStart.apply(dragObject, arguments);		//active `this`
			
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
				document.addEventListener("mousemove", this.onMove, false);
				document.addEventListener("mouseup", this.onStop, false);
				document.addEventListener("keyup", this.onKey, false);
				document.addEventListener('touchmove',this.onMove,{passive:false});
				document.addEventListener('touchend',this.onStop,false);
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
			if( this!== dragObject ) return dragObject.onStop(evt);		//active `this`
			
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
				console.log("release drag listener");
				document.removeEventListener("mousemove", this.onMove, false);
				document.removeEventListener("mouseup", this.onStop, false);
				document.removeEventListener("keyup", this.onKey, false);
				document.removeEventListener('touchmove',this.onMove,{passive:false});
				document.removeEventListener('touchend',this.onStop,false);
			}
			
			if( this.dragSetCount<0 ){
				console.error("dragSetCount abnormal, "+ this.dragSetCount);
				this.onStop(false);	//stop all
				this.dragSetCount=0;
			}
		},
		
		onMove: function (evt) {
			if( this!== dragObject ) return dragObject.onMove(evt);		//active `this`
			
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
			if( this!== dragObject ) return dragObject.onKey(evt);		//active `this`
			
			var keyCode= evt.keyCode||evt.which||evt.charCode;
			
			if (keyCode==27){ this.onStop( false ); }		//ESC to reset
			else{ this.onStop(); }		//others to stop
		},
		
	};
	
	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// popup panel tool
	
		example:
			<div id='divPopup1' class='ht-popup' style='display:none;'>
				<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this ) ontouchstart=='htm_tool.startDrag( arguments[0], this )'>
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
		
		if( typeof el==="string" ) el= ele(el);
		
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
			el.insertAdjacentHTML( 'afterbegin', "<div class='ht-popup-back' onclick=\"if(this.parentNode.querySelector('.ht-popup-body').className.indexOf('ht-popup-modal')<0)htm_tool.hidePopup(this);\"></div>" );
		}
		
		//add close button
		var elClose= elBody.querySelector("span[name='ht-popup-close']");
		if( !elClose ){
			elBody.insertAdjacentHTML( 'afterbegin', "<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' class='ht-cmd' onclick='htm_tool.hidePopup(this);' title='关闭'>x</span>" );
			elClose= elBody.querySelector("span[name='ht-popup-close']");
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
		if( typeof el==="string" ) el= ele(el);
		
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
			el= ele(nm);
			if( !el ) break;
			if( el.style.display=="none" ) break;
		}
		
		if(i>POPUP_HTML_COUNT_MAX ) {
			console.error( "popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX );
			return;
		}
		
		//init
		if( ! ele(nm) ){
			appendBodyHtml(
				"<div id='"+nm+"' class='ht-popup' style='display:none;'>"+
					"<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this )' ontouchstart='htm_tool.startDrag( arguments[0], this )'></div>"+
				"</div>"
			);
		}
		var elBody= ele(nm).querySelector(".ht-popup-body");
		elBody.innerHTML= bodyHtml;
		
		showPopup( nm, (typeof modal==="undefined")?1:modal, cb );
	}
	
	var alert= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick='htm_tool.hidePopup(this)'>确定</button></span>",modal, cb );
	}
	var confirm= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,'ok')\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
	}
	var confirmYnc= function( message, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,'yes')\">是</button> <button onclick=\"htm_tool.hidePopup(this,'no')\">否</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
	}
	var prompt= function( message, defaultValue, modal, cb ){
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<br><input type='text' style='width:100%;'></input></div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,this.parentNode.parentNode.querySelector('input').value);\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
		if(defaultValue) popupStack[popupStack.length-1][0].querySelector('input').value= defaultValue;
	}
	var selectRadioList= function( message, itemList, defaultValue, modal, cb ){
		var nm= "ht-select-radio="+(++seed);
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' value='' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((v[0]===defaultValue)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='radio' name='"+nm+"' value='"+v[0]+"'"+((v[0]===defaultValue)?" checked":"")+" onchange=\"if(!this.checked)return; var oldv= this.parentNode.parentNode.getAttribute('value'); var oldel=htm_tool.querySelectorByAttr(this.parentNode.parentNode,'input','value',oldv); htm_tool.setSelected(this.parentNode,oldel && oldel.parentNode,true);this.parentNode.parentNode.setAttribute('value',this.value)\"></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,this.parentNode.parentNode.querySelector('input:checked').value);\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
		if(defaultValue) popupStack[popupStack.length-1][0].querySelector('div.ht-input').setAttribute("value", defaultValue);
	}
	var selectCheckboxList= function( message, itemList, defaultValueList, modal, cb ){
		if( ! defaultValueList || typeof defaultValueList=="string" ) defaultValueList=[defaultValueList];
		showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((defaultValueList.indexOf(v[0])>=0)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='checkbox' value='"+v[0]+"'"+((defaultValueList.indexOf(v[0])>=0)?" checked":"")+" onchange='htm_tool.setSelected(this.parentNode,null,this.checked)'></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\"var items=this.parentNode.parentNode.querySelectorAll('input:checked');var a=[];for(i=0;i<items.length;i++){a[i]=items[i].value;};htm_tool.hidePopup(this,a);\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
	}

	//////////////////////////////////////////////////////////////////////////////////////////
	// export module
	
	var htm_tool= ele;
	Object.assign( htm_tool,
		{
			ele: ele,
			eleSibling: eleSibling,
			dateString19: dateString19,
			dateString14: dateString14,
			dateDiffStr: dateDiffStr,
			addCssText: addCssText,
			appendBodyHtml: appendBodyHtml,
			querySelectorByAttr: querySelectorByAttr,
			eleId: eleId,
			httpRequest: httpRequest,
			httpRequestJson: httpRequestJson,
			setSelected: setSelected,
			selectTabItem: selectTabItem,
			showLog: showLog,
			startDrag: dragObject.onStart,
			showPopup: showPopup,
			hidePopup: hidePopup,
			showPopupHtml: showPopupHtml,
			alert: alert,
			confirm: confirm,
			confirmYnc: confirmYnc,
			prompt: prompt,
			selectRadioList: selectRadioList,
			selectCheckboxList: selectCheckboxList,
			
		}
	);
	
	//commonJS module
	if ( typeof module === "object" && module && typeof module.exports === "object" ) { module.exports = htm_tool; }

	//dom module
	if( typeof window !== "undefined" && window ){
		if( !window.htm_tool ) window.htm_tool= htm_tool;
		
		//set user-defined variable
		var elScript= document.querySelector("script[ht-var-name]");
		if( elScript ){ window[elScript.getAttribute("ht-var-name")]= htm_tool; }
	}

}());

