import styled from 'styled-components'
import { BasicStyledProps, WordRootProps, LettersWrapperProps } from '../../types'

export const Root = styled.span<WordRootProps>`
  display: inline-block;
  padding: ${({ padding }) => padding}px 0;
`

export const Word = styled.span<BasicStyledProps>`
  display: inline-block;
  position: relative;
  z-index: 0;
`

export const LettersWrapper = styled.span<LettersWrapperProps>`
  display: inline-block;
  position: relative;
  z-index: ${({ $foreground }) => ($foreground ? 0 : -1)};
`
