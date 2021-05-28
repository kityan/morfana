// import { ReactNode } from 'react'
import { MarkupData, PreparedWord, SymbolsMap, SymbolsMapItem } from '../types'

/**
 * Get symbols map with morhpemes data
 *
 * @param {PreparedWord} [word='']
 * @param {MarkupData} markupData
 * @returns {SymbolsMap}
 */
export const getSymbolsMap = (word: PreparedWord = '', markupData: MarkupData): SymbolsMap => {
  const symbolsMap = [...word].map<SymbolsMapItem>((symbol, index) => ({ symbol, index, start: [], end: [] }))

  markupData.map((item) => {
    const {
      type,
      range: [rangeMin, rangeMax],
    } = item

    symbolsMap[rangeMin]?.start.push(type)
    symbolsMap[rangeMax]?.end.push(type)

    return item
  })

  return symbolsMap
}
