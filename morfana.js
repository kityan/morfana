/*
 Morfana. JavaScript display engine for morphemic analysis in russian language
 http://morfana.ru
 http://github.com/kityan/morfana

 Copyright 2013-2014, Pavel Kityan (pavel@kityan.ru)
 Licensed under the MIT license.
 Version: 1.1.2a
 Build date: 25 July 2014
*/

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jQuery', 'rangy'], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(require('jQuery', 'rangy'));
	} else {
		// Browser globals (root is window)
		// root.returnExports = factory(root.jQuery, root.rangy);
		root.Morfana = factory(root.jQuery, root.rangy);
	}
}(this, function ($, rangy) {

var debug = false;
var config = {}	;

// set default values
configure({
autoStart: true, 	// start Morfana after loading complete
freezeWord: false, 	// add vertical padding to word's span or "freeze" word in its inital place
strokeWidth: 1.5	//
});

// Queue - array for processing words with setInterval()
var queue = new Array();

/* 
	Order of morfems processing. This config used to reorder markup.
	It's important, because some morpheme signs need paddings (e.g., 'ok'). These must be done before next morfeme signs calculations.
	Going to use regex later, cause 'ok' and 'ok_2' should be processed togeater in right order (by letter positions).
	
	So, later: 'osL', 'osC', 'osR' =>  /os(L|C|R)* /
*/
var processingOrder = ['ok', 'pr', 'po', 'ko', 'su', 'osL', 'osC', 'osR', 'os'];


// morphemes' descriptions
// var morfemsDescription = {pr: {name: 'приставка'}, ko: {name: 'корень'}, su: {name: 'суффикс'}, os: {name: 'основа'}, ok: {name: 'окончание'}}

// DOM ready
$(document).ready(function(){
	// reading user config
   	var scripts = document.getElementsByTagName("script");
	for (var i = 0, qty = scripts.length; i < qty; i++) 
	{
	    var type = String(scripts[i].type).replace(/ /g,"");
		if (type.match(/^text\/x-morfana-config(;.*)?$/)) 
		{
			eval(scripts[i].innerHTML);
			scripts[i].innerHTML = '';
		}
    }

	// rangy init
	rangy.init();
	
	// autostart if not denied by user
	if (config['autoStart']){draw();}
});


// ---------------------------------------------------------------------------------------------------------------------
// not refactored
// ---------------------------------------------------------------------------------------------------------------------



/*
function getAllIndexOf(str, symbol)
{
	var arr = new Array();
	(function getNextIndex(start){
		var index = str.indexOf(symbol, start);
		if (index > 0)
		{
			arr.push(index);
			getNextIndex(index+1);
		}
	})(0);
	return arr;
}
*/



/**
 * Calculating word's height and morpheme's x and width
 */
function getMetrics(obj, start, stop, returnHeight, savePaddings)
{

	var objHTML = obj.html();
	
	// creating temporary div inside word's element
	var tmpdv = $('<div style="' + ((debug)?"":"left: -1000px; visibility: hidden;") + 'width: auto; height: auto; position: absolute;" id="morfana_tmpdv" />')
	obj.append(tmpdv); 
	
	// setting line-height to normal, calculating word's height
	tmpdv.html(objHTML);
	var h2 = tmpdv.height();	
	setAllChildren(tmpdv, 'line-height', 'normal');
	var h = tmpdv.height();	
	
	// optimzing, get only height and return
	if (returnHeight) {
		tmpdv.remove(); 
		return h;
	}

	// calculating morpheme's width and x
	tmpdv.html(objHTML);
	var map = getLettersMap(tmpdv);
	var li = map.length - 1;
	var newNode;
	var rng = rangy.createRange(); 
	// cutting word's part we don't need
	if ((stop - 1) < li)
	{
		rng.setStart(map[stop]['obj'], map[stop]['index']);
		rng.setEnd(map[li]['obj'], map[li]['index']+1);
		rng.deleteContents();
		// cleaning up after rng.deleteContents()
		tmpdv.find('.morfana-paddings').each(function(){var obj = $(this); if (obj.text() == ''){obj.remove()}});
	}
	// сейчас в tmpdv содерджится фрагмент слова, ширина которого дает нам x+w
	// мы сбрасываем letter-spacing и padding-right последнего символа, чтобы  значок морфемы заканчивался на символе, а не после него
	
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);
	newNode = document.createElement('span');
	$(newNode).css('letter-spacing','normal');
	rng.surroundContents(newNode);
	
	// вот здесь бы должны пойти рекурсивно наверх вплоть до tmpdv и убирать padding-right у каждого родителя
	// перед этим конечно сейвить HTML
	// var savedHTML = tmpdv.html();
	if (!savePaddings) {
		setAllParents($(newNode), 'morfana_tmpdv', 'padding-right', '0px');
		// а left?
	}
	
	// this w value has x value inside
	var w = tmpdv.width();
	
	// если наш стоп находится на последней букве, тогда на и в x не нужен padding-right
	if (stop < map.length)
	{
		//tmpdv.html(savedHTML);
	}

	// calculating x value
	if (start == 1)
	{
		var x = 0;
	}
	else
	{
		// rebuilding map
		var map = getLettersMap(tmpdv);
		rng.setStart(map[start-1]['obj'], map[start-1]['index']);
		rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);
		rng.deleteContents();
		
		var x = tmpdv.width();
	}
	
	tmpdv.remove();
	
	
	// cleaning w value
	w-=x;

	var hDiff = h2-h;
	return {w: w, h: h, x: x, hDiff: hDiff}

}


