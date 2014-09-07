/*
 Morfana. JavaScript display engine for morphemic analysis in russian language
 http://morfana.ru
 http://github.com/kityan/morfana

 Copyright 2013-2014, Pavel Kityan (pavel@kityan.ru)
 Licensed under the MIT license.
 Version: 2.1.1b
 Build date: 7 September 2014
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

var development = {colorize: false, log: false, showTmpDiv: false};
var config = {}	;

// set default values
configure({
	autoStart: true, 			// start Morfana after loading complete
	freezeWord: false, 			// add vertical padding to word's span or "freeze" word in its inital place
	strokeWidth: 1.5,			//
	stroke: 'rgb(150,150,150)',
	disablePointerEvents: true,	// add pointer-events: none to each svg
	zeroEndingWidthFactor: 0.43
});

// Queue - array for processing words with setInterval()
var queue = [];

// DOM ready
$(document).ready(function(){
	// read user config
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



/**
 * Wrap letter into spans with paddings. Called by wrapPaddings().
 */
function wrapPadding(data, letterIndex, paddingType){
	var rng = rangy.createRange();
	rng.setStart(data.maps.actual[letterIndex].element, data.maps.actual[letterIndex].index);
	rng.setEnd(data.maps.actual[letterIndex].element, data.maps.actual[letterIndex].index+1);	
	var newNode = document.createElement('span');	
	var val = Math.ceil((paddingType == 'after')?(data.height * config['zeroEndingWidthFactor'] + 14):5);	// padding params in px
	var side = (paddingType != 'start') ? 'right' : 'left';
	$(newNode).css('padding-' + side, val + 'px');
	$(newNode).addClass('morfana-paddings morfana-paddings-' + side);
	rng.surroundContents(newNode);
	
	// rebuild map
	data.maps.actual = getLettersMap(data.obj);
}




/**
 * Create SVG for morpheme. Called by createImages().
 */
function createImage(data, morphemeType, range)//morphemeType, obj, start, stop, map)
{

	// create other signs of morphemes
	var x = data.metrics[range[0]].x;
	var w = (range[1] != null) ? data.metrics[range[1]].x + data.metrics[range[1]].w - data.metrics[range[0]].x : null;
	var hDiff = data.heightDiff;
	var h = data.height;
	
	var hm = 0.3;
	var part1, part2; 
	switch (morphemeType)
	{
		case 'ok':
			
			if (range[1] != null){		// morpheme 'ending'
				w = w + ((range[0] == range[1])?10:0);
				x = x + ((range[0] != range[1])?5:0);
				// compensate paddings for "ending"
				x-=5;
				if (range[0] != range[1]){
					x-=5; w+=10;
				}	
			} else {				// morpheme 'zero-ending'
				w = h*config['zeroEndingWidthFactor'] + 9;
				x = x + data.metrics[range[0]].w + 2;

				// we have 'ending' stop on this letter and 'zero-ending' after this letter. 
				// nonsense, but try to show it correctly.
				if (data.letters[range[0]].stop && data.letters[range[0]].stop['ok']){	
					x+=5;
				}
			}
			
			h*=1.35;
			part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.13)):(hDiff*.5-h*0.13)) + 'px; width: ' + w + 'px; height: ' + h + 'px;"';
			//part2 = '<path d="M '+(1.5)+' '+(h-2)+' L '+(w-3)+' '+(h-2)+' L '+(w-3)+' '+(2)+' L '+(3)+' '+(2)+' L '+(3)+' '+(h-1.5)+'"';
			part2 = '<rect x="' + config['strokeWidth'] + '" y="' + config['strokeWidth'] + '" width="' + (w*1 - config['strokeWidth']*2) + '" height="' + (h*1 - config['strokeWidth']*2) + '" ';
			
			break;
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
	return '<svg class="morfana-graphics" data-morfana-command="' + morphemeType + ':' + (range[0]+1) + '-' + ((range[1] == null) ? 0 : (range[1]+1)) + '" style="' + 
			(config['disablePointerEvents'] ? 'pointer-events: none; ' : '') + 'position: absolute; ' +
			part1 + 
			' xmlns="http://www.w3.org/2000/svg" version="1.1">' + 
			part2 + 
			' style="stroke:' + config['stroke'] + '; stroke-width:' + config['strokeWidth'] + '" fill="transparent" fill-opacity="0"/></svg>';
}






/**
 * Main processing 
 */

