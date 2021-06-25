import { createContext } from 'react'
import { Morfana } from '../morfana'
import { WordConfig } from '../types'

const MorfanaInstance = new Morfana()

export const MorfanaContext = createContext<{ Morfana: Morfana; wordConfig?: WordConfig }>({ Morfana: MorfanaInstance })