// 
function createOk(obj,start,stop, map)
{
	var isZeroEndingEndWord = (stop == 0 && start == map.length);
	var isZeroEndingInsideWord = (stop == 0 && start != map.length);	
	
	// if any tipe of "zero" ending, our fragment starts from first letter and ends with "start"
	if (isZeroEndingEndWord || isZeroEndingInsideWord) 	{
		stop = start*1;
		start = 1;
	}	

	var metrics = getMetrics(obj, start, stop, false, true);

	var h = metrics.h*1.35;  
	var w = (!isZeroEndingEndWord && !isZeroEndingInsideWord)?(metrics.w + ((stop == start)?10:0)):(h * 0.3+10); 
	var x = (!isZeroEndingEndWord && !isZeroEndingInsideWord)?(metrics.x + ((start!=stop)?5:0)):(metrics.w - h*.5 + 3); 
	if (isZeroEndingEndWord || isZeroEndingInsideWord){x = metrics.w - w/1.30 + 9*15/h;} 
	// поэтому тут надо бы метрику брать дважды - с учетом паддинга символ после которого стоит окончание и следующий! и по разнице!

	var hDiff = metrics.hDiff;

	
	var xDiff = 10; // padding * 2 		// move to getMetrics()?
	var wDiff = 10; // padding * 2		// move to getMetrics()?

	
	// compensate paddings
	if (isZeroEndingEndWord || isZeroEndingInsideWord) {
		x -= (xDiff);
	} else {
		
		if ((stop - start) == 0){
			if (start == 1){
				w -= wDiff;
			} else {
				x -= xDiff;
			}
		} else {
			if (start > 1){
				x -= xDiff*1.5;
				w += wDiff;
			} else {
				x -= (xDiff/2);
			}
		}
		
	}


	return '<svg class="morfana-graphics"  style="pointer-events: none; position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.13)):(hDiff*.5-h*0.13)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1">\
			<path d="M '+(2.5)+' '+(h-2)+' L '+(w-3)+' '+(h-2)+' L '+(w-3)+' '+(2)+' L '+(3)+' '+(2)+' L '+(3)+' '+(h-1.5)+'" style="stroke:rgb(150,150,150); stroke-width: ' + config['strokeWidth'] + '" fill="transparent" fill-opacity="0"/>\
			</svg>';
}




// ---------------------------------------------------------------------------------------------------------------------
// refactoring
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Wrapping symbols in morpheme "ending" with spans with padding-left and padding-right
 * @param {number} start - number of first morpheme's symbol (starting with 1)
 * @param {number} stop - number of last morpheme's symbol (starting with 1)
 * @param {array} map - symbol map of word for rangy
 */

function wrapMorfanaPadding(start, stop, map, obj) {

	var isZeroEndingEndWord = (stop == 0 && start == map.length);
	var isZeroEndingInsideWord = (stop == 0 && start != map.length);
	
	// if so, our word part starts from first letter and ends with "start"
	if (isZeroEndingEndWord || isZeroEndingInsideWord) 	{
		stop = start*1;
		start = 1;
	}

	// get height of word
	var h = getMetrics(obj, start, stop, true, false);

	// get last fragment element
	var rng = rangy.createRange();
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);	
	var newNode = document.createElement('span');
	var val = Math.ceil((isZeroEndingInsideWord || isZeroEndingEndWord)?(h * 0.4 + 13):5);
	$(newNode).css('padding-right', val + 'px');
	$(newNode).addClass('morfana-paddings');
	rng.surroundContents(newNode);

	// we need padding-left for left part
	if (!isZeroEndingEndWord && !isZeroEndingInsideWord) {
		// refresh map
		map = getLettersMap(obj);
	
		val = 5;
		rng = rangy.createRange(); 
		rng.setStart(map[start-1]['obj'], map[start-1]['index']);
		rng.setEnd(map[start-1]['obj'], map[start-1]['index']+1);	
		newNode = document.createElement('span');
		$(newNode).css('padding-left', val + 'px');
		$(newNode).addClass('morfana-paddings');
		rng.surroundContents(newNode);
	}

}


