/* eslint-disable */

/*
 Morfana. JavaScript display engine for morphemic analysis in russian language
 http://morfana.ru
 http://github.com/kityan/morfana

 Copyright 2013-2014, Pavel Kityan (pavel@kityan.ru)
 Licensed under the MIT license.
 Version: 2.3.0b
 Build date: 29 September 2014
*/

(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jQuery", "rangy"], factory);
  } else if (typeof exports === "object") {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require("jQuery", "rangy"));
  } else {
    // Browser globals (root is window)
    // root.returnExports = factory(root.jQuery, root.rangy);
    root.Morfana = factory(root.jQuery, root.rangy);
  }
})(this, function($, rangy) {
  const development = { colorize: false, log: false, showTmpDiv: false };
  const config = {};
  let onQueueEmptyCallback;

  // set default values
  configure({
    autoStart: true, // start Morfana after DOM is ready
    freezeWord: false, // add vertical padding to word's span or "freeze" word in its inital place
    strokeWidth: 1.5, // px
    stroke: "rgb(150,150,150)",
    disablePointerEvents: true, // add 'pointer-events: none' to each svg
    zeroEndingWidthFactor: 0.7, // now: width of "zero-ending" = data.height * zeroEndingWidthFactor
    paddingFactor: 0.2, // now: width of padding for "ending" = data.height * paddingFactor
    stressMarksIgnored: false, // each stress mark should be counted as a symbol when defining a range for a command
    hyphensIgnored: true // each hyphen should be counted as a symbol when defining a range for a command
  });

  // Queue - array for processing words by setInterval()
  const queue = [];

  // DOM ready
  $(document).ready(function() {
    // read user config
    const scripts = document.getElementsByTagName("script");

    for (let i = 0, qty = scripts.length; i < qty; i++) {
      const type = String(scripts[i].type).replace(/ /g, "");

      if (type.match(/^text\/x-morfana-config(;.*)?$/)) {
        eval(scripts[i].innerHTML);
        scripts[i].innerHTML = "";
      }
    }

    // rangy init
    rangy.init();

    // autostart if not disabled by user
    if (config.autoStart) {
      draw();
    }
  });

  // clean "data-morfana-markup" value, splitting.
  // [+] do syntax check, throw errors. Allowed format: /(([a-zA-Z]+)\s*:\s*((\d+)\s*-\s*(\d+)|0))|(ok\s*:\s*\d)/
  // [+] remove duplicates ?
  function cleanMarkup(markup) {
    if (markup) {
      return markup.replace(/\s/g, "").replace(/;$/, "");
    }

    return markup;
  }

  /**
   * Create SVG for morpheme. Called by createImages().
   */
  function createImage(data, morphemeType, range) {
    // morphemeType, obj, start, stop, map)
    // create other signs of morphemes
    let { x } = data.metrics[range[0]];
    let w =
      range[1] != null
        ? data.metrics[range[1]].x +
          data.metrics[range[1]].w -
          data.metrics[range[0]].x
        : null;
    const hDiff = data.heightDiff;
    let h = data.height;

    const hm = 0.3;
    let part1;
    let part2;

    switch (morphemeType) {
      case "ok":
        var isLastLetter = !data.letters[range[0] + 1];
        var p = config.strokeWidth; // config['paddingFactor']*h;

        if (range[1] != null) {
          // morpheme 'ending'
          const ofs = (h * config.paddingFactor) / 2 + config.strokeWidth * 2;

          x -= ofs;
          w += ofs * 2;
        } else {
          // morpheme 'zero-ending'

          if (isLastLetter) {
            // is last word letter
            // x = x + data.metrics[range[0]].w + h*config['paddingFactor'];
            x =
              x +
              data.metrics[range[0]].w +
              (data.width - (x + data.metrics[range[0]].w)) / 2 -
              h * config.paddingFactor * 2;
          } else {
            // not last word letter
            x =
              x +
              data.metrics[range[0]].w +
              (data.metrics[range[0] + 1].x - (x + data.metrics[range[0]].w)) /
                2 -
              h * config.paddingFactor * 2;
          }

          w = h * config.zeroEndingWidthFactor + config.strokeWidth * 2;
          // we have 'ending' stop on this letter and 'zero-ending' after this letter.
          // nonsense, but try to show it correctly.
          if (data.letters[range[0]].stop && data.letters[range[0]].stop.ok) {
            x += (h * config.paddingFactor) / 2;
            if (isLastLetter) {
              x += h * config.paddingFactor - config.strokeWidth * 2.5;
            }
          }

          // but if after 'zero-ending' goes 'edning' again (nonsense too!) clear this:
          if (
            data.letters[range[0] + 1] &&
            data.letters[range[0] + 1].start &&
            data.letters[range[0] + 1].start.ok
          ) {
            x -= (h * config.paddingFactor) / 2;
          }
        }

        h *= 1.35;
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? -(h * 0.13) : hDiff * 0.5 - h * 0.13
        }px; width: ${w}px; height: ${h}px;"`;
        // part2 = '<path d="M '+(1.5)+' '+(h-2)+' L '+(w-3)+' '+(h-2)+' L '+(w-3)+' '+(2)+' L '+(3)+' '+(2)+' L '+(3)+' '+(h-1.5)+'"';
        part2 = `<rect x="${config.strokeWidth}" y="${
          config.strokeWidth
        }" width="${w * 1 - config.strokeWidth * 2}" height="${h * 1 -
          config.strokeWidth * 2}" `;

        break;

      case "ko":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? -(h * 0.85) : hDiff * 0.5 - h * 0.85
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${2} ${h - 2} C ${w / 3} ${h * 0.4}, ${(w * 2) /
          3} ${h * 0.4}, ${w - 2} ${h - 2}"`;
        break;

      case "su":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? -(h * 0.85) : hDiff * 0.5 - h * 0.85
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${2} ${h - 2} L ${w / 2} ${h * 0.5} L ${w / 2} ${h *
          0.5} L ${w - 2} ${h - 2}"`;
        break;

      case "pr":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? -(h * 0.85) : hDiff * 0.5 - h * 0.85
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${2} ${h * 0.5} L ${w - 2} ${h * 0.5} L ${w -
          2} ${h - 2}"`;
        break;

      case "po":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? -(h * 0.85) : hDiff * 0.5 - h * 0.85
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${2} ${h - 2} L ${2} ${h * 0.5} L ${w - 2} ${h *
          0.5}"`;
        break;

      case "os":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? h : hDiff * 0.5 + h
        }px; width: ${w}px; height: ${h}px;"`;
        // part1 = 'left: ' + x + 'px; top: ' + ((hDiff <= 0)?((h*0.8)):(hDiff*0.5+h)) + 'px; width: ' + (w) + 'px; height: ' + (h) + 'px;"';	// too close to letters?
        part2 = `<path d="M ${1.5} ${3} L ${1.5} ${h * hm} L ${w - 1.5} ${h *
          hm} L ${w - 1.5} ${3}"`;
        break;

      case "osL":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? h : hDiff * 0.5 + h
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${1.5} ${3} L ${1.5} ${h * hm} L ${w - 1.5} ${h *
          hm}"`;
        break;

      case "osR":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? h : hDiff * 0.5 + h
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${1.5} ${h * hm} L ${w - 1.5} ${h * hm} L ${w -
          1.5} ${3}"`;
        break;

      case "osC":
        part1 = `left: ${x}px; top: ${
          hDiff <= 0 ? h : hDiff * 0.5 + h
        }px; width: ${w}px; height: ${h}px;"`;
        part2 = `<path d="M ${1.5} ${h * hm} L ${w - 1.5} ${h * hm}"`;
        break;

      default:
        break;
    }

    return `<svg class="morfana-graphics" data-morfana-command="${morphemeType}:${range[0] + 1}-${range[1] == null ? 0 : range[1] + 1}" style="${config.disablePointerEvents ? "pointer-events: none; " : ""}position: absolute; ${part1} xmlns="http://www.w3.org/2000/svg" version="1.1">${part2} style="stroke:${config.stroke}; stroke-width:${config.strokeWidth}" fill="transparent" fill-opacity="0"/></svg>`;
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

    // set letter-spacing:0 for letters which followed by stress mark
    wrapBeforeStressMarks(data);

    // add spans with paddings for morphemes "ending" and "zero-ending"
    wrapPaddings(data);

    // calculate metrics of letters
    calculateMetrics(data);

    // save metrics to word, for getLettersBounds() API
    data.obj.data("morfana-data-metrics", data.metrics);

    if (development.colorize) {
      for (let i = 0, qty = data.metrics.length; i < qty; i++) {
        var color = color != "red" ? "red" : "blue";

        data.obj.append(
          `<div class="morfana-development-colorize" style="position: absolute; top: ${
            data.metrics[i].hDiff <= 0
              ? data.metrics[i].h
              : data.metrics[i].hDiff * 0.5 + data.metrics[i].h
          }px; left:${data.metrics[i].x}px; width: ${
            data.metrics[i].w
          }px; height: 2px; line-height: 0; border: 0; padding: 0; margin: 0 ; background: ${color};"></div>`
        );
      }
    }

    // draw morphemes' signs
    const prependElements = createImages(data);

    // set styles for absolute positioning SVG elments inside word's element
    data.obj.css({
      display: "inline-block",
      position: "relative"
    });

    // compensate height of morhpemes if not deined in config
    if (!data.config.freezeWord) {
      data.obj.css({
        "margin-top": `${data.height * 0.85}px`,
        "margin-bottom": `${data.height * 0.35}px`
      });
    }

    // add SVG to DOM
    prependElements.forEach(function(elem) {
      data.obj.prepend(elem);
    });
  }

  /**
   *	Calculate metrics of word: get height of word, x and width of each letter.
   */

  function calculateMetrics(data, justHeightReturnWordHeight) {
    const objHTML = data.obj.html();

    // creating temporary div inside word's element
    const tmpDiv = $(
      `<div style="font: inherit !important; letter-spacing: inherit !important;${
        development.showTmpDiv ? "" : "left: -1000px; visibility: hidden;"
      }width: auto; height: auto; position: absolute;" id="morfana_tmpDiv" />`
    )
      .appendTo(data.obj)
      .html(objHTML);

    // setting line-height to normal, calculating word's height
    const h_lineHeightAsItWas = tmpDiv.height();

    setAllChildren(tmpDiv, "line-height", "normal");
    data.width = tmpDiv.width(); // width of whole word
    data.height = tmpDiv.height();
    data.heightDiff = h_lineHeightAsItWas - data.height;

    if (justHeightReturnWordHeight) {
      tmpDiv.remove();

      return;
    }

    data.metrics = [];

    const rng = rangy.createRange();

    const tmpDiv_map = getLettersMap(tmpDiv);

    for (let i = tmpDiv_map.length - 1; i >= 0; i--) {
      data.metrics[i] = {};

      tmpDiv.find(".morfana-paddings").each(function() {
        const obj = $(this);

        if (obj.text() == "") {
          obj.remove();
        }
      });
      if (
        data.letters &&
        (data.letters[i].stop.ok || data.letters[i].after.ok)
      ) {
        if (data.letters[i].stop.ok) {
          $(tmpDiv_map[i].element).unwrap();
        }
        if (data.letters[i].after.ok) {
          $(tmpDiv_map[i].element).unwrap();
        }
      }

      const newNode = document.createElement("span");

      $(newNode).css("letter-spacing", 0);

      rng.setStart(tmpDiv_map[i].element, tmpDiv_map[i].index);
      rng.setEnd(tmpDiv_map[i].element, tmpDiv_map[i].index + 1);
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
  function createImages(data) {
    // create SVG one by one
    const images = [];

    for (const m in data.morphemes) {
      for (let i = 0, qty = data.morphemes[m].length; i < qty; i++) {
        if (!data.morphemes[m][i]) {
          continue;
        }
        for (let j = 0, qty2 = data.morphemes[m][i].length; j < qty2; j++) {
          images.push(createImage(data, m, data.morphemes[m][i][j].range));
        }
      }
    }

    return images;
  }

  /**
   * Go through data.letters  to find 'ending' and 'zero-endings' morphemes. Wrap letters into spans with paddings.
   */
  function wrapPaddings(data) {
    for (let i = 0, qty = data.maps.actual.length; i < qty; i++) {
      // left paddings first (!) important for unwrapping, 'cause we get metrics by cutting word from its the end
      if (data.letters[i].start.ok) {
        // add padding after letter which is first in 'ending'
        wrapPadding(data, i, "start");
      }

      if (data.letters[i].stop.ok) {
        // add padding after letter which is last in 'ending'
        wrapPadding(data, i, "stop");
      }

      if (data.letters[i].after.ok) {
        // add padding after letter which stands before 'zero-ending'
        wrapPadding(data, i, "after");
      }
    }
  }

  /**
   * Wrap letter into spans with paddings. Called by wrapPaddings().
   */
  function wrapPadding(data, letterIndex, paddingType) {
    const rng = rangy.createRange();

    rng.setStart(
      data.maps.actual[letterIndex].element,
      data.maps.actual[letterIndex].index
    );
    rng.setEnd(
      data.maps.actual[letterIndex].element,
      data.maps.actual[letterIndex].index + 1
    );
    const newNode = document.createElement("span");
    const val = Math.ceil(
      paddingType == "after"
        ? data.height * config.zeroEndingWidthFactor +
            data.height * config.paddingFactor +
            config.strokeWidth * 2
        : data.height * config.paddingFactor + config.strokeWidth
    ); // padding params in px

    const side = paddingType != "start" ? "right" : "left";

    $(newNode).css(`padding-${side}`, `${val}px`);
    $(newNode).addClass(`morfana-paddings morfana-paddings-${side}`);
    rng.surroundContents(newNode);

    // rebuild map
    data.maps.actual = getLettersMap(data.obj);
  }

  /**
   * Wrap letter into spans with letter-spacing: 0. Called by wrapBeforeStressMarks().
   */
  function wrapBeforeStressMark(data, letterIndex) {
    const rng = rangy.createRange();

    rng.setStart(
      data.maps.actual[letterIndex].element,
      data.maps.actual[letterIndex].index
    );
    rng.setEnd(
      data.maps.actual[letterIndex].element,
      data.maps.actual[letterIndex].index + 1
    );
    const newNode = document.createElement("span");

    $(newNode).css("letter-spacing", "0");
    $(newNode).addClass("morfana-antistress");
    rng.surroundContents(newNode);

    // rebuild map
    data.maps.actual = getLettersMap(data.obj);
  }

  /**
   * Go through data.letters  to find stress marks. Wrap letters before into spans with letter-spacing: 0.
   */
  function wrapBeforeStressMarks(data) {
    for (let i = 0, qty = data.maps.inital.length; i < qty; i++) {
      if (data.maps.inital[i].symbol.charCodeAt(0) == 769 && i > 0) {
        wrapBeforeStressMark(data, i - 1);
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
    const map = [];

    (function createLettersMap(obj, shift) {
      const qty = obj[0].childNodes.length;

      for (let i = 0; i < qty; i++) {
        const { data } = obj[0].childNodes[i];

        // is it text or HTML element?
        if (data == undefined) {
          // go inside
          shift = createLettersMap($(obj[0].childNodes[i]), shift);
        } else {
          for (let j = 0; j < data.length; j++) {
            // map all letters of this fragment of word
            map[shift] = {
              element: obj[0].childNodes[i],
              index: j,
              symbol: data[j]
            };
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

    const data = {}; // processing config for current queue element

    data.obj = $(el); // jQuery object for word's element
    data.config = { freezeWord: config.freezeWord }; // per word config
    data.morphemes = {}; // by morpheme types
    data.letters = []; // by letters indexes (for reverse association with morphemes)
    data.maps = { inital: getLettersMap(data.obj) }; // inital letters map
    data.maps.actual = $.extend(true, [], data.maps.inital); // extending for wrapPaddings(), wrapBeforeSressMarks()

    // how many letters in this word? We need total quantity to replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
    const totalLettersQty = data.maps.inital.length;

    // per word configuration: freezeWord
    if (data.obj.data("morfana-config")) {
      const wordConfig = cleanMarkup(data.obj.data("morfana-config")).split(
        ";"
      );

      for (var i = 0, qty = wordConfig.length; i < qty; i++) {
        var _tmp = wordConfig[i].split(":");

        if (_tmp[0] == "freezeWord") {
          if (_tmp[1] == "false") {
            data.config.freezeWord = false;
          } else if (_tmp[1] == "true") {
            data.config.freezeWord = true;
          }
        }
      }
    }

    for (var i = 0; i < totalLettersQty; i++) {
      data.letters[i] = {
        start: {}, // morphemes which start on letter with this index
        stop: {}, // morphemes which stop on letter with this index
        after: {} // morphemes which goes after letter with this index (e.g., zero-ending)
      };
    }

    const morphemes = cleanMarkup(data.obj.data("morfana-markup")).split(";");

    // go throw array with strings (e.g., "ok:5-6", "ko:2-3", "ok:0", "ok:4")
    for (var i = 0, qty = morphemes.length; i < qty; i++) {
      var _tmp = morphemes[i].split(":");
      const m = _tmp[0];
      const r = _tmp[1].split("-");

      // replace "ok:4" to "ok:4-0"
      if (!r[1]) {
        r[1] = "0";
      }

      // replace "ok:0" and "ok:0-0" to "ok:{totalLettersQty}-0"
      if (r[0] == "0") {
        r[0] = totalLettersQty;
        r[1] = "0";
      }

      r[0] *= 1;
      r[1] *= 1;

      // data.morphemes

      // if we don't have array for these type of morpheme
      if (!data.morphemes[m]) {
        data.morphemes[m] = [];
      }
      // if we don't have array for these type of morpheme and starting with these letter
      if (!data.morphemes[m][r[0] - 1]) {
        data.morphemes[m][r[0] - 1] = [];
      }

      data.morphemes[m][r[0] - 1].push({
        name: m,
        range: [r[0] - 1, r[1] > 0 ? r[1] - 1 : null]
      });

      var startIndex;
      var stopIndex;

      // data.letters
      if (r[1] == 0) {
        // 'zero-ending'
        startIndex = r[0] - 1;
        stopIndex = null;
        if (!data.letters[startIndex].after[m]) {
          data.letters[startIndex].after[m] = [];
        }
        data.letters[startIndex].after[m].push({
          name: m,
          range: [startIndex, stopIndex]
        });
      } else {
        startIndex = r[0] - 1;
        stopIndex = r[1] - 1;
        if (!data.letters[startIndex].start[m]) {
          data.letters[startIndex].start[m] = [];
        }
        data.letters[startIndex].start[m].push({
          name: m,
          range: [startIndex, stopIndex]
        });

        if (!data.letters[stopIndex].stop[m]) {
          data.letters[stopIndex].stop[m] = [];
        }
        data.letters[stopIndex].stop[m].push({
          name: m,
          range: [startIndex, stopIndex]
        });
      }
    }

    if (development.log) {
      console.log(data.obj.text(), data);
    }

    // lets draw paddings, if we have any morphemes 'ok'
    process(data);

    return data;
  }

  /**
   * [API] Remove all elements inserted by Morfana
   */

  function clear(selector) {
    const obj = !selector ? $(document) : $(selector);

    if (development.colorize) {
      obj.find(".morfana-development-colorize").remove(); // remove color label under letters
    }
    obj.removeData("morfana-markup");
    obj.removeData("morfana-data-metrics");
    obj.find(".morfana-graphics").remove(); // remove SVG
    obj
      .find(".morfana-paddings")
      .contents()
      .unwrap(); // unwrap wrapped for paddings
    obj
      .find(".morfana-antistress")
      .contents()
      .unwrap(); // unwrap wrapped for letter-spacing before stress marks

    return true;
  }

  /**
   * Set element's and all its parents' CSS property
   */
  function setAllParents(obj, stopId, param, value) {
    if (obj.attr("id") !== stopId) {
      obj.css(param, value);
      setAllParents(obj.parent(), stopId, param, value);
    }
  }

  /**
   * Set element's and all its children's CSS property
   */
  function setAllChildren(obj, param, value) {
    obj.css(param, value);
    if (obj[0] && obj[0].children) {
      const qty = obj[0].children.length;

      for (let i = 0; i < qty; i++) {
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
  function draw(selector, markup, callback) {
    onQueueEmptyCallback = callback || undefined;
    if (selector) {
      if (markup) {
        $(selector).data("morfana-markup", markup);
      }
      $(selector).each(function() {
        const el = $(this);

        if (el.data("morfana-markup")) {
          enqueue.call(this);
        } else {
          el.find("[data-morfana-markup]").each(enqueue);
        }
      });
    } else {
      $("[data-morfana-markup]").each(enqueue);
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
    const qty = queue.length;

    if (qty > 0) {
      // are there any elements in queue?
      preprocess(queue.shift());
    }
    if (qty > 1) {
      // more than 1 berfore queue.pop()?
      setTimeout(doQueue, 10);
    } else {
      // queue empty
      if (onQueueEmptyCallback && typeof onQueueEmptyCallback === "function") {
        onQueueEmptyCallback();
        onQueueEmptyCallback = undefined;
      }
    }
  }

  /**
   * [API] Configure Morfana.
   */
  function configure(obj) {
    $.extend(true, config, obj);
    config.strokeWidth = parseFloat(config.strokeWidth);
  }

  /**
   * [API] Export metrics of word (e.g. for GUI used in morfanki.morfana.ru)
   */
  function getLettersBounds(obj) {
    if (obj && obj.data()) {
      if (obj.data("morfana-data-metrics")) {
        return obj.data("morfana-data-metrics");
      }
      // word is clean, so there's no data-morfana-data-merics
      // lets calculate metrics
      const data = { maps: {} };

      data.obj = obj;
      data.maps = { inital: getLettersMap(data.obj) }; // inital letters map
      data.maps.actual = $.extend(true, [], data.maps.inital); // extending for wrapBeforeSressMarks()
      wrapBeforeStressMarks(data);
      calculateMetrics(data);

      return data.metrics;

      return obj.data("morfana-data-metrics");
    }

    return [];
  }

  /**
   * [API] converts markup
   */
  function convertMarkup(text, markup, from, to) {
    if (from == "STRESS_MARKS_IGNORED" && to == "STRESS_MARKS_NOT_IGNORED") {
      // convert markup from markup which was made for word without stress marks to markup for word with stress marks added
      let markupConverted = "";
      const stressMark = String.fromCharCode(769);
      const indexes = [];
      let i = -1;

      while ((i = text.indexOf(stressMark, i + 1)) != -1) {
        indexes.push(i);
      }
      const cmds = cleanMarkup(markup).split(";");

      for (let j = 0, qty = cmds.length; j < qty; j++) {
        const cmd = cmds[j].split(":");
        const range = cmd[1].split("-");

        for (let k = 0, qty2 = indexes.length; k < qty2; k++) {
          if (range[0] && range[0] > indexes[k]) {
            range[0]++;
          }
          if (range[1] && range[1] > indexes[k]) {
            range[1]++;
          }
        }
        markupConverted += `${cmd[0]}:${range[0]}${
          typeof range[1] !== "undefined" ? `-${range[1]}` : ""
        };`;
      }
      console.log(markup, markupConverted);

      return cleanMarkup(markupConverted);
    }
  }

  // Exporting API
  const Morfana = {};

  Morfana.draw = draw;
  Morfana.clear = clear;
  Morfana.configure = configure;
  Morfana.getLettersMap = getLettersMap;
  Morfana.getLettersBounds = getLettersBounds;
  Morfana.convertMarkup = convertMarkup;

  return Morfana;
});
