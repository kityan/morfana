import React from 'react'
import { Story, Meta } from '@storybook/react'

import { Morpheme, MorphemeProps } from './index'

export default {
  title: 'Morpheme',
  component: Morpheme,
  args: {
    type: 'pr',
    range: [0, 3],
    index: 0,
    debug: true,
  },
} as Meta

const Template: Story<MorphemeProps> = (args) => <Morpheme {...args} />

export const Basic = Template.bind({})