function clear(selector)
{
	var obj = (!selector) ? $(document) : $(selector);

	// clean up previous Morfana.draw() inserts
	obj.find(".morfana-graphics").remove();				// remove SVG
	obj.find(".morfana-paddings").contents().unwrap();	// unwrap wrapped for paddings
	
	return true;
}

/**
 * Processing morphemes 
 * @param {object} p - object: {obj: (jQuery Object for HTMLElement), morfems: [{name: (morpheme's name), range: [(start), (stop)]}, …]
 */

function process(p) {

	clear(p.obj);

	// get word's map 
	var map = getLettersMap(p.obj);
	
	// initalize of SVG elements to be prepended
	var prependElements = new Array();
	
	// get height of the whole word
	var h = getMetrics(p.obj, 1, map.length + 1, true);

	// create SVG one by one
	for (var i=0, qty = p['morfems'].length; i < qty; i++) {
		var m = p['morfems'][i];
		if (m['name'] == 'ok') // if morpheme is "(zero) ending" then we need paddings
		{
			wrapMorfanaPadding(m['range'][0], m['range'][1], map, p.obj)
			map = getLettersMap(p.obj); // refresh map because we added spans with paddings
		}
		prependElements.push(createImage(m['name'], p['obj'], m['range'][0], m['range'][1], map));
	}

	p.obj.css({
		display: 'inline-block',
		position: 'relative'
	});

	
	// do we need to compensate height?
	if (!config['freezeWord']) {
		p.obj.css('margin-top', (h * 0.85) + 'px');
		p.obj.css('margin-bottom', (h * 0.35) + 'px');
	}

	// prepending SVG into word's element
	prependElements.forEach(function(elem){p.obj.prepend(elem);});

}



/**
 * Create SVG for morpheme
 * @param {string} morphemeType - type of morpheme
 * @param {object} obj - jQuery object (single HTML Element)
 * @param {int} start - start letter
 * @param {int} stop - stop letter
 * @param {array} map - letters map
 */
function createImage(morphemeType, obj, start, stop, map)
{
	
	// Create morpheme sign for "(zero) ending"
	if (morphemeType == 'ok') {
		return createOk(obj, start, stop, map);
	}

	// Create other morpheme signs
	var metrics = getMetrics(obj,start,stop, false, false);
	var w = metrics.w;  var h = metrics.h; var x = metrics.x; var hDiff = metrics.hDiff;
	var hm = 0.3;
	var part1, part2; 
	switch (morphemeType)
	{
		case 'ko': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.85)):(hDiff*0.5-h*.85)) + 'px; width: ' + w + 'px; height: ' + h + 'px;"';
			part2 = '<path d="M '+2+' '+(h-2)+' C '+(w/3)+' '+h*.4+', '+(w*2/3)+' '+h*.4+', '+(w-2)+' '+(h-2)+'"';
			break;
		case 'su': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.85)):(hDiff*0.5-h*.85)) + 'px; width: ' + w + 'px; height: ' + h + 'px;"';
			part2 = '<path d="M '+(2)+' '+(h-2)+' L '+(w/2)+' '+(h*0.5)+' L '+(w/2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'"';
			break;
		case 'pr': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.85)):(hDiff*0.5-h*.85)) + 'px; width: ' + w + 'px; height: ' + h + 'px;"';
			part2 = '<path d="M '+(2)+' '+(h*0.5)+' L '+(w-2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'"';
			break;
		case 'po': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.85)):(hDiff*0.5-h*.85)) + 'px; width: ' + w + 'px; height: ' + h + 'px;"';
			part2 = '<path d="M '+(2)+' '+(h-2)+' L '+(2)+' '+(h*0.5)+' L '+(w-2)+' '+(h*0.5)+'"';		
			break;
		case 'os': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';
			//part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h*0.8)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';	// too close to letters?
			part2 = '<path d="M '+(1.5)+' '+(3)+' L '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(3)+'"';
			break;
		case 'osL': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';
			part2 = '<path d="M '+(1.5)+' '+(3)+' L '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+ '"';
			break;
		case 'osR': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';
			part2 = '<path d="M '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(3)+'"';
			break;
		case 'osC': 
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';
			part2 = '<path d="M '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+'"';
			break;
	}
	return '<svg class="morfana-graphics" style="position: absolute; ' +
			part1 + 
			' xmlns="http://www.w3.org/2000/svg" version="1.1">' + 
			part2 + 
			' style="stroke:rgb(150,150,150); stroke-width:' + config['strokeWidth'] + '" fill="transparent" fill-opacity="0"/></svg>';
}



