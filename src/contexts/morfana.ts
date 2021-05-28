import { createContext } from 'react'
import { Morfana } from '../morfana'

const MorfanaInstance = new Morfana()

export const MorfanaContext = createContext<{ Morfana: Morfana }>({ Morfana: MorfanaInstance })
