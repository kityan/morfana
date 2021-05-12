export type MorphemesTypes = {
  PREFIX: 'pr'
  SUFFIX: 'su'
  ROOT: 'ro'
  ENDING: 'en'
  STEM: 'st'
}

export type MorphemesTypesKey = keyof MorphemesTypes

export type MorphemeType = MorphemesTypes[MorphemesTypesKey]

export const MORPHEMES_TYPES: MorphemesTypes = Object.freeze({
  PREFIX: 'pr',
  SUFFIX: 'su',
  ROOT: 'ro',
  ENDING: 'en',
  STEM: 'st',
})
