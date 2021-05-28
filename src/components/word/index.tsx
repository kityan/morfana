import React, { FC, useContext } from 'react'
import { WordProps } from '../../types'
import { MorfanaContext } from '../../contexts/morfana'
import { Morpheme } from '../morpheme'
import * as Styled from './styled'

export const Word: FC<WordProps> = ({ className, symbolsMap, markupData, debug }: WordProps) => {
  const { Morfana } = useContext(MorfanaContext)
  const {
    letterWidth,
    letterHeight,
    letterComponent: Letter,
    morphemeWrapperComponent: MorphemeWrapper,
  } = Morfana.getConfig()

  if (symbolsMap.length === 0) return null

  return (
    <Styled.Root className={className} padding={letterHeight / 2}>
      <Styled.Word>
        {markupData.map(({ type, range }, index) => (
          <MorphemeWrapper className='morphemeWrapper' type={type} range={range} key={index}>
            <Morpheme type={type} range={range} index={index} debug={debug} />
          </MorphemeWrapper>
        ))}
        <Styled.LettersWrapper>
          {symbolsMap.map(({ symbol, index }) => (
            <Letter symbol={symbol} index={index} width={letterWidth} height={letterHeight} key={index} debug={debug} />
          ))}
        </Styled.LettersWrapper>
      </Styled.Word>
    </Styled.Root>
  )
}

export { WordProps }
