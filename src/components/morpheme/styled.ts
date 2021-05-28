import styled from 'styled-components'
import { MorphemeRootProps, MorphemeViewProps } from '../../types'

export const MorphemeView = styled.svg.attrs({
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'transparent',
  fillOpacity: '0',
})<MorphemeViewProps>`
  display: block;
  width: 100%;
  transform: ${({ position = 'top', morphemeHeightRatio }) => {
    if (position === 'top') return `translateY(-${morphemeHeightRatio * 90}%)`
    if (position === 'bottom') return `translateY(${(1 / morphemeHeightRatio) * 90}%)`

    return `scale(1.1)`
  }};
  > * {
    ${({ strokeColor, strokeWidth }) => `
      stroke: ${strokeColor};
      stroke-width: ${strokeWidth};
    `}
  }
`

export const Root = styled.span<MorphemeRootProps>`
  display: inline-block;
  position: absolute;
  text-align: center;
  box-sizing: border-box;
  z-index: 0;
  top: 0;
  ${({ left, index, debug }) => `
    left: ${left}px;
    line-height: 1.2;
    ${MorphemeView} {
      z-index: ${5 + index};
      ${debug ? 'border: 1px dashed blue;' : ''}
    }
  `}
`
