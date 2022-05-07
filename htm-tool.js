
// htm-tool @ npm, htm tool set.

var get_element_by_id = require("get-element-by-id");
var ele_id = require("ele-id");
var element_offset = require("element-offset");
var tmkt = require("tmkt");
var path_tool = require("path-tool");
var add_css_text = require("add-css-text");
var insert_adjacent_return = require("insert-adjacent-return");
var query_by_name_path = require("query-by-name-path");
var create_assign = require("create-assign");
var format_error_tool = require("format-error-tool");
var browser_http_request = require("browser-http-request");
var htm_tool_css = require("htm-tool-css");
var bind_ui = require("bind-ui");
var htm_tool_ui = require("htm-tool-ui");
var bind_element = require("bind-element");

var observe_single_mutation = require("observe-single-mutation");
var dispatch_event_by_name = require("dispatch-event-by-name");
var query_by_attribute = require("query-by-attribute");
var get_search_part = require("get-search-part");

// global variable name
var globalVarName = "htm-tool@npm";

//////////////////////////////////////////////////////////////////////////////////////////
// export module

module.exports = exports = Object.assign(
	function () { return get_element_by_id.apply(this, arguments); },	//entry

	htm_tool_ui,	//full set

	{
		//global var
		globalVarName: globalVarName,

		//get_element_by_id
		get_element_by_id: get_element_by_id,
		getEelementById: get_element_by_id,

		ele: get_element_by_id,

		//ele_id
		ele_id: ele_id,
		eleId: ele_id,

		eleFromId: ele_id.from,

		//element_offset
		element_offset: element_offset,
		elementOffset: element_offset,

		eleOffset: element_offset,

		//tmkt
		tmkt: tmkt,

		dateString19: tmkt.toString19,
		dateString14: tmkt.toString14,
		dateDiffDhm: tmkt.diffDhm,

		//path
		path_tool: path_tool,

		dirPart: path_tool.dirPart,
		normalizePath: path_tool.normalize,
		pathKey: path_tool.keyString,

		//css tool
		add_css_text: add_css_text,
		addCssText: add_css_text,

		//insert adjacent
		insert_adjacent_return: insert_adjacent_return,

		insertAdjacent: insert_adjacent_return,

		appendHtml: insert_adjacent_return.append,
		appendBodyHtml: function (data, isText) { return insert_adjacent_return.append(document.body, data, isText); },
		prependHtml: insert_adjacent_return.prepend,

		//dom document tool
		query_by_attribute: query_by_attribute,
		queryByAttribute: query_by_attribute,

		queryByAttr: query_by_attribute,

		//get_search_part
		get_search_part: get_search_part,
		getSearchPart: get_search_part,

		//dispatch_event_by_name
		dispatch_event_by_name: dispatch_event_by_name,
		dispatchEventByName: dispatch_event_by_name,

		//observe_single_mutation
		observe_single_mutation: observe_single_mutation,
		observeSingleMutation: observe_single_mutation,

		//query by name path
		query_by_name_path: query_by_name_path,
		queryByNamePath: query_by_name_path,

		//derive object
		create_assign: create_assign,
		derive: create_assign,
		deriveObject: create_assign,

		//error
		format_error_tool: format_error_tool,

		formatError: format_error_tool,
		Error: format_error_tool,

		//getPropertyDescriptor: getPropertyDescriptor,
		//enclosePropertyDescriptor: enclosePropertyDescriptor,
		//findWithFilter: findWithFilter,
		//defaultValueFilter: defaultValueFilter,
		//mapValue: mapValue,

		//browser_http_request, xhr
		browser_http_request: browser_http_request,

		httpRequest: browser_http_request.requestText,
		httpRequestJson: browser_http_request.requestJson,

		//bind-ui
		bind_ui: bind_ui,
		bindUi: bind_ui,

		//bind-element
		bind_element: bind_element,
		bindElement: bind_element,
		bindElementArray: bind_element.array,

		//htm_tool_ui
		htm_tool_ui: htm_tool_ui,

		ui: htm_tool_ui,

		//htm_tool_css
		htm_tool_css: htm_tool_css,

		css: htm_tool_css,

		setClass: htm_tool_css,
		setElClass: htm_tool_css.setEl,

	}
);

//dom global variable
if (typeof window !== "undefined" && window) { window[globalVarName] = module.exports; }
