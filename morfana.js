/*
 Morfana. JavaScript display engine for morphemic analysis in russian language
 http://morfana.ru
 http://github.com/kityan/morfana

 Copyright 2013, Pavel Kityan (pavel@kityan.ru)
 Licensed under the MIT license.
 Version: 1.0.3a
 Build date: 4 November 2013
*/


(function( window ) {

var debug = false;
var config = {}	;

// default values
configure({
autoStart: true, 	// start Morfana after loading complete
freezeWord: false 	// add vertical padding to word's span or "freeze" word in its inital place
});

// array for processing words with setInterval()
var queue = new Array();

// order of processing
var processingOrder = ['ok', 'pr','ko', 'su', 'os', 'nullok'];

// morphemes' descriptions
var morfemsDescription = {pr: {name: 'приставка'}, ko: {name: 'корень'}, su: {name: 'суффикс'}, os: {name: 'основа'}, ok: {name: 'окончание'}}

// check for dependencies 
if (!window.jQuery) {return;}
if (!window.rangy) {return;}

// DOM ready
jQuery(document).ready(function(){
	// reading user config
   	var scripts = document.getElementsByTagName("script");
	for (var i = 0, qty = scripts.length; i < qty; i++) 
	{
	    var type = String(scripts[i].type).replace(/ /g,"");
		if (type.match(/^text\/x-morfana-config(;.*)?$/)) 
		{
			window.eval(scripts[i].innerHTML);
			scripts[i].innerHTML = '';
		}
    }

	// rangy init
	rangy.init();
	
	// autostart if not denied by user
	if (config['autostart']){draw();}
	
});

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

function preprocess(el)
{
	var obj = jQuery(el);

	// ищем все ударения, чтобы компенсировать в указателя на символы слова
	/*
	var wordTxt = obj.text();
	if (wordTxt.indexOf('́') > 0)
	{
		console.log(getAllIndexOf(wordTxt, ('́')));
	}
	*/
	
	var out = new Object();
	out['obj'] = obj;
	out['morfems'] = new Array();

	// cleaning data-morfana-markup value, splitting
	var morfems = obj.attr('data-morfana-markup').replace(/\s/g, "").split(";");
	var tmparr = new Object();
	for (var i=0, qty = morfems.length; i< qty; i++)
	{
		
		var tmp = morfems[i].split(":");
		if (tmp[1])
		{
			var arr = tmp[1].split("-");
			var m = tmp[0];
			// because of the start value for zero ending is 0, we should mark as "nullok" it for making correct order of processing
			if (m == 'ok' && arr[0] == 0){m = 'nullok';} 
		
			if (!tmparr[m])
			{
				// array for current morpheme
				tmparr[m] = new Array(); 
			}
			if (!tmparr[m][arr[0]])
			{
				// array for start for current morpheme
				tmparr[m][arr[0]] = new Array(); 
			}			
			// here we use strictly tmp[0] but not m, because "nullok" is only for making correct order of processing
			tmparr[m][arr[0]].push({name: tmp[0], range: arr}); 

		}
	}
	
	// creating correct order of processing
	for (i=0, qty = processingOrder.length; i< qty; i++)
	{	
		m = processingOrder[i];
		if (tmparr[m])
		{
			for (var k=0, qty2 = tmparr[m].length; k< qty2; k++)
			{	
				if (tmparr[m][k])
				{
					for (var j=0, qty3 = tmparr[m][k].length; j< qty3; j++)
					{	
						out['morfems'].push(tmparr[m][k][j]);
					}
				}
			}
		}
	}
	
	// 
	process(out);
	
}

/**
	Setting element's and all its children's CSS property
 */
function setAllChildren(obj, param, value)
{
	obj.css(param, value);
	var qty = obj[0].children.length;
	for (var i=0; i < qty; i++)
	{
		setAllChildren(jQuery(obj[0].children[i]), param, value);
	}	
}

/**
 * Wrapping symbols in morpheme "ok" with spans with padding-left and padding-right
 * @param {number} start - number of first morpheme's symbol (starting with 1)
 * @param {number} stop - number of last morpheme's symbol (starting with 1)
 * @param {boolean} left - if false, padding-right should be bigger than padding-left
 * @param {array} map - symbol map of word for rangy
 */

function wrapMorfanaPadding(start, stop, left, map, obj)
{
	if (start == 0){return;}

	if (!left)
	{
		var h = getMetrics(obj,start,stop, true);
	}

	var rng = rangy.createRange();
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);	
	var newNode = document.createElement('span');
	jQuery(newNode).css('padding-right',(left)?'5px':((h)+'px'));
	jQuery(newNode).addClass('morfana-paddings');

	rng.surroundContents(newNode);

	map = getLettersMap(obj);
	
	rng = rangy.createRange(); 
	rng.setStart(map[start-1]['obj'], map[start-1]['index']);
	rng.setEnd(map[start-1]['obj'], map[start-1]['index']+1);	
	newNode = document.createElement('span');
	if(left){jQuery(newNode).css('padding-left','5px');}
	jQuery(newNode).addClass('morfana-paddings');

	rng.surroundContents(newNode);

}


/**
 * Calculating word's height and morpheme's x and width
 */
 function getMetrics(obj,start,stop, returnHeight)
{
	var objHTML = obj.html();
	
	// creating temporary div inside word's element
	var tmpdv = $('<div style="' + ((debug)?"":"left: -1000px; visibility: hidden; border: 2px solid blue; ") + 'width: auto; height: auto; position: absolute;" id="tmpdv" />')
	obj.append(tmpdv); 
	
	// setting line-height to normal, calculating words's height
	tmpdv.html(objHTML);
	var h2 = tmpdv.height();	
	setAllChildren(tmpdv, 'line-height', 'normal');
	var h = tmpdv.height();	
	if (returnHeight){tmpdv.remove(); return h;}

	// calculationg morpheme's width and x
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
		tmpdv.find('.morfana-paddings').each(function(){var obj = jQuery(this); if (obj.text() == ''){obj.remove()}});
	}
	// сейчас в tmpdv содерджится фрагмент слова, ширина которого дает нам x+w
	// мы сбрасываем letter-spacing и padding-right последнего символа, чтобы  значок морфемы заканчивался на символе, а не после него
	
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);
	newNode = document.createElement('span');
	jQuery(newNode).css('letter-spacing','normal');
	rng.surroundContents(newNode);
	
	// this w value has x value inside
	var w = tmpdv.width();

	// calcaulating x value
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
	
	// clean w value
	w-=x;

	var hDiff = h2-h;
	return {w: w, h: h, x: x, hDiff: hDiff}
	
}

