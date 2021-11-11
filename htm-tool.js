
// htm-tool @ npm, htm tool set.

var ele = require("element-tool");
var tmkt = require("tmkt");
var path_tool = require("path-tool");
var add_css_text = require("add-css-text");
var dom_document_tool = require("dom-document-tool");
var query_by_name_path = require("query-by-name-path");
var create_assign = require("create-assign");
var format_error_tool = require("format-error-tool");
var browser_http_request = require("browser-http-request");
var htm_tool_css = require("htm-tool-css");
var bind_ui = require("bind-ui");

// global variable name
var globalVarName = "htm-tool@npm";

//////////////////////////////////////////////////////////////////////////////////////////
// export module

module.exports = Object.assign(
	function () { return ele.apply(this, arguments); },
	{
		//global var
		globalVarName: globalVarName,

		//ele
		ele: ele,

		eleFromId: ele.fromId,
		eleId: ele.id,
		
		eleOffset: ele.offset,

		//tmkt
		dateString19: tmkt.toString19,
		dateString14: tmkt.toString14,
		dateDiffDhm: tmkt.diffDhm,
		tmkt: tmkt,

		//path
		dirPart: path_tool.dirPart,
		normalizePath: path_tool.normalize,

		//css tool
		addCssText: add_css_text,

		//dom document tool
		appendHtml: dom_document_tool.appendHtml,
		appendBodyHtml: dom_document_tool.appendBodyHtml,
		prependHtml: dom_document_tool.prependHtml,
		querySelectorByAttr: dom_document_tool.querySelectorByAttr,
		getSearchPart: dom_document_tool.getSearchPart,
		dispatchEventByName: dom_document_tool.dispatchEventByName,
		observeSingleMutation: dom_document_tool.observeSingleMutation,

		//query by name path
		queryByNamePath: query_by_name_path,

		//derive object
		deriveObject: create_assign,

		//error
		formatError: format_error_tool,
		Error: format_error_tool,

		//getPropertyDescriptor: getPropertyDescriptor,
		//enclosePropertyDescriptor: enclosePropertyDescriptor,
		//findWithFilter: findWithFilter,
		//defaultValueFilter: defaultValueFilter,
		//mapValue: mapValue,

		//xhr
		httpRequest: browser_http_request.requestText,
		httpRequestJson: browser_http_request.requestJson,

		//bind-ui
		bindUi: bind_ui,
		bindElement: bind_ui.bindElement,
		bindByName: bind_ui.bindByName,

		//htm-tool css
		setSelected: htm_tool_css.setSelected,

	}
);

//dom global variable
if (typeof window !== "undefined" && window) { window[globalVarName] = module.exports; }
