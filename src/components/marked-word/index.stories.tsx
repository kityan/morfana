import React from 'react'
import { Story, Meta } from '@storybook/react'
import { MarkedWord, MarkedWordProps } from './index'
import { MORPHEMES_TYPES } from '../../data/morphemes'
import '../../stories/main.css'

export default {
  title: 'MarkedWord',
  component: MarkedWord,
  args: {
    debug: false,
  },
} as Meta

const Template: Story<MarkedWordProps> = (args) => <MarkedWord {...args} />

export const Basic = Template.bind({})
Basic.args = {
  markup: 'ro:0-2;en:3-3;ro:4-6;su:7-8;en:9-9;st:0-2;st:4-8',
  word: 'себялюбец',
}

export const CustomConfig = Template.bind({})
CustomConfig.args = {
  markup: 'ro~0#2|en~3#3|ro~4#6|su~7#8|en~9#9|st~0#2|st~4#8',
  word: 'себялюбец',
  config: {
    morphemesTypesMap: MORPHEMES_TYPES,
    zeroEndingSymbol: ' ',
    markupItemsDelimeter: '|',
    markupKeyValDelimeter: '~',
    markupRangeDelimeter: '#',
  },
}
