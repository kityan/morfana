import React, { FC } from 'react'
import { MorphemeViewProps } from '../../../types'
import * as Styled from '../styled'

export const Stem: FC<MorphemeViewProps> = ({
  className,
  width: w,
  height: h,
  position = 'bottom',
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
      <path
        x={strokeWidth}
        y={0}
        d={`M ${strokeWidth} ${3} L ${strokeWidth} ${h * 0.3} L ${w - strokeWidth} ${h * 0.3} L ${w -
          strokeWidth} ${3}`}
      />
    </Styled.MorphemeView>
  )
}

export { MorphemeViewProps as StemProps }
