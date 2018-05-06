const assert = require('assert')
const NFA = require('../src/nfa')
const Grammar = require('../src/grammar')

describe('Grammar', function () {
  describe('#constructor()', function () {})
  describe('#fromNFA', function () {
    it('Should transform a NFA into a regular grammar', function () {
      // language = odd number of a's
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        'S': { 'a': [ 'A' ] },
        'A': { 'a': [ 'S' ] }
      }
      const dfa = new NFA(start, accept, table)
      const productions = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      assert.deepStrictEqual(Grammar.fromNFA(dfa), new Grammar(start, productions))
    })
    it('Should add epsilon if NFA accepts it', function () {
      // language = even number of a's
      const start = 'S'
      const accept = [ 'S' ]
      const table = {
        'S': { 'a': [ 'A' ] },
        'A': { 'a': [ 'S' ] }
      }
      const dfa = new NFA(start, accept, table)
      const productions = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      assert.deepStrictEqual(Grammar.fromNFA(dfa), new Grammar("S'", productions))
    })
  })
})