// ---------------------------------------------------------------------------------------------------------------------
//  refactored
// ---------------------------------------------------------------------------------------------------------------------


/**
 * Get letters map - for each letter number in word we will have referance to element (if word has HTML tags inside) and index of letter in it
 * Important: word shouldn't have CRLFs, tabs or spaces
 * [+] Пояснить про ударение и дефисы для разрыва по морфемам, что их тоже нужно учитывать.
 * @param {object} obj - jQuery object
 */
function getLettersMap(obj)
{
	var map = new Array();

	(function createLettersMap(obj, shift)
	{
		var qty = obj[0].childNodes.length;
		for (var i=0; i < qty; i++)
		{
			var data = obj[0].childNodes[i].data;
			// is it text or HTML element?
			if (data == undefined)
			{
				// go inside
				shift = createLettersMap($(obj[0].childNodes[i]), shift);
			}
			else
			{
				for (var j=0; j < data.length; j++)
				{
					// map all letters of this fragment of word
					map[shift] = {obj: obj[0].childNodes[i], index: j};
					shift++;
				}
			}
		}
		return shift;
		})(obj, 0);

	// cleaning the map if word has "non-letter" elements (for example, if this function called from getLettersBounds() when the word element has SVG elements appended already)
	
	var _map = [];
	for (var i=0, qty = map.length; i < qty; i++)
	{
		if (map[i].obj.data.match(/[^\s]/)){
			_map.push(map[i]);
		}
	}
		
	return _map;	
}


/**
 * Prepare correct order of morphemes to draw
 * @param {HTMLElement} el
 */
function preprocess(el)
{
	var obj = $(el);

	// [?]
	// ищем все ударения, чтобы компенсировать в указателя на символы слова
	// var wordTxt = obj.text(); if (wordTxt.indexOf('́') > 0) {console.log(getAllIndexOf(wordTxt, ('́')));}
	
	var out = new Object();
	out['obj'] = obj;
	out['morfems'] = new Array();

	// cleaning data-morfana-markup value, splitting
	// [+] do syntax check, throw errors. Allowed format: /(([a-zA-Z]+)\s*:\s*((\d+)\s*-\s*(\d+)|0))|(ok\s*:\s*\d)/
	var morfems = obj.attr('data-morfana-markup').replace(/\s/g, "").split(";");
	var tmparr = new Object();
	
	// how many letters in this word? We need total quantity to replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
	var totalLettersQty = obj.text().length;
	
	// go throw array with strings (e.g., "ok:5-6", "ko:2-3", "ok:0", "ok:4")
	for (var i=0, qty = morfems.length; i < qty; i++)
	{
		var tmp = morfems[i].split(":");
		if (tmp[1])
		{
			var arr = tmp[1].split("-");
			// m - type of morefeme
			var m = tmp[0];

			if (!tmparr[m])	// if we don't have array for current type of morpheme 
			{
				// array for current type of morpheme 
				tmparr[m] = new Array(); 
			}
			
			if (m == 'ok') {
				// replace "ok:4" to "ok:4-0"
				if (!arr[1]) {
					arr[1] = "0";
				}
				// replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
				if (arr[0] == '0') 
				{
					arr[0] = totalLettersQty; 
					arr[1] = "0";
				}				
			}

			
			
			if (!tmparr[m][arr[0]])	// if we don't have array for these type of morpheme and starting with these letter
			{
				// array for current type of morpheme and current start position
				tmparr[m][arr[0]] = new Array(); 
			}			
			tmparr[m][arr[0]].push({name: tmp[0], range: arr}); 
		}
	}
	
	/* 
		Now, from "ko:1-4;su:5-6;ok:0" we have:
		
		{
			"ko": [
					null, 
					[
						{"name": "ko", "range": ["1","4"]}
					]
				],
			"su": [
					null,null,null,null,null,
					[
						{"name": "su", "range": ["5","6"]}
					]
				],		
			"ok": [
					null,...null,
					[	
						{"name": "ok", "range": ["0"]}
					]
				]
		}
						
		OK! Lets process in correct order. Endings - first, because they change word's width by adding paddings.
	*/	
	
	
	// creating correct order of processing
	for (i=0, qty = processingOrder.length; i < qty; i++)
	{	
		// m - type of morefeme from global array "processingOrder"
		m = processingOrder[i];
		
		// do we have such morpheme?
		if (tmparr[m])
		{
			for (var k=0, qty2 = tmparr[m].length; k < qty2; k++)
			{	
				if (tmparr[m][k]) // if not null
				{
					for (var j=0, qty3 = tmparr[m][k].length; j< qty3; j++)
					{	
						out['morfems'].push(tmparr[m][k][j]);
					}
				}
			}
		}
	}
	
	// now we have correct order in "out"
	// lets draw
	process(out);

}



