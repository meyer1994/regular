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
  describe('#union', function () {
    it('Should unite two grammars', function () {
      const start1 = 'S'
      const productions1 = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar1 = new Grammar(start1, productions1)
      const start2 = "S'"
      const productions2 = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const grammar2 = new Grammar(start2, productions2)
      const union = Grammar.union(grammar1, grammar2)
      const expStart = "S'"
      const expProductions = {
        "S'": [ 'aS', 'a', '&' ],
        S: [ 'aS', 'a' ]
      }
      const expected = new Grammar(expStart, expProductions)
      assert.deepStrictEqual(union, expected)
    })
  })
  describe('#concat', function () {
    it('Should concat two grammars', function () {
      const start1 = 'S'
      const productions1 = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar1 = new Grammar(start1, productions1)
      const start2 = "S'"
      const productions2 = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const grammar2 = new Grammar(start2, productions2)
      const concat = Grammar.concat(grammar1, grammar2)
      const expStart = 'S'
      const expProductions = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const expected = new Grammar(expStart, expProductions)
      assert.deepStrictEqual(concat, expected)
    })
  })
  describe('#closure', function () {
    it("The closure of a even number of a's grammar is the same grammar", function () {
      const start = "S'"
      const productions = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const grammar = new Grammar(start, productions)
      const closure = Grammar.closure(grammar)
      assert.deepStrictEqual(closure, grammar)
    })

    it("The closure of a odd number of a's grammar its a number of a's > 0 grammar", function () {
      const start = 'S'
      const productions = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar = new Grammar(start, productions)
      const closure = Grammar.closure(grammar)
      const expStart = 'S'
      const expProductions = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aA', 'a' ]
      }
      const expected = new Grammar(expStart, expProductions)
      assert.deepStrictEqual(closure, expected)
    })
  })
  describe('#intersection', function () {
    it('Should intersect two grammars', function () {
      const start1 = 'S'
      const productions1 = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar1 = new Grammar(start1, productions1)
      const start2 = "S'"
      const productions2 = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const grammar2 = new Grammar(start2, productions2)
      const intersection = Grammar.intersection(grammar1, grammar2)
      const expStart = 'S'
      const expProductions = {
        'S': []
      }
      const expected = new Grammar(expStart, expProductions)
      assert.deepStrictEqual(intersection, expected)
    })
  })
  describe('#diff', function () {
    it('Should get the difference between two grammars', function () {
      const start1 = 'S'
      const productions1 = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar1 = new Grammar(start1, productions1)
      const start2 = "S'"
      const productions2 = {
        "S'": [ 'aA', '&' ],
        'S': [ 'aA' ],
        'A': [ 'aS', 'a' ]
      }
      const grammar2 = new Grammar(start2, productions2)
      const diff = Grammar.diff(grammar1, grammar2)
      assert.deepStrictEqual(diff, grammar1)
    })

    it('The diff between same language should be empty language', function () {
      const start1 = 'S'
      const productions1 = {
        'S': [ 'aA', 'a' ],
        'A': [ 'aS' ]
      }
      const grammar1 = new Grammar(start1, productions1)
      const expStart = 'S'
      const expProductions = {
        S: []
      }
      const expected = new Grammar(expStart, expProductions)
      const diff = Grammar.diff(grammar1, grammar1)
      assert.deepStrictEqual(diff, expected)
    })
  })
  describe('#reverse', function () {
    it('Should reverse a grammar', function () {
      const start = 'S'
      const productions = {
        S: [ 'aA', 'aB' ],
        A: [ 'aS' ],
        B: [ 'bC', 'b' ],
        C: [ 'bB' ]
      }
      const grammar = new Grammar(start, productions)
      const reverse = Grammar.reverse(grammar)
      const expStart = 'S'
      const expProductions = {
        S: [ 'bA' ],
        A: [ 'aB', 'a', 'bS' ],
        B: [ 'aC' ],
        C: [ 'aB', 'a' ]
      }
      const expected = new Grammar(expStart, expProductions)
      assert.deepStrictEqual(reverse, expected)
    })
  })
})