function process(p)
{
	var obj = p['obj'];

	// cleaning up after previous draw() 
	obj.find(".morfana-graphics").remove();
	obj.find(".morfana-paddings").contents().unwrap();

	var map = getLettersMap(obj);
	var prependElements = new Array();
	var h = getMetrics(obj, 1, map.length + 1, true);

	for (var i=0; i<p['morfems'].length; i++)
	{
		var prependElement;
		var m = p['morfems'][i];
		
		if (m['name'] != 'ok')
		{
			prependElement = createImage(m['name'], p['obj'], m['range'][0], m['range'][1]);
		}
		else
		{
			// is it zero ending?
			if (m['range'][0] == 0) 
			{
				wrapMorfanaPadding(map.length, map.length, false, map, obj)
			}
			else
			{
				wrapMorfanaPadding(m['range'][0], m['range'][1], true, map, obj)
			}
			// rebuilding map because of inserting spans width paddings
			map = getLettersMap(obj); 
			prependElement = createOk(p['obj'], m['range'][0], m['range'][1], map); 		
		}
		prependElements.push(prependElement);
	}

	obj.css('display', 'inline-block');
	obj.css('position', 'relative');
	if (!config['freezeWord'])
	{
		obj.css('margin-top', (h * 0.75) + 'px');
		obj.css('margin-bottom', (h * 0.35) + 'px'); // 0.35, createOs()
	}

	// prepending SVG to word's element
	for (var i=0; i<prependElements.length; i++)
	{
		obj.prepend(prependElements[i]);
	}

}

