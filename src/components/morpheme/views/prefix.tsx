import React, { FC } from 'react'
import { MorphemeViewProps } from '../../../types'
import * as Styled from '../styled'

export const Prefix: FC<MorphemeViewProps> = ({
  className,
  width: w,
  height: h,
  position,
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
      <path x={0} y={0} d={`M ${2} ${h * 0.7} L ${w - 2} ${h * 0.7} L ${w - 2} ${h - 2}`} />
    </Styled.MorphemeView>
  )
}

export { MorphemeViewProps as PrefixProps }
