import React, { FC } from 'react'
import { MorphemeViewProps } from '../../../types'
import * as Styled from '../styled'

export const Root: FC<MorphemeViewProps> = ({
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
      <path x={0} y={0} d={`M ${2} ${h - 2} C ${w / 3} ${h * 0.25}, ${(w * 2) / 3} ${h * 0.25}, ${w - 2} ${h - 2}`} />
    </Styled.MorphemeView>
  )
}

export { MorphemeViewProps as RootProps }
