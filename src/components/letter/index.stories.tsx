import React from 'react'
import { Story, Meta } from '@storybook/react'

import { Letter, LetterProps } from './index'

export default {
  title: 'Letter',
  component: Letter,
  args: {
    symbol: 'k',
    width: 45,
    height: 66,
    debug: true,
  },
} as Meta

const Template: Story<LetterProps> = (args) => <Letter {...args} />

export const Basic = Template.bind({})