function process(data) {

	// remove previous elements if exist
	clear(data.obj);

	// get height of the whole word
	// use calculateMetrics() with justHeightReturnWordHeight set to true
	calculateMetrics(data, true);

	// add spans with paddings for morphemes "ending" and "zero-ending"
	wrapPaddings(data);
	
	// calculate metrics of letters
	calculateMetrics(data);
	
	// save metrics to word, for getLettersBounds() API
	data.obj.data('morfana-data-metrics', data.metrics);
	
	if (development.colorize){
		for (var i = 0, qty = data.metrics.length; i < qty; i++) {
			var color = (color != 'red') ? 'red' : 'blue';
			data.obj.append('<div class="morfana-development-colorize" style="position: absolute; top: ' + ((data.metrics[i].hDiff <= 0)?((data.metrics[i].h)):(data.metrics[i].hDiff*0.5 + data.metrics[i].h)) + 'px; left:' + data.metrics[i].x + 'px; width: ' + data.metrics[i].w  + 'px; height: 2px; line-height: 0; border: 0; padding: 0; margin: 0 ; background: ' + color + ';"></div>');
		}
	}

	
	// draw morphemes' signs
	var prependElements = createImages(data);
	

	// set styles for absolute positioning SVG elments inside word's element
	data.obj.css({
		'display': 'inline-block',
		'position': 'relative'
	});

	// compensate height of morhpemes if not deined in config
	if (!config['freezeWord']) {
		data.obj.css({
			'margin-top': (data.height * 0.85) + 'px',
			'margin-bottom': (data.height * 0.35) + 'px'
		});
	}

	// add SVG to DOM
	prependElements.forEach(function(elem){data.obj.prepend(elem);});
	
}



/**
 *	Calculate metrics of word: get height of word, x and width of each letter.
 */

function calculateMetrics(data, justHeightReturnWordHeight){

	var objHTML = data.obj.html();
	
	// creating temporary div inside word's element
	var tmpDiv = $('<div style="' + ((development.showTmpDiv)?"":"left: -1000px; visibility: hidden;") + 
			'width: auto; height: auto; position: absolute;" id="morfana_tmpDiv" />')
		.appendTo(data.obj)
		.html(objHTML);

	// setting line-height to normal, calculating word's height
	var h_lineHeightAsItWas = tmpDiv.height();	
	setAllChildren(tmpDiv, 'line-height', 'normal');
	data.height = tmpDiv.height();	
	data.heightDiff = h_lineHeightAsItWas - data.height;
	
	if (justHeightReturnWordHeight){
		tmpDiv.remove();
		return;
	}
	
	data.metrics = [];
	
	var rng = rangy.createRange(); 

	var tmpDiv_map = getLettersMap(tmpDiv);
	for (var i = tmpDiv_map.length - 1; i >= 0; i--){
		
		data.metrics[i] = {};

		tmpDiv.find('.morfana-paddings').each(function(){var obj = $(this); if (obj.text() == ''){obj.remove()}});		
		if (data.letters && (data.letters[i].stop['ok'] || data.letters[i].after['ok']) ){
			if (data.letters[i].stop['ok']){$(tmpDiv_map[i].element).unwrap();}
			if (data.letters[i].after['ok']){$(tmpDiv_map[i].element).unwrap();}
		}

		var newNode = document.createElement('span');	
		$(newNode).css('letter-spacing', 0);
		
		rng.setStart(tmpDiv_map[i].element, tmpDiv_map[i].index);
		rng.setEnd(tmpDiv_map[i].element, tmpDiv_map[i].index+1);
		rng.surroundContents(newNode);
		
		data.metrics[i].w = tmpDiv.width();
		rng.deleteContents();	
		
		data.metrics[i].x = tmpDiv.width();
		data.metrics[i].w = data.metrics[i].w - data.metrics[i].x;
		data.metrics[i].h = data.height;
		data.metrics[i].hDiff = data.heightDiff;
	}
	
	tmpDiv.remove();
	
}


/**
 *	Go through data.morphemes, call createImage() for each morpheme
*/
function createImages(data){
	// create SVG one by one
	var images = [];
	for (var m in data.morphemes) {
			for (var i=0, qty = data.morphemes[m].length; i < qty; i++) {
				if (!data.morphemes[m][i]){continue;}
				for (var j=0, qty2 = data.morphemes[m][i].length; j < qty2; j++) {
					images.push(createImage(data, m, data.morphemes[m][i][j].range));
				}
			}
	}
	return images;
}



/**
 * Go through data.letters  to find 'ending' and 'zero-endings' morphemes. Wrap letters into spans with paddings.
 */
