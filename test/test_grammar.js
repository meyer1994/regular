const assert = require('assert')
const NFA = require('../src/nfa')
const Grammar = require('../src/grammar')

describe('Grammar', function () {
  describe('#fromNFA', function () {
    it('Should transform a NFA into a regular grammar', function () {
      // language = odd number of a's
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        'S': { 'a': [ 'A' ] },
        'A': { 'a': [ 'S' ] }
      }
      const nfa = new NFA(start, accept, table)

      const productions = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const expected = new Grammar(start, productions)

      const result = Grammar.fromNFA(nfa)
      assert.deepStrictEqual(result, expected)
    })

    it('Should add epsilon if NFA accepts it', function () {
      // language = even number of a's
      const start = 'S'
      const accept = [ 'S' ]
      const table = {
        'S': { 'a': [ 'A' ] },
        'A': { 'a': [ 'S' ] }
      }
      const nfa = new NFA(start, accept, table)

      const productions = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const expected = new Grammar(start + "'", productions)

      const result = Grammar.fromNFA(nfa)
      assert.deepStrictEqual(result, expected)
    })
  })
})
