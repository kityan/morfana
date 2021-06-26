import React, { FC, useContext } from 'react'
import { WordProps } from '../../types'
import { MorfanaContext } from '../../contexts/morfana'
import { Morpheme } from '../morpheme'
import * as Styled from './styled'

export const Word: FC<WordProps> = ({
  className = '',
  symbolsMap,
  markupData,
  foregroundLetters = true,
  debug = false,
}: WordProps) => {
  const { Morfana, wordConfig = {} } = useContext(MorfanaContext)
  const MorfanaConfig = Morfana.getConfig()

  const letterWidth = wordConfig.letterWidth || MorfanaConfig.letterWidth
  const letterHeight = wordConfig.letterHeight || MorfanaConfig.letterHeight
  const Letter = wordConfig.letterComponent || MorfanaConfig.letterComponent
  const MorphemeWrapper = wordConfig.morphemeWrapperComponent || MorfanaConfig.morphemeWrapperComponent

  if (symbolsMap.length === 0) return null

  return (
    <Styled.Root className={className} padding={letterHeight / 2}>
      <Styled.Word>
        {markupData.map(({ type, range }, index) => (
          <MorphemeWrapper className='morphemeWrapper' type={type} range={range} index={index} key={index}>
            <Morpheme type={type} range={range} index={index} debug={debug} />
          </MorphemeWrapper>
        ))}
        <Styled.LettersWrapper $foreground={foregroundLetters}>
          {symbolsMap.map(({ symbol, index }) => (
            <Letter symbol={symbol} index={index} width={letterWidth} height={letterHeight} key={index} debug={debug} />
          ))}
        </Styled.LettersWrapper>
      </Styled.Word>
    </Styled.Root>
  )
}

export { WordProps }
