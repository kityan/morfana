import React, { useContext, FC } from 'react'
import { MorphemeProps } from '../../types'
import { MorfanaContext } from '../../contexts/morfana'
import { MORPHEMES_VIEWS } from '../../data/morphemes'
import * as Styled from './styled'

export const Morpheme: FC<MorphemeProps> = ({
  className,
  type,
  range: [rangeStart, rangeEnd],
  index,
  debug = false,
}: MorphemeProps) => {
  const { Morfana } = useContext(MorfanaContext)
  const {
    letterWidth,
    letterHeight,
    strokeWidth,
    strokeColor,
    morphemeSpacing,
    morphemeHeightRatio,
  } = Morfana.getConfig()

  const rangeDiff = rangeEnd - rangeStart + 1
  const width = letterWidth * rangeDiff - morphemeSpacing * 2
  const height = letterHeight * morphemeHeightRatio
  const left = letterWidth * rangeStart + morphemeSpacing
  const View = MORPHEMES_VIEWS[type]

  if (View === undefined) return null

  return (
    <Styled.Root className={className} left={left} index={index} debug={debug}>
      <View
        width={width}
        height={height}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        morphemeHeightRatio={morphemeHeightRatio}
      />
    </Styled.Root>
  )
}

export { MorphemeProps }
