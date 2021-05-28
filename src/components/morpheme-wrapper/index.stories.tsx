import React from 'react'
import { Story, Meta } from '@storybook/react'

import { MorphemeWrapper, MorphemeWrapperProps } from './index'

export default {
  title: 'MorphemeWrapper',
  component: MorphemeWrapper,
  args: {
    symbol: 'k',
    width: 30,
    height: 66,
    debug: true,
  },
} as Meta

const Template: Story<MorphemeWrapperProps> = (args) => <MorphemeWrapper {...args} />

export const Basic = Template.bind({})
