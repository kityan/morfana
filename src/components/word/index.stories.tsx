import React from 'react'
import { Story, Meta } from '@storybook/react'
import '../../stories/main.css'

import { Word, WordProps } from './index'

export default {
  title: 'Word',
  component: Word,
  args: {
    debug: false,
  },
} as Meta

const Template: Story<WordProps> = (args) => <Word {...args} />

export const Basic = Template.bind({})
Basic.args = {
  markupData: [
    {
      type: 'pr',
      range: [0, 2],
    },
    {
      type: 'ro',
      range: [3, 7],
    },
    {
      type: 'su',
      range: [8, 9],
    },
    {
      type: 'en',
      range: [10, 10],
    },
    {
      type: 'st',
      range: [0, 9],
    },
  ],
  symbolsMap: [
    {
      symbol: 'р',
      index: 0,
      start: ['pr'],
      end: [],
    },
    {
      symbol: 'а',
      index: 1,
      start: [],
      end: [],
    },
    {
      symbol: 'с',
      index: 2,
      start: [],
      end: ['pr'],
    },
    {
      symbol: 'п',
      index: 3,
      start: ['ro'],
      end: [],
    },
    {
      symbol: 'о',
      index: 4,
      start: [],
      end: [],
    },
    {
      symbol: 'р',
      index: 5,
      start: [],
      end: [],
    },
    {
      symbol: 'я',
      index: 6,
      start: [],
      end: [],
    },
    {
      symbol: 'д',
      index: 7,
      start: [],
      end: ['ro'],
    },
    {
      symbol: 'о',
      index: 8,
      start: ['su'],
      end: [],
    },
    {
      symbol: 'к',
      index: 9,
      start: [],
      end: ['su'],
    },
    {
      symbol: ' ',
      index: 10,
      start: ['en'],
      end: ['en'],
    },
  ],
}

export const Advanced = Template.bind({})
Advanced.args = {
  markupData: [
    {
      type: 'ro',
      range: [0, 2],
    },
    {
      type: 'po',
      range: [4, 5],
    },
    {
      type: 'st',
      range: [0, 5],
    },
  ],
  symbolsMap: [
    {
      symbol: 'к',
      index: 0,
      start: ['ro'],
      end: [],
    },
    {
      symbol: 'т',
      index: 1,
      start: [],
      end: [],
    },
    {
      symbol: 'о',
      index: 2,
      start: [],
      end: ['ro'],
    },
    {
      symbol: '-',
      index: 3,
      start: ['st'],
      end: [],
    },
    {
      symbol: 'т',
      index: 4,
      start: ['po'],
      end: [],
    },
    {
      symbol: 'о',
      index: 5,
      start: [],
      end: ['po', 'st'],
    },
    {
      symbol: ' ',
      index: 6,
      start: ['en'],
      end: ['en'],
    },
  ],
}

export const Advanced2 = Template.bind({})
Advanced2.args = {
  markupData: [
    {
      type: 'ro',
      range: [0, 3],
    },
    {
      type: 'su',
      range: [4, 5],
    },
    {
      type: 'su',
      range: [6, 8],
    },
    {
      type: 'en',
      range: [9, 10],
    },
    {
      type: 'st',
      range: [0, 8],
    },
  ],
  symbolsMap: [
    {
      symbol: 'к',
      index: 0,
      start: ['ro', 'st'],
      end: [],
    },
    {
      symbol: 'р',
      index: 1,
      start: [],
      end: [],
    },
    {
      symbol: 'и',
      index: 2,
      start: [],
      end: ['ro'],
    },
    {
      symbol: 'т',
      index: 3,
      start: [],
      end: ['ro'],
    },
    {
      symbol: 'и',
      index: 4,
      start: ['su'],
      end: [],
    },
    {
      symbol: 'ч',
      index: 5,
      start: [],
      end: ['su'],
    },
    {
      symbol: 'е',
      index: 6,
      start: ['su'],
      end: [],
    },
    {
      symbol: 'с',
      index: 7,
      start: [],
      end: [],
    },
    {
      symbol: 'к',
      index: 8,
      start: [],
      end: ['su'],
    },
    {
      symbol: 'и',
      index: 9,
      start: ['en'],
      end: [],
    },
    {
      symbol: 'й',
      index: 10,
      start: [],
      end: ['en'],
    },
  ],
}
