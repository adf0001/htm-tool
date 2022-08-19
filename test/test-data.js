
// global, for html page

ht = require("../htm-tool.js");

module.exports = {

	"globalVarName": function (done) {
		return window[ht.globalVarName] === ht && ht.globalVarName;
	},
	"ele()": function (done) {
		return ht.ele('divResult') === document.getElementById('divResult') &&
			ht.ele(document.getElementById('divResult')) === document.getElementById('divResult');
	},
	"eleFromId()": function (done) {
		return ht.eleFromId('divResult') === document.getElementById('divResult');
	},
	"eleId()": function (done) {
		ht('divResult2').innerHTML = '<span>child</span>';
		showResult('new id= ' + ht.eleId(ht('divResult2').firstChild) + ', new id2= ' + ht.eleId(), 3);
		return ht('divResult2').firstChild.id &&
			ht.eleId(document.getElementById('divResult2')) === 'divResult2';
	},
	"eleOffset()": function (done) {
		return ht.eleOffset(ht('divResult2'), 1) === ht('divResult3') &&
			ht.eleOffset(ht('divResult3'), -1) === ht('divResult2');
	},
	"dateString19()": function (done) {
		return ht.dateString19(new Date(2000, 1, 3, 4, 5, 6)) === '2000-02-03 04:05:06';
	},
	"dateString14()": function (done) {
		return ht.dateString14(new Date(2000, 1, 3, 4, 5, 6)) === '20000203040506';
	},
	"dateDiffDhm()": function (done) {
		return ht.dateDiffDhm(new Date(2000, 1, 3, 4, 5, 6), new Date(2000, 1, 4, 5, 6, 7), null, "ch") === '1天1时1分' &&
			ht.dateDiffDhm(new Date(2000, 1, 3, 4, 5, 6), new Date(2000, 1, 4, 5, 6, 7), 1) === '1d 1h 1m' &&
			ht.dateDiffDhm(new Date(2000, 1, 4, 5, 6, 7), new Date(2000, 1, 3, 4, 5, 6), null, "ch") === '-1天1时1分' &&
			ht.dateDiffDhm(new Date(2000, 1, 4, 5, 6, 7), new Date(2000, 1, 3, 4, 5, 6), 1) === '-1d 1h 1m';
	},
	"dirPart()": function (done) {
		return ht.dirPart("111/222/333") === '111/222/' &&
			ht.dirPart("111/222/333/") === '111/222/' &&
			ht.dirPart("111\\222\\333\\") === '111\\222\\' &&
			ht.dirPart("111\\") === '' &&
			ht.dirPart("111") === ''
			;
	},
	"normalizePath()": function (done) {
		return ht.normalizePath("111/./222/333/../444") === '111/222/444' &&
			ht.normalizePath("111/././222/333/444/../../555/") === '111/222/555/' &&
			ht.normalizePath("111/././222/333/444/../../555/../") === '111/222/' &&
			ht.normalizePath("111/././222/333/444/../../555/..") === '111/222/' &&
			ht.normalizePath("111/././222/333/444/../../555/./") === '111/222/555/' &&
			ht.normalizePath("111/././222/333/444/../../555/.") === '111/222/555/' &&
			ht.normalizePath("./111/././222/333/444/../../555/.") === '111/222/555/' &&
			ht.normalizePath("././111/././222/333/444/../../555/.") === '111/222/555/' &&
			ht.normalizePath("/./111/././222/333/444/../../555/.") === '/111/222/555/' &&
			ht.normalizePath("/../111/././222/333/444/../../555/.") === '/../111/222/555/' &&
			ht.normalizePath("../111/././222/333/444/../../555/.") === '../111/222/555/' &&
			ht.normalizePath("../111/.././222/333/444/../../555/.") === '../222/555/' &&
			ht.normalizePath("../111/../../222/333/444/../../555/.") === '../../222/555/' &&
			ht.normalizePath("../../111/../../222/333/444/../../555/.") === '../../../222/555/' &&
			ht.normalizePath("/../../111/../../222/333/444/../../555/.") === '/../../../222/555/' &&
			ht.normalizePath("/../../.11/../../222/333./4.44/../../555/.") === '/../../../222/555/' &&
			ht.normalizePath("/../../..11/../../222/333../4..44/../../555/.") === '/../../../222/555/' &&
			true
			;
	},
	"addCssText()": function (done) {
		ht.addCssText('#divResult3{height:200px}');
		return ht('divResult3').offsetHeight === 200;
	},
	"addCssText()/styleId": function (done) {
		ht.addCssText('#divResult3 span.si{background:yellow;}', 'myStyle1');
		ht('divResult3').innerHTML = '<span class=si>aaa</span> <span class=si>bbb</span>';

		return "<span class='ht cmd' onclick=\"ht('myStyle1').textContent='#divResult3 span.si{background:red;}'\">red</span> " +
			"<span class='ht cmd'  onclick=\"ht.addCssText('#divResult3 span.si{background:blue;}','myStyle1')\">blue</span>";
	},
	"appendHtml()": function (done) {
		var a = ht.appendHtml('divResult3', '<span>aa</span> <span>bb</span> ');
		return a.textContent == 'aa';
	},
	"appendBodyHtml()": function (done) {
		var a = ht.appendBodyHtml('<span>aa</span> <span>bb</span> ');
		return a.textContent == 'aa'
	},
	"query_by_attribute()": function (done) {
		ht('divResult3').innerHTML = '<span myattr=11>aaa</span> <span myattr=22>bbb</span> <b myattr=22>ccc</b> <b myattr=22>ddd</b>';
		return ht.query_by_attribute('divResult3', '', 'myattr').getAttribute('myattr') === '11' &&
			ht.query_by_attribute('divResult3', '', 'myattr', '22').textContent === 'bbb' &&
			ht.query_by_attribute('divResult3', 'b', 'myattr', '22').textContent === 'ccc' &&
			ht.query_by_attribute('divResult3', 'b', 'myattr', '22', ':nth-of-type(2)').textContent === 'ddd';
	},
	"queryByNamePath()": function (done) {
		ht('divResult3').innerHTML = '\
			<span name=a>aaa</span> \
			<span name=b>bbb \
				<span name=c>ccc</span> \
				<span name=a>aaa2</span> \
				<span name=d>ddd \
					<span>no-name \
						<span name=e>eee</span> \
					</span>\
				</span>\
			</span>\
			<span>no-name \
				<span name=c>ccc2</span> \
			</span>\
			';

		return ht.queryByNamePath('divResult3', 'a').textContent === 'aaa' &&
			ht.queryByNamePath('divResult3', 'c').textContent === 'ccc' &&
			ht.queryByNamePath('divResult3', 'c', true).textContent === 'ccc2' && 	//strict mode
			ht.queryByNamePath('divResult3', '.c').textContent === 'ccc2' && 	//strict mode
			ht.queryByNamePath('divResult3', 'b.c').textContent === 'ccc' && 	//strict mode
			ht.queryByNamePath('divResult3', ['b', 'c']).textContent === 'ccc' &&
			ht.queryByNamePath('divResult3', ['b', 'a']).textContent === 'aaa2' &&

			ht.queryByNamePath('divResult3', 'e').textContent === 'eee' &&
			ht.queryByNamePath('divResult3', 'd.e', false).textContent === 'eee' &&
			ht.queryByNamePath('divResult3', 'b.e', false).textContent === 'eee' &&
			ht.queryByNamePath('divResult3', 'e', true) === null && 	//strict mode
			ht.queryByNamePath('divResult3', 'd.e') === null && 	//strict mode
			ht.queryByNamePath('divResult3', 'b.e') === null && 	//strict mode
			ht.queryByNamePath('divResult3', 'b.d.e').textContent === 'eee' 	//strict mode
	},
	"get_search_part()": function (done) {
		return ht.get_search_part('a', '?aa=1&a=2') === '2' &&
			ht.get_search_part('aa', '?aa=1&a=2') === '1' &&
			ht.get_search_part('a', '?aa=1&a=2&cc=3') === '2' &&
			ht.get_search_part('d', '?aa=1&a=2&cc=3') === null
	},
	"formatError() & Error()": function (done) {
		var err1 = ht.formatError('err1', 'key1', { a: 1, b: 2 });

		return err1.message === 'err1, "key1", {"a":1,"b":2}' && err1 === ht.Error(ht.Error(ht.Error(err1)));
	},
	"deriveObject()": function (done) {
		var a = {
			f1: function () { return 1; },
			f2: function () { return 2; },
		};
		var b = {
			f3: function () { return 3; },
			f4: function () { return 4; },
		};
		var c = ht.deriveObject(a, b, {
			f2: function () { return 22; },
			f3: function () { return 33; },
		});

		return c.f1() === 1 && c.f2() === 22 && c.f3() === 33 && c.f4() === 4 &&
			('f1' in c) && !c.hasOwnProperty('f1') && c.hasOwnProperty('f4') &&
			a.isPrototypeOf(c) && !b.isPrototypeOf(c);
	},
	"httpRequest()": function (done) {
		ht.httpRequest('http://myip.ipip.net', 'GET', '', null,
			function (error, data) { ht('divResult3').textContent = error ? JSON.stringify(error) : data.responseText; done(); }
		);
	},
	"httpRequestJson()": function (done) {
		ht.httpRequestJson('http://myip.ipip.net/json', 'GET', '', null,
			function (error, data) { ht('divResult3').textContent = JSON.stringify(error ? error : data.responseJson); done(); }
		);
	},

	"css .ht.cmd": function (done) {
		return "<span class='ht cmd'>cmd .ht cmd style sample</span>";
	},
	"css .ht.hover": function (done) {
		return "<span class='ht hover'>cmd .ht hover style sample</span>";
	},
	"css .ht.selected & setClass()": function (done) {
		return "<span class='ht selected'>css .ht.selected style sample</span>" +
			"<div><span>111 </span><span class='selected'>222 </span><span>333 </span><span class='selected'>444 </span>" +
			"<label><input type=checkbox onchange=\"var chs=parentNode.parentNode.childNodes;" +
			"ht.css.setByElement('selected',null,null,[chs[0],chs[1],chs[2],chs[3]]);\"></input>toggle</label>" +
			"</div>";
	},

	"check exports": function (done) {
		for (var i in ht) {
			if (typeof ht[i] === "undefined") { done("undefined: " + i); return; }
		}
		done(false);

		console.log(ht);
		var list = "export list: " + Object.keys(ht).join(", ");
		console.log(list);
		return list;
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('mocha-test', function () { for (var i in module.exports) { it(i, module.exports[i]); } });
