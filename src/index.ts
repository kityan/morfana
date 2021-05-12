import { MorphemeType } from './data/index'

type Config = Required<{
  freezeWord: boolean
  strokeWidth: number
  strokeColor: string
  disablePointerEvents: boolean
  zeroEndingWidthFactor: number
  paddingFactor: number
  stressMarksIgnored: boolean
  hyphensIgnored: boolean
  itemsDelimeter: string
  keyValDelimeter: string
  rangeDelimeter: string
  zeroEndingSymbol: string
}>

type PartialConfig = Partial<Config>

type Markup = string

type MarkupElement = string

type MarkupElements = MarkupElement[]

type MorphemeRange = [number, number]

type MarkupDataItem = {
  type: MorphemeType
  range: MorphemeRange
}
type MarkupData = MarkupDataItem[]

type Word = string

type PreparedWord = string

class Morfana {
  config: Config = {
    freezeWord: false, // add vertical padding to word's span or "freeze" word in its inital place
    strokeWidth: 1.5, // px
    strokeColor: 'rgb(150,150,150)',
    disablePointerEvents: true, // add 'pointer-events: none' to each svg
    zeroEndingWidthFactor: 0.7, // now: width of "zero-ending" = data.height * zeroEndingWidthFactor
    paddingFactor: 0.2, // now: width of padding for "ending" = data.height * paddingFactor
    stressMarksIgnored: false, // each stress mark should be counted as a symbol when defining a range for a command
    hyphensIgnored: true, // each hyphen should be counted as a symbol when defining a range for a command
    itemsDelimeter: ';',
    keyValDelimeter: ':',
    rangeDelimeter: '-',
    zeroEndingSymbol: ' ',
  }

  constructor({ config }: { config: PartialConfig }) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Parse markup string e.g. "ro:1-5;en:6-8;st:1-5;" into array "ro:1-5", "en:6-8", "st:1-5"
   *
   * @param {{ markup: Markup, config?: PartialConfig }} { markup, config = this.config }
   * @returns {MarkupElements}
   * @memberof Morfana
   */
  parseMarkup({
    markup,
    config = this.config,
  }: {
    markup: Markup
    config?: PartialConfig & { itemsDelimeter: Config['itemsDelimeter'] }
  }): MarkupElements {
    const { itemsDelimeter } = config

    const markupElements = markup.split(itemsDelimeter)

    return markupElements
  }

  prepareMarkupData({
    markupElements,
    config = this.config,
  }: {
    markupElements: MarkupElements
    config?: PartialConfig & { keyValDelimeter: Config['keyValDelimeter']; rangeDelimeter: Config['rangeDelimeter'] }
  }): MarkupData {
    const { keyValDelimeter, rangeDelimeter } = config

    const markupData = markupElements.map((item) => {
      const [key, value] = item.split(keyValDelimeter)
      const [rangeStart, rangeEnd] = value.split(rangeDelimeter).map(parseInt)

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
  prepareWord({
    word,
    config = this.config,
  }: {
    word: Word
    config?: PartialConfig & { zeroEndingSymbol: Config['zeroEndingSymbol'] }
  }): PreparedWord {
    const { zeroEndingSymbol } = config

    const preparedWord = word.endsWith(zeroEndingSymbol) ? word : `${word}${zeroEndingSymbol}`

    return preparedWord
  }
}

export default Morfana
