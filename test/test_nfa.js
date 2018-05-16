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
        'q0': { 'b': new Set([ 'q1' ]) },
        'q1': { 'a': new Set([ 'q2' ]) },
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

      const expected0 = new Set([ 'a' ])
      const result0 = nfa0.getTransitions([ 'S', 'A' ])
      assert.deepStrictEqual(expected0, result0)

      const expected1 = new Set([ 'a', 'b' ])
      const result1 = nfa0.getTransitions([ 'B', 'C' ])
      assert.deepStrictEqual(expected1, result1)

      const expected2 = new Set([])
      const result2 = nfa0.getTransitions([ 'C' ])
      assert.deepStrictEqual(expected2, result2)
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

      const expected0 = new Set([ 'A', 'B', 'C' ])
      const result0 = nfa0.getReach([ 'S', 'A' ], 'a')
      assert.deepStrictEqual(expected0, result0)

      const expected1 = new Set([ 'A', 'C' ])
      const result1 = nfa0.getReach([ 'A', 'B' ], 'a')
      assert.deepStrictEqual(expected1, result1)

      const expected2 = new Set([ 'B' ])
      const result2 = nfa0.getReach([ 'A', 'B' ], 'b')
      assert.deepStrictEqual(expected2, result2)

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

      const expected3 = new Set([ 'q0', 'q1' ])
      const result3 = nfa1.getReach([ 'q0', 'q1' ], '0')
      assert.deepStrictEqual(expected3, result3)

      const expected4 = new Set([ 'q0', 'q1' ])
      const result4 = nfa1.getReach([ 'q0' ], '0')
      assert.deepStrictEqual(expected4, result4)

      const expected5 = new Set([ 'q0', 'q2' ])
      const result5 = nfa1.getReach([ 'q0', 'q1' ], '1')
      assert.deepStrictEqual(expected5, result5)
    })
  })

  describe('#removeEpslon', function () {
    it('Should remove all epslon transitions, if any', function () {
      // Test copied from:
      // https://cs.stackexchange.com/a/22093
      const start0 = 'q0'
      const accept0 = [ 'q5' ]
      const table0 = {
        q0: { '&': [ 'q1' ], b: [ 'q3' ] },
        q1: { '&': [ 'q2' ], a: [ 'q3' ] },
        q2: { a: [ 'q4' ] },
        q3: { '&': [ 'q2' ], b: [ 'q5' ] },
        q4: { a: [ 'q5' ], b: [ 'q3' ] },
        q5: {}
      }

      const nfa0 = new NFA(start0, accept0, table0)
      nfa0.removeEpslon()

      const expected0 = {
        q0: { a: new Set([ 'q2', 'q3', 'q4' ]), b: new Set([ 'q3', 'q2' ]) },
        q1: { a: new Set([ 'q2', 'q3', 'q4' ]) },
        q2: { a: new Set([ 'q4' ]) },
        q3: { a: new Set([ 'q4' ]), b: new Set([ 'q5' ]) },
        q4: { a: new Set([ 'q5' ]), b: new Set([ 'q2', 'q3' ]) },
        q5: {}
      }
      const newAccept0 = new Set([ 'q5' ])
      assert.deepStrictEqual(nfa0.accept, newAccept0)
      assert.deepStrictEqual(nfa0.table, expected0)

      const start1 = '1'
      const accept1 = [ '15' ]
      const table1 = {
        '1': { '&': [ '2', '4' ] },
        '2': { 'b': [ '3' ] },
        '3': { '&': [ '6' ] },
        '4': { '&': [ '5' ] },
        '5': { '&': [ '6' ] },
        '6': { '&': [ '7' ] },
        '7': { '&': [ '8' ] },
        '8': { '&': [ '9', '11', '15' ] },
        '9': { 'a': [ '10' ] },
        '10': { '&': [ '14' ] },
        '11': { 'b': [ '12' ] },
        '12': { 'c': [ '13' ] },
        '13': { '&': [ '14' ] },
        '14': { '&': [ '8', '15' ] },
        '15': {}
      }

      const nfa1 = new NFA(start1, accept1, table1)
      nfa1.removeEpslon()

      // I took too long on this one...
      const expected1 = {
        '1': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '3', '6', '7', '8', '9', '11', '12', '15' ])
        },
        '2': {
          b: new Set([ '3', '6', '7', '8', '9', '11', '15' ])
        },
        '3': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '4': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '5': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '6': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '7': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '8': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '9': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ])
        },
        '10': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '11': {
          b: new Set([ '12' ])
        },
        '12': {
          c: new Set([ '8', '9', '11', '13', '14', '15' ])
        },
        '13': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '14': {
          a: new Set([ '8', '9', '11', '10', '14', '15' ]),
          b: new Set([ '12' ])
        },
        '15': {}
      }
      const newAccept1 = new Set([ '1', '3', '4', '5', '6', '7', '8', '10', '13', '14', '15' ])
      assert.deepStrictEqual(nfa1.accept, newAccept1)
      assert.deepStrictEqual(nfa1.table, expected1)
    })

    it('Removing epslon transitions twice should make no difference', function () {
      // Test copied from:
      // https://cs.stackexchange.com/a/22093
      const start0 = 'q0'
      const accept0 = [ 'q5' ]
      const table0 = {
        q0: { '&': [ 'q1' ], b: [ 'q3' ] },
        q1: { '&': [ 'q2' ], a: [ 'q3' ] },
        q2: { a: [ 'q4' ] },
        q3: { '&': [ 'q2' ], b: [ 'q5' ] },
        q4: { a: [ 'q5' ], b: [ 'q3' ] },
        q5: {}
      }

      const nfa0 = new NFA(start0, accept0, table0)
      const nfa1 = new NFA(start0, accept0, table0)
      nfa0.removeEpslon()
      nfa1.removeEpslon()
      nfa1.removeEpslon()
      assert.deepStrictEqual(nfa0, nfa1)
    })
  })

  describe('#getEpslonClosure', function () {
    it('Should return the closure of epslon', function () {
      const nstart0 = 'A'
      const naccept0 = [ 'B' ]
      const ntable0 = {
        'A': { 'a': [ 'A' ], '&': [ 'B' ] },
        'B': { 'b': [ 'B' ], '&': [ 'C' ] },
        'C': { 'c': [ 'C' ] }
      }

      const nfa0 = new NFA(nstart0, naccept0, ntable0)

      const expect0 = new Set([ 'A', 'B', 'C' ])
      const result0 = nfa0.getEpslonClosure([ 'A' ])
      assert.deepStrictEqual(expect0, result0)

      // Fig. 2.21
      // John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman
      // Introduction to Automata Theory, Languages, and Computation, 3rd ed.
      const nstart1 = '1'
      const naccept1 = [ '7' ]
      const ntable1 = {
        '1': { '&': [ '2', '4' ] },
        '2': { '&': [ '3' ] },
        '3': { '&': [ '6' ] },
        '4': { 'a': [ '5' ] },
        '5': { 'b': [ '6' ], '&': [ '7' ] },
        '6': {},
        '7': {}
      }

      const nfa1 = new NFA(nstart1, naccept1, ntable1)

      const expect1 = new Set([ '1', '2', '3', '4', '6' ])
      const result1 = nfa1.getEpslonClosure([ '1' ])
      assert.deepStrictEqual(expect1, result1)
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

    it('Should determinize NFA with epslon transitions', function () {
      const start0 = '1'
      const accept0 = [ '15' ]
      const table0 = {
        '1': { '&': [ '2', '4' ] },
        '2': { 'b': [ '3' ] },
        '3': { '&': [ '6' ] },
        '4': { '&': [ '5' ] },
        '5': { '&': [ '6' ] },
        '6': { '&': [ '7' ] },
        '7': { '&': [ '8' ] },
        '8': { '&': [ '9', '11', '15' ] },
        '9': { 'a': [ '10' ] },
        '10': { '&': [ '14' ] },
        '11': { 'b': [ '12' ] },
        '12': { 'c': [ '13' ] },
        '13': { '&': [ '14' ] },
        '14': { '&': [ '8', '15' ] },
        '15': {}
      }

      const nfa0 = new NFA(start0, accept0, table0)
      nfa0.determinize()

      const expected0 = {
        '1': {
          a: new Set([ '10,11,14,15,8,9' ]),
          b: new Set([ '11,12,15,3,6,7,8,9' ])
        },
        '10,11,14,15,8,9': {
          a: new Set([ '10,11,14,15,8,9' ]),
          b: new Set([ '12' ])
        },
        '11,12,15,3,6,7,8,9': {
          a: new Set([ '10,11,14,15,8,9' ]),
          b: new Set([ '12' ]),
          c: new Set([ '11,13,14,15,8,9' ])
        },
        '12': {
          c: new Set([ '11,13,14,15,8,9' ])
        },
        '11,13,14,15,8,9': {
          a: new Set([ '10,11,14,15,8,9' ]),
          b: new Set([ '12' ])
        }
      }
      assert.deepStrictEqual(nfa0.table, expected0)
    })
  })

  describe('#match', function () {
    it('Should match words that belongs to the language', function () {
      // Fig. 1.7
      // Introduction to the theory of computation
      // Michael Sipser
      // Empty string or ends in a zero
      const start0 = 'q1'
      const accept0 = [ 'q1' ]
      const table0 = {
        'q1': { '1': [ 'q2' ], '0': [ 'q1' ] },
        'q2': { '1': [ 'q2' ], '0': [ 'q1' ] }
      }
      const nfa0 = new NFA(start0, accept0, table0)

      assert(nfa0.match('010'))
      assert(nfa0.match('01010100001000'))
      assert(nfa0.match('0'))
      assert(nfa0.match(''))
      assert(nfa0.match('1000010'))
      assert(nfa0.match('10'))

      assert(!nfa0.match('01'))
      assert(!nfa0.match('010011'))
      assert(!nfa0.match('11111'))
      assert(!nfa0.match('010100011'))

      const start1 = 'q0'
      const accept1 = [ 'q1', 'q3' ]
      const table1 = {
        'q0': { '&': [ 'q1', 'q3' ] },
        'q1': { '0': [ 'q2' ] },
        'q2': { '0': [ 'q1' ] },
        'q3': { '0': [ 'q4' ] },
        'q4': { '0': [ 'q5' ] },
        'q5': { '0': [ 'q3' ] }
      }
      const nfa1 = new NFA(start1, accept1, table1)

      assert(nfa1.match('000000'))
      assert(nfa1.match('0000'))
      assert(nfa1.match('000'))
      assert(nfa1.match('00'))
      assert(nfa1.match(''))

      assert(!nfa1.match('0'))
      assert(!nfa1.match('00000'))
      assert(!nfa1.match('0000000'))
    })
  })
})
