import { ReactNode, FC } from 'react'

export interface BasicStyledProps {
  className?: string | void
  children?: ReactNode
}

export type MorphemesTypes = {
  PREFIX: string
  SUFFIX: string
  ROOT: string
  ENDING: string
  POSTFIX: string
  STEM: string
}

export type MorphemesTypesKey = keyof MorphemesTypes

export type MorphemeType = MorphemesTypes[MorphemesTypesKey]

export type MorphemesViews = { [index: string]: FC<MorphemeViewProps> }

export type Markup = string

export type MarkupElement = string

export type MarkupElements = MarkupElement[]

export type MorphemeRange = [number, number]

export type MorphemeRangeString = string

export interface MarkupDataItem {
  type: MorphemeType
  range: MorphemeRange
}

export interface DebugableProps {
  debug?: boolean
}

export interface MorphemeProps extends MarkupDataItem, DebugableProps {
  key?: number
  className?: string
  index: number
}

export interface MorphemeViewProps extends BasicStyledProps {
  className?: string
  width: number
  height: number
  position?: 'top' | 'bottom' | 'middle'
  strokeColor: Config['strokeColor']
  strokeWidth: Config['strokeWidth']
  morphemeHeightRatio: Config['morphemeHeightRatio']
}

export interface MorphemeRootProps extends BasicStyledProps, DebugableProps {
  left: number
  index: MorphemeProps['index']
}

export interface MorphemeWrapperProps extends BasicStyledProps, MarkupDataItem {}

export type MarkupData = MarkupDataItem[]

export type Word = string

export type PreparedWord = string

export interface SymbolsMapItem {
  symbol: string
  index: number
  start: MorphemeType[]
  end: MorphemeType[]
}

export type SymbolsMap = SymbolsMapItem[]

export interface LetterProps extends DebugableProps {
  className?: string
  key?: number
  symbol: SymbolsMapItem['symbol']
  index: SymbolsMapItem['index']
  width: number
  height: number
}

export interface LetterRootProps extends BasicStyledProps, DebugableProps {
  width: LetterProps['width']
  height: LetterProps['height']
  lineHeight: LetterProps['height']
}

export interface WordProps extends DebugableProps {
  className?: string
  symbolsMap: SymbolsMap
  markupData: MarkupData
}

export interface WordRootProps extends BasicStyledProps {
  className?: string
  padding: number
}

export type ErrorsLogLevel = 'error' | 'warn' | 'info' | 'none'

export interface Logger {
  info(message?: string): void
  warn(message?: string): void
  error(message?: string): void | Error
}

export type Config = Required<{
  /** Morpheme view stroke width (px) */
  strokeWidth: number
  /** Morpheme view stroke color */
  strokeColor: string
  /** Markup items delimeter */
  markupItemsDelimeter: string
  /** Markup key/value delimeter */
  markupKeyValDelimeter: string
  /** Markup range start/end delimeter */
  markupRangeDelimeter: string
  /** Zero ending symbol */
  zeroEndingSymbol: string
  /** Letter component height (px) */
  letterHeight: LetterProps['height']
  /** Letter component width (px) */
  letterWidth: LetterProps['width']
  /** Morphemes horisontal spacing (px) */
  morphemeSpacing: number
  /** 0-1 Morphemes root node height ratio. Adjusts morhemes paths heihgt */
  morphemeHeightRatio: number
  /** Custom Letter component */
  letterComponent: FC<LetterProps>
  /** Custom morpheme wrapper component */
  morphemeWrapperComponent: FC<MorphemeWrapperProps>
  /** Custom morpheme views component map */
  morphemesViewsMap: MorphemesViews
  /** Custom morpheme types map (used in markup) */
  morphemesTypesMap: MorphemesTypes
  /** Errors log level */
  errorsLogLevel: ErrorsLogLevel
  /** logger */
  logger: Logger
}>

export type PartialConfig = Partial<Config>

export interface MarkupPartialConfig {
  zeroEndingSymbol: Config['zeroEndingSymbol']
  markupKeyValDelimeter: Config['markupKeyValDelimeter']
  markupRangeDelimeter: Config['markupRangeDelimeter']
  markupItemsDelimeter: Config['markupItemsDelimeter']
  morphemesTypesMap: Config['morphemesTypesMap']
}

export interface MarkedWordProps extends DebugableProps {
  className?: string
  markup: Markup
  word: Word
  config: MarkupPartialConfig
}

export interface WordConfig {
  letterWidth?: Config['letterWidth']
  letterHeight?: Config['letterHeight']
  letterComponent?: Config['letterComponent']
  morphemeWrapperComponent?: Config['morphemeWrapperComponent']
}