function wrapPaddings(data){
	
	for (var i=0, qty = data.maps.inital.length; i < qty; i++){

		// left paddings first (!) important for unwrapping, 'cause we get metrics by cutting word from its the end
		if (data.letters[i].start['ok']) {
			// add padding after letter which is first in 'ending'
			wrapPadding(data,i,'start');
		}		
		
		if (data.letters[i].stop['ok']) {
			// add padding after letter which is last in 'ending'
			wrapPadding(data,i,'stop');
		}
		
		if (data.letters[i].after['ok']) {
			// add padding after letter which stands before 'zero-ending'
			wrapPadding(data,i,'after');
		}
	}

}





/**
 * [API] Get letters map. For each letter number in word we will have reference to element (if word has HTML tags inside) and index of letter in it or index in top word's element
 * Important: word shouldn't have CRLFs, tabs or spaces
 * [+] Пояснить про ударение и дефисы для разрыва по морфемам, что их тоже нужно учитывать.
 * @param {object} obj - jQuery object
 */
function getLettersMap(obj) {
	var map = [];

	(function createLettersMap(obj, shift){
		var qty = obj[0].childNodes.length;
		for (var i=0; i < qty; i++){
			var data = obj[0].childNodes[i].data;
			// is it text or HTML element?
			if (data == undefined){
				// go inside
				shift = createLettersMap($(obj[0].childNodes[i]), shift);
			} else {
				for (var j=0; j < data.length; j++)	{
					// map all letters of this fragment of word
					map[shift] = {'element': obj[0].childNodes[i], 'index': j};
					shift++;
				}
			}
		}
		return shift;
	})(obj, 0);

	return map;		
}




/**
 * Analyze markup of word, preparing arrays
 * @param {HTMLElement} el
 */
function preprocess(el) {

	// [+] var wordTxt = obj.text(); if (wordTxt.indexOf('́') > 0) {console.log(getAllIndexOf(wordTxt, ('́')));}
	
	var data = {};			// processing config for current queue element
	data.obj = $(el);	// jQuery object for word's element
	data.morphemes = {};	// by morpheme types
	data.letters = [];	// by letters indexes (for reverse association with morphemes)
	data.maps = {'inital': getLettersMap(data.obj)};	// inital letters map
	data.maps.actual = $.extend(true, [], data.maps.inital)	// extending for wrapPaddings()
	
	// how many letters in this word? We need total quantity to replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
	var totalLettersQty = data['maps']['inital'].length;

	for (var i=0; i < totalLettersQty; i++){
		data.letters[i] = {
			'start':{}, // morphemes which start on letter with this index
			'stop':{}, 	// morphemes which stop on letter with this index
			'after':{}	// morphemes which goes after letter with this index (e.g., zero-ending)
		}; 
	}	
	
	// clean "data-morfana-markup" value, splitting.
	// [+] do syntax check, throw errors. Allowed format: /(([a-zA-Z]+)\s*:\s*((\d+)\s*-\s*(\d+)|0))|(ok\s*:\s*\d)/
	// [+] remove duplicates ?
	
	var morphemes = data.obj.data('morfana-markup')
		.replace(/\s/g, "")
		.replace(/;$/, "")
		.split(";");
	
	// go throw array with strings (e.g., "ok:5-6", "ko:2-3", "ok:0", "ok:4")
	for (var i=0, qty = morphemes.length; i < qty; i++) {
		
		var _tmp = morphemes[i].split(":");
		var m = _tmp[0];
		var r = _tmp[1].split("-");
		
		// replace "ok:4" to "ok:4-0"
		if (!r[1]){r[1] = '0';}	
		
		// replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
		if (r[0] == '0'){r[0] = totalLettersQty; r[1] = '0';}	
		
		r[0]*=1;
		r[1]*=1;
		
		// data.morphemes
		
		// if we don't have array for these type of morpheme 
		if (!data.morphemes[m]){
			data.morphemes[m] = [];
		}			
		// if we don't have array for these type of morpheme and starting with these letter			
		if (!data.morphemes[m][r[0]-1]){
			data.morphemes[m][r[0]-1] = [];
		}			
		
		data.morphemes[m][r[0]-1].push({'name': m, 'range': [r[0]-1, (r[1] > 0) ? (r[1]-1) : null]}); 

		
		var startIndex, stopIndex;
		// data.letters
		if (r[1] == 0){	// 'zero-ending'
			startIndex = r[0] - 1;
			stopIndex = null;
			if (!data.letters[startIndex].after[m]){
				data.letters[startIndex].after[m] = [];
			}			
			data.letters[startIndex].after[m].push({'name': m, 'range': [startIndex, stopIndex]})
		} else {
			startIndex = r[0] - 1;
			stopIndex = r[1] - 1;			
			if (!data.letters[startIndex].start[m]){
				data.letters[startIndex].start[m] = [];
			}		
			data.letters[startIndex].start[m].push({'name': m, 'range': [startIndex, stopIndex]})
			
			if (!data.letters[stopIndex].stop[m]){
				data.letters[stopIndex].stop[m] = [];
			}					
			data.letters[stopIndex].stop[m].push({'name': m, 'range': [startIndex, stopIndex]})
		}
	}

	if (development.log){
		console.log(data.obj.text(), data);
	}

	
	// lets draw paddings, if we have any morphemes 'ok'
	process(data);
	
	return data;
}


