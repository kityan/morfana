import styled from 'styled-components'
import { LetterRootProps } from '../../types'

export const Root = styled.span<LetterRootProps>`
  display: inline-block;
  text-align: center;
  box-sizing: border-box;
  vertical-align: middle;
  height: 1em;
  line-height: 1em;
  padding: 0 0;
  ${({ width, height }) => `
    width: ${width}px;
    font-size: ${height}px;
    `}
  ${({ debug }) => debug && 'border: 1px dashed red;'}
`
