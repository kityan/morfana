import styled from 'styled-components'
import { BasicStyledProps, WordRootProps } from '../../types'

export const Root = styled.span<WordRootProps>`
  display: inline-block;
  padding: ${({ padding }) => padding}px 0;
`

export const Word = styled.span<BasicStyledProps>`
  display: inline-block;
  position: relative;
  z-index: 0;
`

export const LettersWrapper = styled.span<BasicStyledProps>`
  display: inline-block;
  position: relative;
  z-index: 0;
`
