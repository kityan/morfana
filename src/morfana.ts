import { getSymbolsMap } from './utils'
import {
  Config,
  PartialConfig,
  MarkupPartialConfig,
  Markup,
  MarkupElements,
  MarkupDataItem,
  MarkupData,
  Word,
  PreparedWord,
  SymbolsMap,
  MorphemesTypes,
  ErrorsLogLevel,
  Logger,
  MorphemeRange,
  MorphemeRangeString,
} from './types'
import { DEFAULT_CONFIG } from './data/config'

/**
 * Class with util methods for working with morpheme markup
 *
 * @export
 * @class Morfana
 */
export class Morfana {
  config: Config = DEFAULT_CONFIG

  constructor(config: PartialConfig = {}) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Set instance config
   *
   * @param {PartialConfig} config
   * @memberof Morfana
   */
  setConfig = (config: PartialConfig): void => {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get instance config
   *
   * @returns {Config}
   * @memberof Morfana
   */
  getConfig = (): Config => {
    return this.config
  }

  /**
   * Log error or other message
   *
   * @param {string} message
   * @param {(PartialConfig & MarkupPartialConfig & { errorsLogLevel: ErrorsLogLevel })} [config=this.config]
   * @returns {void}
   * @memberof Morfana
   */
  log = (
    message: string,
    level?: ErrorsLogLevel,
    config: PartialConfig & MarkupPartialConfig & { errorsLogLevel: ErrorsLogLevel; logger: Logger } = this.config
  ): void => {
    const { errorsLogLevel, logger } = config

    const logLevel = level || errorsLogLevel

    if (logLevel === 'error') {
      logger.error(message)
    }

    if (logLevel === 'warn') {
      logger.warn(message)

      return undefined
    }

    if (logLevel === 'info') {
      logger.info(message)

      return undefined
    }

    return undefined
  }

  /**
   * Check validity of markup elements string e.g. "ro:1-5", return valid values
   *
   * @param {({
   *     markupElements: MarkupElements
   *     config?: PartialConfig & MarkupPartialConfig & { morphemesTypesMap: MorphemesTypes }
   *   })} {
   *     markupElements,
   *     config = this.config,
   *   }
   * @returns {MarkupElements}
   * @memberof Morfana
   */
  validateMarkup = ({
    markupElements,
    config = this.config,
  }: {
    markupElements: MarkupElements
    config?: PartialConfig & MarkupPartialConfig & { morphemesTypesMap: MorphemesTypes }
  }): MarkupElements => {
    const { markupKeyValDelimeter, markupRangeDelimeter, morphemesTypesMap } = config
    const morphemesTypesUnion = Object.values(morphemesTypesMap).join('|')
    const elementRegex = new RegExp(
      `^((${morphemesTypesUnion}))(${markupKeyValDelimeter})(\\d+${markupRangeDelimeter}\\d+)$`,
      'ig'
    )
    const invalidElements: Array<string> = []
    const validElements = markupElements.filter((el) => {
      const match = el.match(elementRegex)

      if (!match) {
        invalidElements.push(el)
      }

      return match
    })

    if (invalidElements.length > 0) {
      this.log(`Invalid markup elements: ${invalidElements.join(', ')}`)
    }

    return validElements
  }

  /**
   * Parse markup string e.g. "ro:1-5;en:6-8;st:1-5;" into array "ro:1-5", "en:6-8", "st:1-5"
   *
   * @param {{ markup: Markup, config?: PartialConfig }} { markup, config = this.config }
   * @returns {MarkupElements}
   * @memberof Morfana
   */
  parseMarkup = ({
    markup,
    config = this.config,
  }: {
    markup: Markup
    config?: MarkupPartialConfig
  }): MarkupElements => {
    const { markupItemsDelimeter } = config

    const trimmedMarkup = markup.endsWith(markupItemsDelimeter) ? markup.slice(0, -1) : markup

    if (trimmedMarkup.length === 0) {
      return [] as MarkupElements
    }

    const markupElements = trimmedMarkup.split(markupItemsDelimeter)

    const validMarkupElements = this.validateMarkup({ markupElements, config })

    return validMarkupElements
  }

  /**
   * Parse morpheme range string
   *
   * @memberof Morfana
   */
  parseRange = ({
    rangeString,
    config = this.config,
  }: {
    rangeString: MorphemeRangeString
    config?: PartialConfig & {
      markupRangeDelimeter: Config['markupRangeDelimeter']
    }
  }): MorphemeRange => {
    const [rangeStart, rangeEnd] = rangeString.split(config.markupRangeDelimeter).map((i) => parseInt(i))

    return [rangeStart, rangeEnd]
  }

  /**
   * Serialize morpheme range
   *
   * @memberof Morfana
   */
  serializeRange = ({
    range,
    config = this.config,
  }: {
    range: MorphemeRange
    config?: PartialConfig & {
      markupRangeDelimeter: Config['markupRangeDelimeter']
    }
  }): MorphemeRangeString => {
    return range.join(config.markupRangeDelimeter)
  }

  /**
   * Prepare markup data, e.g. from array of 'ro:1-5'
   * to array of { type: 'ro', range: [1, 5] }
   *
   * @param {({
   *     markupElements: MarkupElements
   *     config?: PartialConfig & {
   *       markupKeyValDelimeter: Config['markupKeyValDelimeter']
   *       markupRangeDelimeter: Config['markupRangeDelimeter']
   *     }
   *   })} {
   *     markupElements,
   *     config = this.config,
   *   }
   * @returns {MarkupData}
   * @memberof Morfana
   */
  getMarkupData = ({
    markupElements,
    config = this.config,
  }: {
    markupElements: MarkupElements
    config?: PartialConfig & {
      markupKeyValDelimeter: Config['markupKeyValDelimeter']
      markupRangeDelimeter: Config['markupRangeDelimeter']
    }
  }): MarkupData => {
    const { markupKeyValDelimeter } = config

    const markupData = markupElements.map((item) => {
      const [key, value] = item.split(markupKeyValDelimeter)
      const [rangeStart, rangeEnd] = this.parseRange({ rangeString: value, config })

      return { type: key, range: [rangeStart, rangeEnd] } as MarkupDataItem
    })

    return markupData
  }

  /**
   * Prepare word for parsing (add zero ending symbol)
   *
   * @param {{ word: Word, config?: PartialConfig }} { word, config = this.config }
   * @returns {PreparedWord}
   * @memberof Morfana
   */
  prepareWord = ({
    word,
    config = this.config,
  }: {
    word: Word
    config?: PartialConfig & { zeroEndingSymbol: Config['zeroEndingSymbol'] }
  }): PreparedWord => {
    const { zeroEndingSymbol } = config

    const preparedWord = word.endsWith(zeroEndingSymbol) ? word : `${word}${zeroEndingSymbol}`

    return preparedWord
  }

  /**
   * Get symbols map with morhpemes data
   *
   * @param {PreparedWord} [word='']
   * @param {MarkupData} markupData
   * @returns {SymbolsMap}
   */
  getSymbolsMap = getSymbolsMap

  /**
   * Process markup and word to get symbols map
   * and markup data for the markup display
   *
   * @param {{ word: Word, markup: Markup, config?: PartialConfig }} { word, markup, config = this.config }
   * @returns {{ symbolsMap: SymbolsMap, markupData: MarkupData}}
   * @memberof Morfana
   */
  process = ({
    word,
    markup,
    config = this.config,
  }: {
    word: Word
    markup: Markup
    config?: MarkupPartialConfig
  }): { symbolsMap: SymbolsMap; markupData: MarkupData } => {
    const preparedWord = this.prepareWord({ word, config })
    const markupElements = this.parseMarkup({ markup, config })
    const markupData = this.getMarkupData({ markupElements, config })
    const symbolsMap = this.getSymbolsMap(preparedWord, markupData)

    return { symbolsMap, markupData }
  }

  /**
   *  Get markup string from markupData
   *
   * @param {{
   *     markupData: MarkupData
   *     config?: MarkupPartialConfig
   *   }} {
   *     markupData,
   *     config = this.config,
   *   }
   * @returns {Markup}
   * @memberof Morfana
   */
  getMarkupFromMarkupData = ({
    markupData,
    config = this.config,
  }: {
    markupData: MarkupData
    config?: MarkupPartialConfig
  }): Markup => {
    const { markupKeyValDelimeter, markupItemsDelimeter } = config
    const markupElements: MarkupElements = []

    markupData.reduce((acc, { type, range }) => {
      const rangeString = this.serializeRange({ range, config })
      const item = `${type}${markupKeyValDelimeter}${rangeString}`

      acc.push(item)

      return acc
    }, markupElements)
    const markup = markupElements.join(markupItemsDelimeter)

    return markup
  }
}

export default Morfana
