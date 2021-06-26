import { Morfana } from '../src/morfana'
import { DEFAULT_CONFIG } from '../src/data/config'

const VALID_MARKUP_STRING = 'ro:1-5;en:6-8;st:1-5'
const MARKUP_ELEMENTS = ['ro:1-5','en:6-8','st:1-5']
const MARKUP_DATA = [{type: 'ro', range:[1,5]},{type: 'en', range:[6,8]}, {type: 'st', range:[1,5]}]
const WORD = 'будильник'
const PREPARED_WORD = 'будильник '
const SYMBOLS_MAP = [
  { symbol: 'б', index: 0, start: [], end: [] },
  { symbol: 'у', index: 1, start: [ 'ro', 'st' ], end: [] },
  { symbol: 'д', index: 2, start: [], end: [] },
  { symbol: 'и', index: 3, start: [], end: [] },
  { symbol: 'л', index: 4, start: [], end: [] },
  { symbol: 'ь', index: 5, start: [], end: [ 'ro', 'st' ] },
  { symbol: 'н', index: 6, start: [ 'en' ], end: [] },
  { symbol: 'и', index: 7, start: [], end: [] },
  { symbol: 'к', index: 8, start: [], end: [ 'en' ] },
  { symbol: ' ', index: 9, start: [], end: [] }
]

describe('parseMarkup', ()=>{
  let Mf

  beforeEach(()=>{
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

  it('should throw if markup is invalid', () => {
    expect(Mf.parseMarkup({ markup: VALID_MARKUP_STRING })).toEqual(MARKUP_ELEMENTS)
    expect(Mf.parseMarkup({ markup: `${VALID_MARKUP_STRING};` })).toEqual(MARKUP_ELEMENTS)
  })

  it('should parse markup correctly', () => {
    expect(() =>{
      Mf.parseMarkup({ markup: 'ro:1-5;e#n:6-8;s@t:1-5;' })
    }).toThrow('Invalid markup elements: e#n:6-8, s@t:1-5')
    expect(Mf.parseMarkup({ markup: '' })).toEqual([])
  })
})


describe('prepareWord', ()=>{
  let Mf

  beforeEach(()=>{
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

  it('should return prepared word', () => {
    expect(Mf.prepareWord({ word: WORD })).toEqual(PREPARED_WORD)
  })

  it('should return prepared word even if it was with ending symbol', () => {
    expect(Mf.prepareWord({ word: PREPARED_WORD })).toEqual(PREPARED_WORD)
  })
})

describe('getSymbolsMap', ()=>{
  let Mf

  beforeEach(()=>{
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

  it('should return symbols map for prepared word', () => {
    expect(Mf.getSymbolsMap(PREPARED_WORD, MARKUP_DATA)).toEqual(SYMBOLS_MAP)
  })
})

describe('process', ()=>{
  let Mf

  beforeEach(()=>{
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

  it('should return prepared word', () => {
    expect(Mf.process({ word: WORD, markup: VALID_MARKUP_STRING })).toEqual({"markupData": [{"range": [1, 5], "type": "ro"}, {"range": [6, 8], "type": "en"}, {"range": [1, 5], "type": "st"}], "symbolsMap": [{"end": [], "index": 0, "start": [], "symbol": "б"}, {"end": [], "index": 1, "start": ["ro", "st"], "symbol": "у"}, {"end": [], "index": 2, "start": [], "symbol": "д"}, {"end": [], "index": 3, "start": [], "symbol": "и"}, {"end": [], "index": 4, "start": [], "symbol": "л"}, {"end": ["ro", "st"], "index": 5, "start": [], "symbol": "ь"}, {"end": [], "index": 6, "start": ["en"], "symbol": "н"}, {"end": [], "index": 7, "start": [], "symbol": "и"}, {"end": ["en"], "index": 8, "start": [], "symbol": "к"}, {"end": [], "index": 9, "start": [], "symbol": " "}]})
  })

})

describe('getConfig', ()=>{
  let Mf

  it('should return default config', () => {
    Mf = new Morfana()
    expect(Mf.getConfig()).toEqual(DEFAULT_CONFIG)
  })

  it('should return modified config', () => {
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
    expect(Mf.getConfig()).toEqual({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

})

describe('setConfig', ()=>{
  let Mf

  it('should return modified config', () => {
    Mf = new Morfana()
    Mf.setConfig({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })

    expect(Mf.getConfig()).toEqual({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

})

describe('log', ()=>{
  let Mf

  beforeEach(()=>{
    Mf = new Morfana({ ...DEFAULT_CONFIG, errorsLogLevel: 'error' })
  })

  it('should throw', () => {
    expect(() =>{
      Mf.log('Markup is empty!')
    }).toThrow('Markup is empty!')
  })

})
