
// htm-tool @ npm, htm tool set.

var ele = require("element-tool");
var element_offset = require("element-offset");
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
var htm_tool_ui = require("htm-tool-ui");
var bind_element = require("bind-element");

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

		eleOffset: element_offset,

		//tmkt
		tmkt: tmkt,
		dateString19: tmkt.toString19,
		dateString14: tmkt.toString14,
		dateDiffDhm: tmkt.diffDhm,

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
		derive: create_assign,
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

		//bind-element
		bindElement: bind_element,
		bindElementArray: bind_element.array,

		//htm-tool css
		setSelected: htm_tool_css.setSelected,

		//------------------------------
		//htm-tool ui
		ui: htm_tool_ui,

		//tab
		initTabControl: htm_tool_ui.initTabControl,
		getLastTabId: htm_tool_ui.getLastTabId,

		//radio group
		initRadioGroup: htm_tool_ui.initRadioGroup,
		getRadioGroupValue: htm_tool_ui.getRadioGroupValue,

		//log
		showLog: htm_tool_ui.showLog,

		//drag
		dragObject: htm_tool_ui.dragObject,
		startDrag: htm_tool_ui.startDrag,
		startDragListener: htm_tool_ui.startDragListener,

		//popup
		showPopup: htm_tool_ui.showPopup,
		hidePopup: htm_tool_ui.hidePopup,

		popupCloseListener: htm_tool_ui.popupCloseListener,
		popupCloseByNameListener: htm_tool_ui.popupCloseByNameListener,

		//popup html
		showPopupHtml: htm_tool_ui.showPopupHtml,

		alert: htm_tool_ui.alert,
		confirm: htm_tool_ui.confirm,
		confirmYnc: htm_tool_ui.confirmYnc,
		prompt: htm_tool_ui.prompt,
		selectRadioList: htm_tool_ui.selectRadioList,
		selectCheckboxList: htm_tool_ui.selectCheckboxList,
		selectButtonList: htm_tool_ui.selectButtonList,

		//------------------------------

	}
);

//dom global variable
if (typeof window !== "undefined" && window) { window[globalVarName] = module.exports; }
