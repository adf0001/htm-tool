
/*
	vanilla js module, or commonJS module.
	
	example:

		<script src='./htm-tool.js' ht-var-name='ht'></script>

		htm_tool.alert('message 1');
		ht.showLog('message 2');	//only if the 'ht-var-name' attribute is set to 'ht' in <script>
*/

if( typeof htm_tool === "undefined" || ! htm_tool ){
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// public tool
	
	var htm_tool= function(id){ return document.getElementById(id);}
	
	htm_tool.ele= htm_tool;
	
	htm_tool.eleSibling= function(el,offset){
		var m= el.id.match( /^(\D+)(\d+)$/ );
		return htm_tool( m[1]+ (parseInt( m[2] )+ offset ));
	}

	htm_tool.dateString19= function (dt) {
		if( !dt ) dt= new Date();
		
		var s = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() +
			" " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
		return s.replace(/\b(\d)\b/g, "0$1");
	}

	htm_tool.dateString14= function (dt) {
		return htm_tool.dateString19(dt).replace(/\D+/g, "");
	}

	htm_tool.dateDiffStr= function ( startTime, endTime, english ){
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

	htm_tool.addCssText= function (cssText) {
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
	
	htm_tool.appendBodyHtml= function( htmlText ){
		document.body.insertAdjacentHTML( 'beforeend', htmlText );
	},
	
	/*
		cb
			function(responseText, lastKey)
		
		methodOrOptions
			method: "POST"/"GET"/...
			options: { method:... , headers: {} }
	*/
	htm_tool.httpRequest= function( url, methodOrOptions, postData, cb, lastKey ){
		var options = (typeof methodOrOptions==="string")?  { method: methodOrOptions, } : methodOrOptions ;

		var xq = window.ActiveXObject ? (new ActiveXObject("Msxml2.XMLHTTP")) : (new XMLHttpRequest());
		
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
	htm_tool.httpRequestJson= function( url, methodOrOptions, postData, cb, lastKey ){
		htm_tool.httpRequest(url, methodOrOptions, postData, function(responseText, lastKey){
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
	
	htm_tool.addCssText(
		".ht-cmd {"+
			"color: green;"+
			"text-decoration: underline;"+
			"cursor: pointer;"+
			"font-size: 9pt;"+
		"}"+
		".ht-cmd:hover{"+
			"background:lightgrey;"+
		"}"
	);

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

	htm_tool.selectTabItem= function ( group, idTab, idPanel ){
		
		//init
		if( ! tabGroup ){
			tabGroup={};
			
			htm_tool.addCssText(
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
			el= htm_tool(lastTabItem[0]);
			el.className= el.className.replace(/ht\-tab\-item\-selected/g,"").replace(/\s+/g," " );
		}
		if( lastTabItem[1] ){
			htm_tool(lastTabItem[1]).style.display="none";
		}
		
		//show selected
		el= htm_tool(idTab);
		el.className= (el.className+" ht-tab-item-selected").replace(/\s+/g," " );
		if( idPanel ) htm_tool(idPanel).style.display="";
		
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

	htm_tool.showLog= function( s ){
		
		//init
		var elLog= htm_tool("div-ht-log");
		if( ! elLog ){
			htm_tool.appendBodyHtml(
				"<div id='div-ht-log' style='position:fixed;right:0.5em;bottom:0.5em;width:auto;height:auto;max-width:500px;background:white;border:1px solid gray;font-size:9pt;padding:0.5em;cursor:default;' onclick='htm_tool.showLog();'>"+
					"<span id='sp-ht-log-close' class='ht-cmd' style='float:right;text-decoration:none;padding:0em 0.3em;' onclick='setTimeout( function(){ htm_tool.showLog(false);}, 0 );' title='关闭'>&times;</span>"+
					"<span id='sp-ht-log-minimize' class='ht-cmd' style='display:none;float:right;text-decoration:none;padding:0em 0.3em;' onclick='setTimeout( function(){ htm_tool.showLog(null);}, 0 );' title='最小化'>&minus;</span>"+
					"<b>日志</b>"+
					"<div id='div-ht-log-content' style='display:none;'></div>"+
				"</div>"
			);
			elLog= htm_tool("div-ht-log");
		}
		
		//----------------------------------------------------------------------------------------
		
		var el= htm_tool('div-ht-log-content');
		var elMinimize= htm_tool('sp-ht-log-minimize');
		var elClose= htm_tool('sp-ht-log-close');
		
		elLog.style.display="";
		
		if( s ){
			while(el.childNodes.length>=10){
				el.removeChild(el.firstChild);
			}
			
			var tms= htm_tool.dateString19();
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
	// drag tool
	
		example:
			
			<div onmousedown="htm_tool.startDrag( arguments[0], this )">...</div>
	*/

	var dragObject= {
		itemArray: null,	//[ [el1, x0_1, y0_1], [el2, x0_2, y0_2], ...]
		screenX0: 0,
		screenY0: 0,
		
		onMove: function (evt) {
			if( this!== dragObject ) return dragObject.onMove(evt);		//active `this`
			
			if (!this.itemArray) return;

			var dx = evt.screenX - this.screenX0;
			var dy = evt.screenY - this.screenY0;

			var i, imax = this.itemArray.length, ai;
			for (i = 0; i < imax; i++) {
				ai = this.itemArray[i];
				ai[0].style.left = (ai[1] + dx) + "px";
				ai[0].style.top = (ai[2] + dy) + "px";
			}
		},
		
		onStop: function ( evt ) {
			if( this!== dragObject ) return dragObject.onStop(evt);		//active `this`
			
			if (!this.itemArray) return;
			
			if( evt===false ){
				//reset x,y
				this.onMove( {screenX:this.screenX0,screenY:this.screenY0 } )
			}

			this.itemArray = null;

			if (window.ActiveXObject) {
				document.body.detachEvent("onmousemove", this.onMove);
				document.body.detachEvent("onmouseup", this.onStop);
				document.body.detachEvent("onkeyup", this.onKey);
			}
			else {
				document.removeEventListener("mousemove", this.onMove, false);
				document.removeEventListener("mouseup", this.onStop, false);
				document.removeEventListener("keyup", this.onKey, false);
			}
		},
		
		onKey: function (evt) {
			if( this!== dragObject ) return dragObject.onKey(evt);		//active `this`
			
			if (!this.itemArray) return;

			var keyCode= evt.keyCode||evt.which||evt.charCode;
			
			if (keyCode==27){ this.onStop( false ); }		//ESC to reset
			else{ this.onStop(); }		//others to stop
		},
		
		//onStart: function ( evt, el1, el2, ..., elN )
		onStart: function ( evt, el1) {
			if( this!== dragObject ) return dragObject.onStart.apply(dragObject, arguments);		//active `this`
			
			if (arguments.length < 2) return false;
			if( !evt ) evt= window.event;
			
			//check if target is an input
			if( evt.target.tagName.match( /^(input|button|textarea|select|option.*|a)$/i ) || (evt.target.className && evt.target.className.match("(ht-input|ht-cmd)(\s|$)") ) ){
				return false;
			}
			
			if (this.itemArray) this.onStop();
			
			this.screenX0 = evt.screenX;
			this.screenY0 = evt.screenY;

			this.itemArray = [];

			var i, imax = arguments.length, el;
			for (i = 1; i < imax; i++) {
				el = arguments[i];
				this.itemArray.push([el, parseInt(el.style.left)||0, parseInt(el.style.top)||0]);
			}

			if (window.ActiveXObject) {
				document.body.attachEvent("onmousemove", this.onMove);
				document.body.attachEvent("onmouseup", this.onStop);
				document.body.attachEvent("onkeyup", this.onKey);
			}
			else {
				document.addEventListener("mousemove", this.onMove, false);
				document.addEventListener("mouseup", this.onStop, false);
				document.addEventListener("keyup", this.onKey, false);
			}
		},
	};
	
	//----------------------------------------------------------------------------------------
	
	//htm_tool.startDrag: function ( evt, el1, el2, ... )
	htm_tool.startDrag= dragObject.onStart;

	/*
	//////////////////////////////////////////////////////////////////////////////////////////
	// popup panel tool
	
		example:
			<div id='divPopup1' class='ht-popup' style='display:none;'>
				<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this )'>
					popup-1<hr>This is popup-1.
				</div>
			</div>
			
			htm_tool.showPopup('divPopup1');
	*/
	
	var popupStack= null;	//item: [el, cb ]
	
	htm_tool.showPopup= function( el, modal, cb ){
		
		//init
		if( ! popupStack ) {
			popupStack= [];
			
			htm_tool.addCssText(
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
		
		if( typeof el==="string" ) el= htm_tool(el);
		
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
	
	htm_tool.hidePopup= function( el, data ){
		if( typeof el==="string" ) el= htm_tool(el);
		
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
	
	htm_tool.showPopupHtml= function( bodyHtml, modal, cb ){
		
		//find empty html
		var i,nm,el;
		for(i=1;i<=POPUP_HTML_COUNT_MAX;i++){
			nm= "ht-popup-html-" + i;
			el= htm_tool(nm);
			if( !el ) break;
			if( el.style.display=="none" ) break;
		}
		
		if(i>POPUP_HTML_COUNT_MAX ) {
			console.error( "popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX );
			return;
		}
		
		//init
		if( ! htm_tool(nm) ){
			htm_tool.appendBodyHtml(
				"<div id='"+nm+"' class='ht-popup' style='display:none;'>"+
					"<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this )'></div>"+
				"</div>"
			);
		}
		var elBody= htm_tool(nm).querySelector(".ht-popup-body");
		elBody.innerHTML= bodyHtml;
		
		htm_tool.showPopup( nm, (typeof modal==="undefined")?1:modal, cb );
	}
	
	htm_tool.alert= function( message, modal, cb ){
		htm_tool.showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick='htm_tool.hidePopup(this)'>确定</button></span>",modal, cb );
	}
	htm_tool.confirm= function( message, modal, cb ){
		htm_tool.showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,'ok')\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
	}
	htm_tool.confirmYnc= function( message, modal, cb ){
		htm_tool.showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,'yes')\">是</button> <button onclick=\"htm_tool.hidePopup(this,'no')\">否</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
	}
	htm_tool.prompt= function( message, defaultValue, modal, cb ){
		htm_tool.showPopupHtml( "<div style='min-width:200px;'>"+message+"<br><input type='text' style='width:100%;'></input></div><br><span style='float:right'><button onclick=\"htm_tool.hidePopup(this,this.parentNode.parentNode.querySelector('input').value);\">确定</button> <button onclick='htm_tool.hidePopup(this)'>取消</button></span>",modal, cb );
		if(defaultValue) popupStack[popupStack.length-1][0].querySelector('input').value= defaultValue;
	}

}

//commonJS module
if ( typeof module === "object" && module && typeof module.exports === "object" ) { module.exports = htm_tool; }

//dom module
if( typeof window !== "undefined" && window ){
	if( !window.htm_tool ) window.htm_tool= htm_tool;
	if( document.querySelector("script[ht-var-name]") ){ window[document.querySelector("script[ht-var-name]").getAttribute("ht-var-name")]= htm_tool; }
}

