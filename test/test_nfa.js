const assert = require('assert')
const NFA = require('../src/nfa')

describe('NFA', function () {
  describe('#constructor', function () {
    it('Should separate the alphabet passed', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        'S': { 'a': [ 'S', 'A' ], 'b': [ 'A' ], 'c': [ 'C' ] },
        'A': { 'a': [ 'S', 'A' ], 'b': [ 'C' ], 'c': [ 'A' ] },
        'C': { 'a': [ 'S', 'A' ], 'b': [ 'C' ], 'c': [ 'S' ] }
      }
      const alpha = new Set([ 'a', 'b', 'c' ])

      const dfa = new NFA(start, accept, table)
      assert.deepStrictEqual(dfa.alphabet, alpha)
    })

    it('Should filter out useless transitions', function () {
      const start = 'q0'
      const accept = [ 'q2' ]
      const table = {
        'q0': { 'a': [], 'b': [ 'q1' ] },
        'q1': { 'a': [ 'q2' ], 'b': [] },
        'q2': { 'a': [], 'b': [] }
      }
      const nfa = new NFA(start, accept, table)

      const expect = {
        'q0': { 'b': [ 'q1' ] },
        'q1': { 'a': [ 'q2' ] },
        'q2': {}
      }
      assert.deepStrictEqual(nfa.table, expect)
    })
  })

  describe('#isDeterministic', function () {
    it('Should return true if deterministic', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        'S': { 'a': [ 'S' ] },
        'A': { 'a': [ 'A' ] }
      }

      const nfa = new NFA(start, accept, table)
      assert(nfa.isDeterministic())
    })

    it('Should return false if non-deterministic', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        'S': { 'a': [ 'S', 'A' ] },
        'A': { 'a': [ 'A' ] }
      }

      const nfa = new NFA(start, accept, table)
      assert(!nfa.isDeterministic())
    })
  })

  describe('#getTransitions', function () {
    it('Should return the possible transitions from a list of states', function () {
      const start0 = 'S'
      const accept0 = [ 'C' ]
      const table0 = {
        'S': { 'a': [ 'A', 'B' ] },
        'A': { 'a': [ 'A', 'C' ] },
        'B': { 'a': [ 'C' ], 'b': [ 'B' ] },
        'C': {}
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const transitions0 = [ 'a' ]
      const result0 = nfa0.getTransitions([ 'S', 'A' ])
      assert.deepStrictEqual(transitions0, result0)

      const transitions1 = [ 'a', 'b' ]
      const result1 = nfa0.getTransitions([ 'B', 'C' ])
      assert.deepStrictEqual(transitions1, result1)

      const transitions2 = []
      const result2 = nfa0.getTransitions([ 'C' ])
      assert.deepStrictEqual(transitions2, result2)
    })
  })

  describe('#getReach', function () {
    it('Should return reachable states from passed state and char', function () {
      const start0 = 'S'
      const accept0 = [ 'C' ]
      const table0 = {
        'S': { 'a': [ 'A', 'B' ] },
        'A': { 'a': [ 'A', 'C' ] },
        'B': {'a': [ 'C' ], 'b': [ 'B' ]},
        'C': {}
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const reachable0 = [ 'A', 'B', 'C' ]
      const result0 = nfa0.getReach([ 'S', 'A' ], 'a')
      assert.deepStrictEqual(reachable0, result0)

      const reachable1 = [ 'A', 'C' ]
      const result1 = nfa0.getReach([ 'A', 'B' ], 'a')
      assert.deepStrictEqual(reachable1, result1)

      const reachable2 = [ 'B' ]
      const result2 = nfa0.getReach([ 'A', 'B' ], 'b')
      assert.deepStrictEqual(reachable2, result2)

      // Figure 2.9
      // John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman
      // Introduction to Automata Theory, Languages, and Computation, 3rd ed.
      const start1 = 'q0'
      const accept1 = [ 'q2' ]
      const table1 = {
        'q0': { '0': [ 'q0', 'q1' ], '1': [ 'q0' ] },
        'q1': { '1': [ 'q2' ] },
        'q2': {}
      }
      const nfa1 = new NFA(start1, accept1, table1)

      const reachable3 = [ 'q0', 'q1' ]
      const result3 = nfa1.getReach([ 'q0', 'q1' ], '0')
      assert.deepStrictEqual(reachable3, result3)

      const reachable4 = [ 'q0', 'q1' ]
      const result4 = nfa1.getReach([ 'q0' ], '0')
      assert.deepStrictEqual(reachable4, result4)

      const reachable5 = [ 'q0', 'q2' ]
      const result5 = nfa1.getReach([ 'q0', 'q1' ], '1')
      assert.deepStrictEqual(reachable5, result5)
    })
  })

  describe('#determinize', function () {
    it('Should determinize the non-deterministic automaton', function () {
      const nstart0 = 'S'
      const naccept0 = [ 'C' ]
      const ntable0 = {
        'S': { 'a': [ 'A', 'B' ] },
        'A': { 'a': [ 'A', 'C' ] },
        'B': { 'a': [ 'C' ], 'b': [ 'B' ] },
        'C': {}
      }

      const dstart0 = 'S'
      const daccept0 = [ 'A,C', 'C' ]
      const dtable0 = {
        'S': { 'a': [ 'A,B' ] },
        'A,B': { 'a': [ 'A,C' ], 'b': [ 'B' ] },
        'A,C': { 'a': [ 'A,C' ] },
        'B': { 'a': [ 'C' ], 'b': [ 'B' ] },
        'C': {}
      }

      const nfa0 = new NFA(nstart0, naccept0, ntable0)
      const dfa0 = new NFA(dstart0, daccept0, dtable0)
      nfa0.determinize()
      assert.deepStrictEqual(nfa0, dfa0)
      assert(nfa0.isDeterministic())

      const nstart1 = 'S'
      const naccept1 = [ 'E' ]
      const ntable1 = {
        'S': { 'a': [ 'B', 'E', 'D' ], 'b': [ 'E', 'A', 'C' ] },
        'A': { 'a': [ 'E', 'B' ], 'b': [ 'A' ] },
        'B': { 'a': [ 'A' ], 'b': [ 'B', 'E' ] },
        'C': { 'a': [ 'D' ], 'b': [ 'C', 'E' ] },
        'D': { 'a': [ 'C', 'E' ], 'b': [ 'D' ] },
        'E': {}
      }
      const nfa1 = new NFA(nstart1, naccept1, ntable1)

      const dstart1 = 'S'
      const daccept1 = [ 'B,D,E', 'A,C,E' ]
      const dtable1 = {
        'S': { 'a': [ 'B,D,E' ], 'b': [ 'A,C,E' ] },
        'B,D,E': { 'a': [ 'A,C,E' ], 'b': [ 'B,D,E' ] },
        'A,C,E': { 'a': [ 'B,D,E' ], 'b': [ 'A,C,E' ] }
      }
      const dfa1 = new NFA(dstart1, daccept1, dtable1)

      nfa1.determinize()
      assert.deepStrictEqual(nfa1, dfa1)
      assert(nfa1.isDeterministic())
    })
  })
})