// 
function createOk(obj,start,stop, map)
{
	var nullOk = false;

	// zero ending at the end of word
	if (start == 0) 
	{
		start = 1;
		stop = map.length;
		nullOk = true;
	}
	

	var metrics = getMetrics(obj,start,stop);

	var h = metrics.h*1.4; 
	var w = (!nullOk)?(metrics.w + ((stop == start)?10:0)):(h * 0.3+10); 
	var x = (!nullOk)?(metrics.x + ((start!=stop)?5:0)):(metrics.w - h*.5 + 3); 
	var hDiff = metrics.hDiff;

	// компенсируем паддинги, поскольку будучи примененными к разным символам теряются, при таком методе рассчете ширины как сейчас 
	if ((stop - start) > 0 && !nullOk){w += 10; x-=5;} 

	// почему не rect?
	// "z-index: -1" в стиле svg позволяет сделать буквы внутри окончания доступными для мыши, но в ряде случаев окончания пропадают (см. wordpress). Решить проблему.
	return '<svg class="morfana-graphics"  style="position: absolute; left: ' + (x - 10) + 'px; top: ' + ((hDiff <= 0)?(-(h*0.13)):(hDiff*.5-h*0.13)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1">\
			<path d="M '+(2.5)+' '+(h-2)+' L '+(w-3)+' '+(h-2)+' L '+(w-3)+' '+(2)+' L '+(3)+' '+(2)+' L '+(3)+' '+(h-1.5)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/>\
			</svg>';
}

// all morphemes except "ok"
function createImage(morphemeType, obj, start, stop, map)
{
	var metrics = getMetrics(obj,start,stop);
	var w = metrics.w;  var h = metrics.h; var x = metrics.x; var hDiff = metrics.hDiff;
	var hm = 0.34;	
	switch (morphemeType)
	{
		case 'ko': return '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+2+' '+(h-2)+' C '+(w/3)+' '+h*.4+', '+(w*2/3)+' '+h*.4+', '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>';
		case 'su': return '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(2)+' '+(h-2)+' L '+(w/2)+' '+(h*0.5)+' L '+(w/2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>';
		case 'os': return '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(1.5)+' '+(1)+' L '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(1)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>';
		case 'pr': return '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(2)+' '+(h*0.5)+' L '+(w-2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>';
	}
}

function getLettersMap(obj)
{
	var map = new Array();

		(function createLettersMap(obj, shift)
		{
		var qty = obj[0].childNodes.length;
		for (var i=0; i < qty; i++)
		{
			var data = obj[0].childNodes[i].data;
			if (data == undefined)
			{
				  shift = createLettersMap(jQuery(obj[0].childNodes[i]), shift);
			}
			else
			{
			  for (var j=0;j < data.length; j++)
			  {	
				map[shift] = {obj: obj[0].childNodes[i], index: j};
				shift++;
			  }
			}

		}
		return shift;
		})(obj, 0);

	return map;	
}


function draw (el,markup)
{
	if (el)
	{
		if (markup != undefined)
		{
			jQuery(el).attr('data-morfana-markup', markup);
		}
		jQuery(el).each(enqueue);
	}
	else
	{
		jQuery('[data-morfana-markup]').each(enqueue);
	}
	
	queue.reverse();
	doQueue();
}

function enqueue() 
{
	queue.push(this);
}

function doQueue()
{
	var qty = queue.length;
	if (qty > 0)
		{
			preprocess(queue.pop())
		}
	if (qty > 1)
		{
			setTimeout(doQueue, 10);
		}
}


function getMorfemDescription(m)
{
	return morfemsDescription[m];
}

function configure (obj)
{
	for(prop in obj) { 
		var lc = prop.toLowerCase();
        config[lc] = obj[prop];
	} 	
}


// API
var Morfana = {};
Morfana.draw = draw;
Morfana.configure = configure;
Morfana.getLettersMap = getLettersMap;
Morfana.getMorfemDescription = getMorfemDescription;
window['Morfana'] = Morfana;

})( window );
