"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var Morfana = /** @class */ (function () {
    function Morfana(_a) {
        var config = _a.config;
        this.config = {
            freezeWord: false,
            strokeWidth: 1.5,
            strokeColor: 'rgb(150,150,150)',
            disablePointerEvents: true,
            zeroEndingWidthFactor: 0.7,
            paddingFactor: 0.2,
            stressMarksIgnored: false,
            hyphensIgnored: true,
            itemsDelimeter: ';',
            keyValDelimeter: ':',
            rangeDelimeter: '-',
            zeroEndingSymbol: ' '
        };
        this.config = __assign(__assign({}, this.config), config);
    }
    /**
     * Parse markup string e.g. "ro:1-5;en:6-8;st:1-5;" into array "ro:1-5", "en:6-8", "st:1-5"
     *
     * @param {{ markup: Markup, config?: PartialConfig }} { markup, config = this.config }
     * @returns {MarkupElements}
     * @memberof Morfana
     */
    Morfana.prototype.parseMarkup = function (_a) {
        var markup = _a.markup, _b = _a.config, config = _b === void 0 ? this.config : _b;
        var itemsDelimeter = config.itemsDelimeter;
        var markupElements = markup.split(itemsDelimeter);
        return markupElements;
    };
    Morfana.prototype.prepareMarkupData = function (_a) {
        var markupElements = _a.markupElements, 
        // maxCoordinate,
        _b = _a.config, 
        // maxCoordinate,
        config = _b === void 0 ? this.config : _b;
        var keyValDelimeter = config.keyValDelimeter, rangeDelimeter = config.rangeDelimeter;
        var markupData = markupElements.map(function (item) {
            var _a = item.split(keyValDelimeter), key = _a[0], value = _a[1];
            var range = value.split(rangeDelimeter);
            return { type: key, range: range };
        });
        return markupData;
    };
    /**
     * Prepare word for parsing (add zero ending symbol)
     *
     * @param {{ word: Word, config?: PartialConfig }} { word, config = this.config }
     * @returns {PreparedWord}
     * @memberof Morfana
     */
    Morfana.prototype.prepareWord = function (_a) {
        var word = _a.word, _b = _a.config, config = _b === void 0 ? this.config : _b;
        var zeroEndingSymbol = config.zeroEndingSymbol;
        var preparedWord = word.endsWith(zeroEndingSymbol) ? word : "" + word + zeroEndingSymbol;
        return preparedWord;
    };
    return Morfana;
}());
exports["default"] = Morfana;
