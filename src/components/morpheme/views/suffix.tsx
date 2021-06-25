import React, { FC } from 'react'
import { MorphemeViewProps } from '../../../types'
import * as Styled from '../styled'

export const Suffix: FC<MorphemeViewProps> = ({
  className = '',
  width: w,
  height: h,
  position = 'top',
  strokeWidth,
  strokeColor,
  morphemeHeightRatio,
}: MorphemeViewProps) => {
  return (
    <Styled.MorphemeView
      className={className}
      width={w}
      height={h}
      position={position}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      morphemeHeightRatio={morphemeHeightRatio}>
      <path x={0} y={0} d={`M ${2} ${h - 2} L ${w / 2} ${h * 0.5} L ${w / 2} ${h * 0.5} L ${w - 2} ${h - 2}`} />
    </Styled.MorphemeView>
  )
}

export { MorphemeViewProps as SuffixProps }
