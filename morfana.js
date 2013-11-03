/*
 Morfana. JavaScript display engine for morphemic analysis in russian language
 http://morfana.ru
 http://github.com/kityan/morfana

 Copyright 2013, Pavel Kityan (pavel@kityan.ru)
 Licensed under the MIT license.
 Version: 1.0.2a
 Build date: 4 November 2013
*/


(function( window ) {

var debug = true;

// умолчания
var config = {
autostart: true, 	// запуск разметки сразу
freezeWord: false	// добавлять вертикальное смещение слов (для случая, когда слова в тексте и разметка может залезть на другие строки) или нет (т.е. заморозить слово, что удобно для интерактива)
};

// массив для асинхронной обработки
var queue = new Array();

// описание морфем
var morfemsDescription = {pr: {name: 'приставка'}, ko: {name: 'корень'}, su: {name: 'суффикс'}, os: {name: 'основа'}, ok: {name: 'окончание'}}

if (!window.jQuery) {return;}
if (!window.rangy) {return;}

jQuery( document ).ready(function() {

	// чтение конфига
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

	// инициализация rangy
	rangy.init();
	
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
	var morfems = obj.attr('data-morfana-markup').split(";");
	var tmparr = new Object();
	for (var i=0, qty = morfems.length; i< qty; i++)
	{
		
		// добавить trim-ы!
		var tmp = morfems[i].split(":");
		if (tmp[1])
		{
			var arr = tmp[1].split("-");
			var m = tmp[0];
			if (m == 'ok' && arr[0] == 0){m = 'nullok';} 
			// чтобы обработать отдельно - в самую последнюю очередь, после окончаний (если основа включает окончание в сложном слове)
			// таким образом мы полчим массив массивов, обрабатывая который имеем упорядоченный набор (т.е. окончания пойдут в порядке следования)
			
			if (!tmparr[m])
			{
				// созадем массив для морфемы
				tmparr[m] = new Array(); 
			}
			if (!tmparr[m][arr[0]])
			{
				// созадем массив для морфемы для номера буквы в слове (могут несколько одинаковых морфемы (хотя не должны) и неодинаковых (например основа слова и приставка) начинаться с одного символа)
				tmparr[m][arr[0]] = new Array(); 
			}			
			// здесь именно tmp[0], а не m, поскольку 'nullok' нам нужен только для упорядочивания
			tmparr[m][arr[0]].push({name: tmp[0], range: arr}); 

		}
	}
	
	// порядок обработки морфем 
	var order = ['ok', 'pr','ko', 'su', 'os', 'nullok'];
	
	for (i=0, qty = order.length; i< qty; i++)
	{	
		m = order[i];
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
	
	// собственно, сама разметка
	process(out);
	
}

/**
	Установка для элемента и всех вложенных свойства CSS
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
 * Оборачиваем символы морфемы "окончание" в span с padding-left и padding-right
 * @param {number} start - первый символ морфемы по порядку в слове (нумерация - с единицы)
 * @param {number} stop - последний символ морфемы по порядку в слове (нумерация - с единицы)
 * @param {boolean} left - Отступы и слева и справа. Если нет, тогда только справа - увеличенный. Это значит, что окончание "нулевое", а следовательно надо дать отступ побольше, перед следующим словом
 * @param {array} map - Карта символов для работы rangy
 */

function wrapMorfanaPadding(start, stop, left, map, obj)
{
	if (start == 0){return;}

	if (!left)
	{
		// [2do] высоту брать в одном месте! в process
		var metrics = getMetrics(obj,start,stop);
	}

	var rng = rangy.createRange();
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);	
	var newNode = document.createElement('span');
	jQuery(newNode).css('padding-right',(left)?'5px':((metrics.h)+'px'));
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
	Установка для всех родительских элементов obj вплоть до stopParent
 */
function setAllParents(obj, param, value, stopParent)
{
	obj.css(param, value);
	if (obj.parent()[0] != stopParent[0])
	{
		setAllParents(obj.parent(), param, value, stopParent);
	}
}


/**
 * Функция расчета метрик слова целиком или морфемы: высоты, ширины, смещения морфемы относительно начала слова
 */
 function getMetrics(obj,start,stop, savePaddings)
{
	var objHTML = obj.html();
	
	// временый элемент внутри элемента со словом, для метрик
	var tmpdv = $('<div style="' + ((debug)?"":"visibility: hidden; border: 2px solid blue; ") + 'width: auto; height: auto; position: absolute; left: 0px;" id="tmpdv" />')
	obj.append(tmpdv); 
	
	// определяем высоту всего слова, принудительно установив line-height в normal
	tmpdv.html(objHTML);
	var h2 = tmpdv.height();	
	setAllChildren(tmpdv, 'line-height', 'normal');
	var h = tmpdv.height();	
	

	// определяем смещение и ширину участка слова, заданного start/stop
	//alert(objHTML)
	tmpdv.html(objHTML);
	var map = getLettersMap(tmpdv);
	var li = map.length - 1;
	var newNode;
	
	var rng = rangy.createRange(); 
	
	// отсекаем лишнее от слова, если нужно
	if ((stop - 1) < li)
	{
		rng.setStart(map[stop]['obj'], map[stop]['index']);
		rng.setEnd(map[li]['obj'], map[li]['index']+1);	
		rng.deleteContents();
		// зачищаем остатки, которые не убирает rng.deleteContents()
		tmpdv.find('.morfana-paddings').each(function(){var obj = jQuery(this); if (obj.text() == ''){obj.remove()}});
	}
	
	// сейчас в tmpdv содерджится фрагмент слова, ширина которого дает нам x+w
	// мы сбрасываем letter-spacing и padding-right последнего символа, чтобы  значок морфемы заканчивался на символе, а не после него
	
	rng.setStart(map[stop-1]['obj'], map[stop-1]['index']);
	rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);
	newNode = document.createElement('span');
	jQuery(newNode).css('letter-spacing','normal');
	rng.surroundContents(newNode);
	
	// здесь в w пока содержится x
	var w = tmpdv.width();

	// ищем x
	if (start == 1)
	{
		var x = 0;
	}
	else
	{
		// требуется новая карта
		var map = getLettersMap(tmpdv);
		rng.setStart(map[start-1]['obj'], map[start-1]['index']);
		rng.setEnd(map[stop-1]['obj'], map[stop-1]['index']+1);
		rng.deleteContents();
		var x = tmpdv.width();
	}
	tmpdv.remove();
	w-=x;

	var hDiff = h2-h;
	return {w: w, h: h, x: x, hDiff: hDiff}
	
}

function process(p)
{
var obj = p['obj'];

// зачищаем от предыдущей отрисовки
// [!] нужно заменить на удалению добавленных "обёрток" вообще, чтобы не росло дерево при многократных обработках

obj.find(".morfana-graphics").remove();
obj.find(".morfana-paddings").css('padding-right', '0px');
obj.find(".morfana-paddings").css('padding-left', '0px');
obj.find(".morfana-paddings").removeClass('morfana-paddings');	

var map = getLettersMap(obj);

var prependElements = new Array();
var h;

for (var i=0; i<p['morfems'].length; i++)
{
	var tmp;
	var m = p['morfems'][i];
	
	if (m['name'] != 'ok')
	{
		tmp = createImage(m['name'], p['obj'], m['range'][0], m['range'][1]);
	}
	else
	{
		if (m['range'][0] == 0) // если нулевое окончание
		{
			wrapMorfanaPadding(map.length, map.length, false, map, obj)
		}
		else
		{
			wrapMorfanaPadding(m['range'][0], m['range'][1], true, map, obj)
		}
		map = getLettersMap(obj); // требуется пересчет карты, поскольку окончание оборачивает в span
		tmp = createOk(p['obj'], m['range'][0], m['range'][1], map); 		
	}
	
	h = tmp['h'];
	prependElements.push(tmp['str']);
}

// устанавливаем для слова свойства CSS
obj.css('display', 'inline-block');
obj.css('position', 'relative');
if (!config['freezeWord'])
{
	obj.css('margin-top', (h * 0.75) + 'px');
	obj.css('margin-bottom', (h * 0.35) + 'px'); // 0.35 - см. createOs()
}

// запихиваем SVG в слово
for (var i=0; i<prependElements.length; i++)
{
	obj.prepend(prependElements[i]);
}

}

// окончание
function createOk(obj,start,stop, map)
{
var nullOk = false;

if (start == 0) // т.е. нулевое окончание
{
	start = 1;
	stop = map.length;
	nullOk = true;
}

var metrics = getMetrics(obj,start,stop, true);

var h = metrics.h*1.4; 
var w = (!nullOk)?(metrics.w + ((stop == start)?10:0)):(h * 0.3+10); 
var x = (!nullOk)?(metrics.x + ((start!=stop)?5:0)):(metrics.w - h*.5 + 3); 
var hDiff = metrics.hDiff;

// компенсируем паддинги, поскольку будучи примененными к разным символам теряются, при таком методе рассчете ширины как сейчас 
if ((stop - start) > 0 && !nullOk){w += 10; x-=5;} 

// почему не rect?
// "z-index: -1" в стиле svg позволяет сделать буквы внутри окончания доступными для мыши, но в ряде случаев окончания пропадают (см. wordpress). Решить проблему.
return {h: metrics.h, str:'<svg class="morfana-graphics"  style="position: absolute; left: ' + (x - 10) + 'px; top: ' + ((hDiff <= 0)?(-(h*0.13)):(hDiff*.5-h*0.13)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1">\
<path d="M '+(2.5)+' '+(h-2)+' L '+(w-3)+' '+(h-2)+' L '+(w-3)+' '+(2)+' L '+(3)+' '+(2)+' L '+(3)+' '+(h-1.5)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/>\
</svg>'};

}


// остальные морфемы
function createImage(morphemeType, obj, start, stop, map)
{
var metrics = getMetrics(obj,start,stop);
var w = metrics.w;  var h = metrics.h; var x = metrics.x; var hDiff = metrics.hDiff;
var hm = 0.34;	
switch (morphemeType)
{
	case 'ko': return {h: h, str: '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+2+' '+(h-2)+' C '+(w/3)+' '+h*.4+', '+(w*2/3)+' '+h*.4+', '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>'};
	case 'su': return {h: h, str: '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(2)+' '+(h-2)+' L '+(w/2)+' '+(h*0.5)+' L '+(w/2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>'};
	case 'os': return {h: h, str: '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(1.5)+' '+(1)+' L '+(1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(h*hm)+' L '+(w-1.5)+' '+(1)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>'};
	case 'pr': return {h: h, str: '<svg class="morfana-graphics"  style="position: absolute; left: ' + x + 'px; top: ' + ((hDiff <= 0)?(-(h*0.75)):(hDiff*0.5-h*.75)) + 'px; width: ' + w + 'px; height: ' + h + 'px;" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M '+(2)+' '+(h*0.5)+' L '+(w-2)+' '+(h*0.5)+' L '+(w-2)+' '+(h-2)+'" style="stroke:rgb(150,150,150);stroke-width:1.5" fill="transparent"/></svg>'};
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


function draw (el,markup){
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
	
	// разворачиваем массив очереди для FIFO
	queue.reverse();
	doQueue();
}

function enqueue() {queue.push(this);}

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

function configure (obj){
	for(prop in obj) { 
               config[prop] = obj[prop];
	} 	
}


// create global object, export API
var Morfana = {};
Morfana.draw = draw;
Morfana.configure = configure;
Morfana.getLettersMap = getLettersMap;
Morfana.getMorfemDescription = getMorfemDescription;
window['Morfana'] = Morfana;

})( window );
