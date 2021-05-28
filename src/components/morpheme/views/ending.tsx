import React, { FC } from 'react'
import { MorphemeViewProps } from '../../../types'
import * as Styled from '../styled'

export const Ending: FC<MorphemeViewProps> = ({
  className,
  width: w,
  height,
  strokeColor,
  strokeWidth,
  morphemeHeightRatio,
  position = 'middle',
}: MorphemeViewProps) => {
  const h = height / morphemeHeightRatio + strokeWidth * 2

  return (
    <Styled.MorphemeView
      className={className}
      width={w}
      height={h}
      position={position}
      morphemeHeightRatio={morphemeHeightRatio}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}>
      <rect x={strokeWidth / 2} y={strokeWidth / 2} width={w - strokeWidth} height={h - strokeWidth} />
    </Styled.MorphemeView>
  )
}

export { MorphemeViewProps as EndingProps }
