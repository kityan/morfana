import { Config } from '../types'
import { Letter } from '../components/letter'
import { MorphemeWrapper } from '../components/morpheme-wrapper'
import { MORPHEMES_VIEWS, MORPHEMES_TYPES } from './morphemes'

export const DEFAULT_CONFIG: Config = {
  strokeWidth: 4, // px
  strokeColor: '#29A2FF',
  markupItemsDelimeter: ';',
  markupKeyValDelimeter: ':',
  markupRangeDelimeter: '-',
  zeroEndingSymbol: ' ',
  letterWidth: 40, // px
  letterHeight: 66, // px
  morphemeSpacing: 2, // px - spacing between morphemes
  morphemeHeightRatio: 0.9, // 0 – 1 (symbol height multiplier)
  letterComponent: Letter,
  morphemeWrapperComponent: MorphemeWrapper,
  morphemesViewsMap: MORPHEMES_VIEWS,
  morphemesTypesMap: MORPHEMES_TYPES,
  errorsLogLevel: 'warn',
}
