import React, { FC } from 'react'
import { MorphemeWrapperProps } from '../../types'
import * as Styled from './styled'

export const MorphemeWrapper: FC<MorphemeWrapperProps> = ({
  className = '',
  children,
  ...rest
}: MorphemeWrapperProps) => {
  return (
    <Styled.Root className={className} {...rest}>
      {children}
    </Styled.Root>
  )
}

export { MorphemeWrapperProps }