/**
 * [API] Remove all elements inserted by Morfana
 */

function clear(selector){
	var obj = (!selector) ? $(document) : $(selector);
	if (development.colorize){
		obj.find(".morfana-development-colorize").remove();				// remove color label under letters
	}
	obj.removeData('morfana-markup');
	obj.removeData('morfana-data-metrics');
	obj.find(".morfana-graphics").remove();				// remove SVG
	obj.find(".morfana-paddings").contents().unwrap();	// unwrap wrapped for paddings
	return true;
}



/**
 * Set element's and all its parents' CSS property
 */
function setAllParents(obj, stopId, param, value) {
	if (obj.attr('id') != stopId) {
		obj.css(param, value);
		setAllParents(obj.parent(), stopId, param, value);
	}
}

/**
 * Set element's and all its children's CSS property
 */
function setAllChildren(obj, param, value) {
	obj.css(param, value);
	if (obj[0] && obj[0].children)	{
		var qty = obj[0].children.length;
		for (var i=0; i < qty; i++)		{
			setAllChildren($(obj[0].children[i]), param, value);
		}	
	}
}



/**
 * [API] Select elements and process them
 * If param "selector" is empty, Morfana selects all elements in DOM with attribute "data-morfana-markup". 
 * If param "selector" is not empty but selected elements hasn't attribute "data-morfana-markup", Morfana selects all children with attribute "data-morfana-markup".
 * If param "markup" is not empty, Morfana adds/replaces attribute "data-morfana-markup" with new value for each selected element
 * So, if param "markup" is not empty, all selected elements will have attribute "data-morfana-markup". Be careful!
 * @param {string} selector - selector for jQuery
 * @param {string} markup - value for adding/replacing element's attribute "data-morfana-markup".
 */
function draw (selector, markup) {
	if (selector) {
		if (markup) {
			$(selector).data('morfana-markup', markup);
		}
		$(selector).each(function(){
			var el = $(this);
			if (el.data('morfana-markup')) {
				enqueue.call(this);
			} else {
				el.find('[data-morfana-markup]').each(enqueue);
			}		
		});
	} else {
		$('[data-morfana-markup]').each(enqueue);
	}
	doQueue();
	return true;
}

/**
 * Enqueue element
 */
function enqueue() {
	queue.push(this);
}


/**
 * Process queue of elements. This function called with setTimeout() to prevent GUI freezing.
 */
function doQueue() {
	var qty = queue.length;
	if (qty > 0) {// are there any elements in queue?
		preprocess(queue.shift());
	}
	if (qty > 1) {	// more than 1 berfore queue.pop()?
		setTimeout(doQueue, 10);
	} 
}


/**
 * [API] Configure Morfana. 
 */
function configure(obj) {
	$.extend(true, config, obj);
}


/**
 * [API] Export metrics of word (e.g. for GUI used in morfanki.morfana.ru)
 */
function getLettersBounds(obj) {
	if (obj && obj.data()){
		if (obj.data('morfana-data-metrics')){
			return obj.data('morfana-data-metrics');
		} else {
			// word is clean, so there's no data-morfana-data-merics
			// lets calculate metrics
			var data = {maps: {}};
				data.obj = obj;
				data.maps.actual = getLettersMap(obj);
				calculateMetrics(data);
			return data.metrics;
		}
	return obj.data('morfana-data-metrics');
	} else {
		return [];
	}
}


// Exporting API
var Morfana = {};
Morfana.draw = draw;
Morfana.clear = clear;
Morfana.configure = configure;
Morfana.getLettersMap = getLettersMap;
Morfana.getLettersBounds = getLettersBounds;
return Morfana;

}));
