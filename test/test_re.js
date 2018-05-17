const assert = require('assert')
const RE = require('../src/re')
const Parser = RE.Parser

describe('RE', function () {
  describe('#constructor', function () {
    it('Should create a parser on construction', function () {
      const regex = '(ab*c)|a'
      const parser = new Parser(regex)
      const re = new RE(regex)
      assert.deepStrictEqual(parser, re.parser)
    })
  })

  describe('#alphabet', function () {
    const testAlphabet = [
      { input: '(ac1*|77*)', expected: new Set('ac177'.split('')) },
      { input: '(ab|cd)?', expected: new Set('abcd'.split('')) },
      { input: 'a*?a(a)|a', expected: new Set('a') },
      { input: '( 1 | 2 | 3 )*', expected: new Set('123'.split('')) },
      { input: '1|2*|( 7 )*', expected: new Set('127'.split('')) }
    ]
    testAlphabet.forEach(function (t) {
      it(`Should return the alphabet: ${Array.from(t.expected)}`, function () {
        const re = new RE(t.input)
        assert.deepStrictEqual(re.alphabet, t.expected)
      })
    })
  })
})