/**
	Set element's and all its parents' CSS property
 */
function setAllParents(obj, stopId, param, value)
{
	if (obj.attr('id') != stopId)
	{
		obj.css(param, value);
		setAllParents(obj.parent(), stopId, param, value);
	}
}

/**
	Set element's and all its children's CSS property
 */
function setAllChildren(obj, param, value)
{
	obj.css(param, value);
	if (obj[0] && obj[0].children)
	{
		var qty = obj[0].children.length;
		for (var i=0; i < qty; i++)
		{
			setAllChildren($(obj[0].children[i]), param, value);
		}	
	}
}


/**
 * Select elements to process
 * If param "selector" is empty, Morfana selects all elements in DOM with attribute "data-morfana-markup". 
 * If param "selector"  is not empty but hasn't attribute "data-morfana-markup", Morfana selects all children with attribute "data-morfana-markup".
 * If param "markup" is not empty, Morfana adds/replaces attribute "data-morfana-markup" with new value for each selected element
 * So, if param "markup" is not empty, all selected elements will have attribute "data-morfana-markup". Be careful!
 * @param {string} selector - selector for jQuery
 * @param {string} markup - value for adding/replacing element's attribute "data-morfana-markup".
 */
function draw (selector, markup)
{
	if (selector)
	{
		if (markup)
		{
			$(selector).attr('data-morfana-markup', markup);
		}
		$(selector).each(processSelectedElement);
	}
	else
	{
		$('[data-morfana-markup]').each(enqueue);
	}
	
	doQueue();
	
	return true;
}

/**
 * If element has attribute "data-morfana-markup" it will be added to queue.
 * If not - all its children with attribute "data-morfana-markup" will be added to queue.
 */
function processSelectedElement()
{
	var el = $(this);
	if (el.attr('data-morfana-markup'))
	{
		queue.push(this);
	}
	else
	{
		el.find('[data-morfana-markup]').each(enqueue);
	}
}


/**
 * Enqueue element
 */
function enqueue() 
{
	queue.push(this);
}


/**
 * Process queue of elements.
 * This function called with setTimeout() to prevent GUI freezing.
 */
function doQueue()
{
	var qty = queue.length;
	if (qty > 0)	// are there any elements in queue?
	{
		preprocess(queue.shift());
	}
	if (qty > 1)	// more than 1 berfore queue.pop()?
	{
		setTimeout(doQueue, 10);
	}
}


/**
 * [API] Configuring Morfana. 
 */
function configure(obj)
{
	$.extend(true, config, obj);
}


/**
 * [API] Will be used for interactive editing
 */
/* 
function getMorfemDescription(m)
{
	return morfemsDescription[m];
}
*/

/**
 * [API] Get x and x+width for each letter
 */
function getLettersBounds(obj)
{
	var metrics = [];
	var map_dirty = getLettersMap(obj);
	
	for (var i = 0, qty = map_dirty.length; i < qty; i++)
	{
		metrics.push(getMetrics(obj, i+1, i+1, false, false));
	}
	
	return metrics;
}


// Exporting API
var Morfana = {};
Morfana.draw = draw;
Morfana.clear = clear;
Morfana.configure = configure;
Morfana.getLettersMap = getLettersMap;
Morfana.getLettersBounds = getLettersBounds;
//Morfana.getMorfemDescription = getMorfemDescription;
return Morfana;

}));
