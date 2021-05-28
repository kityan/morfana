import { Morfana } from '../src/morfana'

test('but there is a "stop" in Christoph', () => {
  const Mf = new Morfana()

  expect(Mf.parseMarkup({ markup: 'ro:1-5;en:6-8;st:1-5;' })).toContain('en:6-8')
})
