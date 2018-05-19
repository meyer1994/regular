const assert = require('assert')
const RE = require('../src/re')
const NFA = require('../src/nfa')
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

  describe('#toDFA', function () {
    it('Converts to DFA (1)', function () {
      const regex = '(ab|ac)*a?|(ba?c)*'
      const re = new RE(regex)

      // Expects
      const start = 'q0'
      const accept = [ 'q0', 'q1', 'q3', 'q5' ]
      const table = {
        q0: { a: new Set([ 'q1' ]), b: new Set([ 'q2' ]) },
        q1: { b: new Set([ 'q3' ]), c: new Set([ 'q3' ]) },
        q2: { a: new Set([ 'q4' ]), c: new Set([ 'q5' ]) },
        q3: { a: new Set([ 'q1' ]) },
        q4: { c: new Set([ 'q5' ]) },
        q5: { b: new Set([ 'q2' ]) }
      }
      const expected = new NFA(start, accept, table)
      const result = re.toDFA()

      assert.deepStrictEqual(result, expected)
    })

    it('Converts to DFA (2)', function () {
      const regex = '(ba|a(ba)*a)*(b|a(ba)*)'
      const re = new RE(regex)

      // Expects
      const start = 'q0'
      const accept = [ 'q1', 'q2' ]
      const table = {
        q0: { a: new Set([ 'q2' ]), b: new Set([ 'q1' ]) },
        q1: { a: new Set([ 'q0' ]) },
        q2: { a: new Set([ 'q0' ]), b: new Set([ 'q3' ]) },
        q3: { a: new Set([ 'q2' ]) }
      }
      const expected = new NFA(start, accept, table)
      const result = re.toDFA()
      assert.deepStrictEqual(result, expected)
    })
  })
})
