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
      { input: '(ac1*|77*)', expected: 'ac17'.split('') },
      { input: '(ab|cd)?', expected: 'abcd'.split('') },
      { input: 'a*?a(a)|a', expected: 'a'.split('') },
      { input: '( 1 | 2 | 3 )*', expected: '123'.split('') },
      { input: '1|2*|( 7 )*', expected: '127'.split('') }
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
        q0: { a: [ 'q1' ], b: [ 'q2' ] },
        q1: { b: [ 'q3' ], c: [ 'q3' ] },
        q2: { a: [ 'q4' ], c: [ 'q5' ] },
        q3: { a: [ 'q1' ] },
        q4: { c: [ 'q5' ] },
        q5: { b: [ 'q2' ] }
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
        q0: { a: [ 'q2' ], b: [ 'q1' ] },
        q1: { a: [ 'q0' ] },
        q2: { a: [ 'q0' ], b: [ 'q3' ] },
        q3: { a: [ 'q2' ] }
      }
      const expected = new NFA(start, accept, table)
      const result = re.toDFA()
      assert.deepStrictEqual(result, expected)
    })
  })
})
