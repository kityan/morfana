import { MorphemesTypes, MorphemesViews } from '../types'
import { Prefix, Suffix, Root, Postfix, Stem, Ending } from '../components/morpheme/views'

export const MORPHEMES_TYPES: MorphemesTypes = Object.freeze({
  PREFIX: 'pr',
  SUFFIX: 'su',
  ROOT: 'ro',
  ENDING: 'en',
  POSTFIX: 'po',
  STEM: 'st',
})

export const MORPHEMES_VIEWS: MorphemesViews = Object.freeze({
  [MORPHEMES_TYPES.PREFIX]: Prefix,
  [MORPHEMES_TYPES.SUFFIX]: Suffix,
  [MORPHEMES_TYPES.ROOT]: Root,
  [MORPHEMES_TYPES.ENDING]: Ending,
  [MORPHEMES_TYPES.POSTFIX]: Postfix,
  [MORPHEMES_TYPES.STEM]: Stem,
})
