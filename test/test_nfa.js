const assert = require('assert')
const NFA = require('../src/nfa')

describe('NFA', function () {
  describe('#constructor', function () {
    it('Should fill out the transitions', function () {
      const start = 'q0'
      const accept = [ 'q2' ]
      const table = {
        q0: { b: [ 'q1' ] },
        q1: { a: [ 'q2' ] },
        q2: { }
      }
      const nfa = new NFA(start, accept, table)

      const expect = {
        q0: { a: [], b: [ 'q1' ] },
        q1: { a: [ 'q2' ], b: [] },
        q2: { a: [], b: [] }
      }
      assert.deepStrictEqual(nfa.table, expect)
    })
  })

  describe('#alphabet', function () {
    it('Should return the alphabet of NFA', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        S: { a: [ 'S', 'A' ], b: [ 'A' ], c: [ 'C' ] },
        A: { a: [ 'S', 'A' ], b: [ 'C' ], c: [ 'A' ] },
        C: { a: [ 'S', 'A' ], b: [ 'C' ], c: [ 'S' ] }
      }
      const nfa = new NFA(start, accept, table)

      const expect = [ 'a', 'b', 'c' ]
      const result = nfa.alphabet
      assert.deepStrictEqual(result, expect)
    })
  })

  describe('#isDeterministic', function () {
    it('Should return true if deterministic', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        S: { a: [ 'S' ] },
        A: { a: [ 'A' ] }
      }

      const nfa = new NFA(start, accept, table)
      assert(nfa.isDeterministic())
    })

    it('Should return false if non-deterministic', function () {
      const start = 'S'
      const accept = [ 'A' ]
      const table = {
        S: { a: [ 'S', 'A' ] },
        A: { a: [ 'A' ] }
      }

      const nfa = new NFA(start, accept, table)
      assert(!nfa.isDeterministic())
    })
  })

  describe('#getTransitions', function () {
    const start = 'S'
    const accept = [ 'C' ]
    const table = {
      S: { a: [ 'A', 'B' ] },
      A: { a: [ 'A', 'C' ] },
      B: { a: [ 'C' ], b: [ 'B' ] },
      C: {}
    }
    const nfa = new NFA(start, accept, table)

    const testTransitions = [
      { input: [ 'S', 'A' ], expected: [ 'a' ] },
      { input: [ 'B', 'C' ], expected: [ 'a', 'b' ] },
      { input: [ 'C' ], expected: [] }
    ]

    testTransitions.forEach(function (t) {
      it('Should return the possible transitions from a list of states', function () {
        const expect = t.expected
        const result = nfa.getTransitions(t.input)
        assert.deepStrictEqual(result, expect)
      })
    })
  })

  describe('#getReach', function () {
    const start = 'S'
    const accept = [ 'C' ]
    const table = {
      S: { a: [ 'A', 'B' ] },
      A: { a: [ 'A', 'C' ] },
      B: { a: [ 'C' ], b: [ 'B' ] },
      C: {}
    }
    const nfa = new NFA(start, accept, table)

    const testGetReach0 = [
      { input1: [ 'S', 'A' ], input2: 'a', expected: [ 'A', 'B', 'C' ] },
      { input1: [ 'A', 'B' ], input2: 'a', expected: [ 'A', 'C' ] },
      { input1: [ 'A', 'B' ], input2: 'b', expected: [ 'B' ] }
    ]

    testGetReach0.forEach(function (t) {
      it('Should return reachable states from passed state and char', function () {
        const expected = t.expected
        const result = nfa.getReach(t.input1, t.input2)
        assert.deepStrictEqual(result, expected)
      })
    })
  })

  describe('#getReach', function () {
    // Figure 2.9
    // John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman
    // Introduction to Automata Theory, Languages, and Computation, 3rd ed.
    const start = 'q0'
    const accept = [ 'q2' ]
    const table = {
      q0: { '0': [ 'q0', 'q1' ], '1': [ 'q0' ] },
      q1: { '1': [ 'q2' ] },
      q2: {}
    }
    const nfa = new NFA(start, accept, table)

    const testGetReach1 = [
      { input1: [ 'q0', 'q1' ], input2: '0', expected: [ 'q0', 'q1' ] },
      { input1: [ 'q0', 'q1' ], input2: '0', expected: [ 'q0', 'q1' ] },
      { input1: [ 'q0', 'q2' ], input2: '1', expected: [ 'q0' ] }
    ]

    testGetReach1.forEach(function (t) {
      it('Should return reachable states from passed state and char', function () {
        const expected = t.expected
        const result = nfa.getReach(t.input1, t.input2)
        assert.deepStrictEqual(result, expected)
      })
    })
  })

  describe('#getEpslonClosure', function () {
    it('Should return the closure of epslon', function () {
      const nstart = 'A'
      const naccept = [ 'B' ]
      const ntable = {
        'A': { 'a': [ 'A' ], '&': [ 'B' ] },
        'B': { 'b': [ 'B' ], '&': [ 'C' ] },
        'C': { 'c': [ 'C' ] }
      }
      const nfa = new NFA(nstart, naccept, ntable)

      const expect = [ 'A', 'B', 'C' ]
      const result = nfa.getEpslonClosure([ 'A' ])
      assert.deepStrictEqual(expect, result)
    })

    it('Should return the closure of epslon', function () {
      // Fig. 2.21
      // John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman
      // Introduction to Automata Theory, Languages, and Computation, 3rd ed.
      const nstart = '1'
      const naccept = [ '7' ]
      const ntable = {
        '1': { '&': [ '2', '4' ] },
        '2': { '&': [ '3' ] },
        '3': { '&': [ '6' ] },
        '4': { 'a': [ '5' ] },
        '5': { 'b': [ '6' ], '&': [ '7' ] },
        '6': {},
        '7': {}
      }

      const nfa = new NFA(nstart, naccept, ntable)

      const expect = [ '1', '2', '3', '4', '6' ]
      const result = nfa.getEpslonClosure([ '1' ])
      assert.deepStrictEqual(expect, result)
    })
  })

  describe('#removeEpslon', function () {
    it('Should remove all epslon transitions, if any', function () {
      // Test copied from:
      // https://cs.stackexchange.com/a/22093
      const start = 'q0'
      const accept = [ 'q5' ]
      const table = {
        q0: { '&': [ 'q1' ], b: [ 'q3' ] },
        q1: { '&': [ 'q2' ], a: [ 'q3' ] },
        q2: { a: [ 'q4' ] },
        q3: { '&': [ 'q2' ], b: [ 'q5' ] },
        q4: { a: [ 'q5' ], b: [ 'q3' ] },
        q5: {}
      }

      const nfa = new NFA(start, accept, table)
      nfa.removeEpslon()

      const expected = {
        q0: { a: [ 'q2', 'q3', 'q4' ], b: [ 'q2', 'q3' ] },
        q1: { a: [ 'q2', 'q3', 'q4' ], b: [] },
        q2: { a: [ 'q4' ], b: [] },
        q3: { a: [ 'q4' ], b: [ 'q5' ] },
        q4: { a: [ 'q5' ], b: [ 'q2', 'q3' ] },
        q5: { a: [], b: [] }
      }
      const newAccept = [ 'q5' ]
      assert.deepStrictEqual(nfa.accept, newAccept)
      assert.deepStrictEqual(nfa.table, expected)
    })

    it('Should remove all epslon transitions, if any', function () {
      const start = '1'
      const accept = [ '15' ]
      const table = {
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

      const nfa = new NFA(start, accept, table)
      nfa.removeEpslon()

      // I took too long on this one...
      const expected = {
        '1': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '3', '6', '7', '8', '9', '11', '12', '15' ].sort(),
          c: []
        },
        '2': {
          a: [],
          b: [ '3', '6', '7', '8', '9', '11', '15' ].sort(),
          c: []
        },
        '3': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '4': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '5': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '6': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '7': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '8': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '9': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [],
          c: []
        },
        '10': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '11': {
          a: [],
          b: [ '12' ].sort(),
          c: []
        },
        '12': {
          a: [],
          b: [],
          c: [ '8', '9', '11', '13', '14', '15' ].sort()
        },
        '13': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '14': {
          a: [ '8', '9', '11', '10', '14', '15' ].sort(),
          b: [ '12' ].sort(),
          c: []
        },
        '15': {
          a: [],
          b: [],
          c: []
        }
      }
      const newAccept = [ '1', '3', '4', '5', '6', '7', '8', '10', '13', '14', '15' ].sort()
      assert.deepStrictEqual(nfa.accept, newAccept)
      assert.deepStrictEqual(nfa.table, expected)
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

  describe('#determinize', function () {
    it('Should determinize the non-deterministic automaton', function () {
      // Non-deterministic
      const nstart = 'S'
      const naccept = [ 'C' ]
      const ntable = {
        S: { a: [ 'A', 'B' ] },
        A: { a: [ 'A', 'C' ] },
        B: { a: [ 'C' ], b: [ 'B' ] },
        C: {}
      }

      // Deterministic
      const dstart = 'S'
      const daccept = [ 'A,C', 'C' ]
      const dtable = {
        'S': { a: [ 'A,B' ] },
        'A,B': { a: [ 'A,C' ], b: [ 'B' ] },
        'A,C': { a: [ 'A,C' ] },
        'B': { a: [ 'C' ], b: [ 'B' ] },
        'C': {}
      }

      const nfa = new NFA(nstart, naccept, ntable)
      const dfa = new NFA(dstart, daccept, dtable)
      nfa.determinize()

      assert.deepStrictEqual(nfa, dfa)
      assert(nfa.isDeterministic())
    })

    it('Should determinize the non-deterministic automaton', function () {
      const nstart = 'S'
      const naccept = [ 'E' ]
      const ntable = {
        S: { a: [ 'B', 'E', 'D' ], b: [ 'E', 'A', 'C' ] },
        A: { a: [ 'E', 'B' ], b: [ 'A' ] },
        B: { a: [ 'A' ], b: [ 'B', 'E' ] },
        C: { a: [ 'D' ], b: [ 'C', 'E' ] },
        D: { a: [ 'C', 'E' ], b: [ 'D' ] },
        E: {}
      }
      const nfa = new NFA(nstart, naccept, ntable)

      const dstart = 'S'
      const daccept = [ 'B,D,E', 'A,C,E' ].sort()
      const dtable = {
        'S': { a: [ 'B,D,E' ], b: [ 'A,C,E' ] },
        'B,D,E': { a: [ 'A,C,E' ], b: [ 'B,D,E' ] },
        'A,C,E': { a: [ 'B,D,E' ], b: [ 'A,C,E' ] }
      }
      const dfa = new NFA(dstart, daccept, dtable)

      nfa.determinize()
      assert.deepStrictEqual(nfa, dfa)
      assert(nfa.isDeterministic())
    })

    it('Should determinize NFA with epslon transitions', function () {
      const start = '1'
      const accept = [ '15' ]
      const table = {
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
      const nfa = new NFA(start, accept, table)
      nfa.determinize()

      const expected = {
        '1': {
          a: [ '10,11,14,15,8,9' ],
          b: [ '11,12,15,3,6,7,8,9' ],
          c: []
        },
        '10,11,14,15,8,9': {
          a: [ '10,11,14,15,8,9' ],
          b: [ '12' ],
          c: []
        },
        '11,12,15,3,6,7,8,9': {
          a: [ '10,11,14,15,8,9' ],
          b: [ '12' ],
          c: [ '11,13,14,15,8,9' ]
        },
        '12': {
          a: [],
          c: [ '11,13,14,15,8,9' ],
          b: []
        },
        '11,13,14,15,8,9': {
          a: [ '10,11,14,15,8,9' ],
          b: [ '12' ],
          c: []
        }
      }
      assert.deepStrictEqual(nfa.table, expected)
    })
  })

  describe('#match', function () {
    // Fig. 1.7
    // Introduction to the theory of computation
    // Michael Sipser
    // Empty string or ends in a zero
    const start = 'q1'
    const accept = [ 'q1' ]
    const table = {
      q1: { '1': [ 'q2' ], '0': [ 'q1' ] },
      q2: { '1': [ 'q2' ], '0': [ 'q1' ] }
    }
    const nfa = new NFA(start, accept, table)

    const testMatchTrue = [
      '010',
      '01010100001000',
      '0',
      '',
      '1000010',
      '10'
    ]
    const testMatchFalse = [
      '01',
      '010011',
      '11111',
      '010100011'
    ]

    testMatchTrue.forEach(function (t) {
      it('Should match words that belong to the language', function () {
        assert(nfa.match(t))
      })
    })

    testMatchFalse.forEach(function (t) {
      it('Should not match words that do not belong to the language', function () {
        assert(!nfa.match(t))
      })
    })
  })

  describe('#match', function () {
    // #0 >= 2 and ends with 0
    const start = 'q0'
    const accept = [ 'q2' ]
    const table = {
      q0: { '1': [ 'q0' ], '0': [ 'q1' ] },
      q1: { '1': [ 'q1' ], '0': [ 'q2' ] },
      q2: { '0': [ 'q2' ] }
    }
    const nfa = new NFA(start, accept, table)

    const testMatchTrue = [
      '01000',
      '0000',
      '0100',
      '00'
    ]
    const testMatchFalse = [
      '0',
      '10',
      '000001',
      '1111',
      ''
    ]

    testMatchTrue.forEach(function (t) {
      it('Should match words that belong to the language', function () {
        assert(nfa.match(t))
      })
    })

    testMatchFalse.forEach(function (t) {
      it('Should not match words that do not belong to the language', function () {
        assert(!nfa.match(t))
      })
    })
  })

  describe('#beautify', function () {
    it('should transform all original states into q0, q1, ..., qn', function () {
      const start = 'S'
      const accept = [ 'B' ]
      const table = {
        'S': { 'a': [ 'A' ] },
        'A': { 'b': [ 'B' ] },
        'B': {}
      }
      const nfa = new NFA(start, accept, table)
      nfa.beautify()

      const expectedStart = 'q0'
      const expectedAccept = [ 'q2' ]
      const expectedTable = {
        'q0': { 'a': [ 'q1' ] },
        'q1': { 'b': [ 'q2' ] },
        'q2': {}
      }
      const expected = new NFA(expectedStart, expectedAccept, expectedTable)

      assert.deepStrictEqual(nfa, expected)
    })
  })

  describe('#union', function () {
    it('should unite two FAs', function () {
      const start0 = 'S'
      const accept0 = [ 'B' ]
      const table0 = {
        S: { a: [ 'A' ] },
        A: { b: [ 'B' ] },
        B: {}
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const start1 = 'S'
      const accept1 = [ 'B' ]
      const table1 = {
        S: { a: [ 'A' ] },
        A: { c: [ 'B' ] },
        B: {}
      }
      const nfa1 = new NFA(start1, accept1, table1)

      const expStart = 'qinitial'
      const expAccept = [ 'q2', 'q5' ]
      const expTable = {
        q0: { a: [ 'q1' ] },
        q1: { b: [ 'q2' ] },
        q2: {},
        q3: { a: [ 'q4' ] },
        q4: { c: [ 'q5' ] },
        q5: {},
        qinitial: { a: [ 'q1', 'q4' ] }
      }
      const expected = new NFA(expStart, expAccept, expTable)

      const union = NFA.union(nfa0, nfa1)
      assert.deepStrictEqual(union, expected)
    })
  })

  describe('#complete', () => {
    it('should complete the transitions of a incomplete automata', () => {
      const start = 'q0'
      const accept = [ 'qf' ]
      const table = {
        'q0': { 'a': [ 'q1' ], 'b': [ 'q1' ], 'c': [ 'q1' ] },
        'q1': {},
        'q2': {},
        'q3': {},
        'qf': {}
      }

      const expectedTable = {
        'q0': { 'a': [ 'q1' ], 'b': [ 'q1' ], 'c': [ 'q1' ] },
        'q1': { 'a': [ 'qdead' ], 'b': [ 'qdead' ], 'c': [ 'qdead' ] },
        'q2': { 'a': [ 'qdead' ], 'b': [ 'qdead' ], 'c': [ 'qdead' ] },
        'q3': { 'a': [ 'qdead' ], 'b': [ 'qdead' ], 'c': [ 'qdead' ] },
        'qf': { 'a': [ 'qdead' ], 'b': [ 'qdead' ], 'c': [ 'qdead' ] },
        'qdead': { 'a': [ 'qdead' ], 'b': [ 'qdead' ], 'c': [ 'qdead' ] }
      }

      const nfa1 = new NFA(start, accept, table)
      nfa1.complete()
      const expected = new NFA(start, accept, expectedTable)
      assert.deepStrictEqual(nfa1, expected)
    })
  })

  describe('#concat', function () {
    it('should concat two FAs', function () {
      const start0 = 'S'
      const accept0 = [ 'B' ]
      const table0 = {
        S: { a: [ 'A' ] },
        A: { b: [ 'B' ] },
        B: { c: [] }
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const start1 = 'S'
      const accept1 = [ 'B' ]
      const table1 = {
        S: { a: [ 'A' ] },
        A: { c: [ 'B' ] },
        B: { b: [] }
      }
      const nfa1 = new NFA(start1, accept1, table1)

      const expStart = 'q0'
      const expAccept = [ 'q5' ]
      const expTable = {
        q0: { a: [ 'q1' ] },
        q1: { b: [ 'q2' ] },
        q2: { a: [ 'q4' ] },
        q3: { a: [ 'q4' ] },
        q4: { c: [ 'q5' ] },
        q5: {}
      }
      const expected = new NFA(expStart, expAccept, expTable)

      const concat = NFA.concat(nfa0, nfa1)
      assert.deepStrictEqual(concat, expected)
    })
  })

  describe('#star', () => {
    it('should star a FA', () => {
      const start0 = 'S'
      const accept0 = [ 'B' ]
      const table0 = {
        'S': { 'a': [ 'A' ] },
        'A': { 'b': [ 'B' ] },
        'B': {}
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const expectedStart = 'S'
      const expectedFinalStates = [ 'B' ]
      const expectedTable = {
        'S': { 'a': [ 'A' ] },
        'A': { 'b': [ 'B' ] },
        'B': { 'a': [ 'A' ] }
      }

      const nfa0Star = NFA.star(nfa0)
      const expected = new NFA(expectedStart, expectedFinalStates, expectedTable)
      assert.deepStrictEqual(nfa0Star, expected)
    })
  })

  describe('#reverse', () => {
    it('should reverse a already complete and deterministic FA', () => {
      const start0 = 'S'
      const accept0 = [ 'S' ]
      const table0 = {
        'S': { 'a': [ 'A' ], 'b': [ 'S' ] },
        'A': { 'a': [ 'B' ], 'b': [ 'A' ] },
        'B': { 'a': [ 'S' ], 'b': [ 'B' ] }
      }
      const nfa0 = new NFA(start0, accept0, table0)

      const expectedStart = 'S'
      const expectedFinalStates = [ 'A', 'B' ]
      const expectedTable = {
        'S': { 'a': [ 'A' ], 'b': [ 'S' ] },
        'A': { 'a': [ 'B' ], 'b': [ 'A' ] },
        'B': { 'a': [ 'S' ], 'b': [ 'B' ] }
      }

      const reversedNFA0 = NFA.reverse(nfa0)
      const expected = new NFA(expectedStart, expectedFinalStates, expectedTable)
      assert.deepStrictEqual(reversedNFA0, expected)
    })
    it('should reverse a incomplete FA', () => {
      const start = 'q0'
      const accept = [ 'q0', 'q1' ]
      const table = {
        'q0': { 'a': [ 'q2' ], 'b': [ 'q1' ] },
        'q1': { 'a': [ 'q2' ] },
        'q2': { 'a': [ 'q0' ], 'b': [ 'q3' ] },
        'q3': { 'a': [ 'q0' ] }
      }
      const nfa = new NFA(start, accept, table)

      const expectedStart = 'q0'
      const expectedAccept = [ 'q2', 'q3', 'qdead' ]
      const expectedTable = {
        'q0': { 'a': [ 'q2' ], 'b': [ 'q1' ] },
        'q1': { 'a': [ 'q2' ], 'b': [ 'qdead' ] },
        'q2': { 'a': [ 'q0' ], 'b': [ 'q3' ] },
        'q3': { 'a': [ 'q0' ], 'b': [ 'qdead' ] },
        'qdead': { 'a': [ 'qdead' ], 'b': [ 'qdead' ] }
      }
      const expected = new NFA(expectedStart, expectedAccept, expectedTable)
      assert.deepStrictEqual(NFA.reverse(nfa), expected)
    })
  })

  describe('#intersection', () => {
    it('should return the intersection of two FAs.', () => {
      const start0 = 'S'
      const accept0 = [ 'S', 'A' ]
      const table0 = {
        'S': { '0': [ 'A' ], '1': [ 'S' ] },
        'A': { '1': [ 'S' ] }
      }

      const start1 = 'S'
      const accept1 = [ 'S', 'A' ]
      const table1 = {
        'S': { '0': [ 'S' ], '1': [ 'A' ] },
        'A': { '0': [ 'S' ] }
      }
      const nfa0 = new NFA(start0, accept0, table0)
      const nfa1 = new NFA(start1, accept1, table1)

      const expectedStart = 'qinitial'
      const expectedAccept = [ 'qinitial', 'q1,q3', 'q0,q4' ]
      const expectedTable = {
        'qinitial': { '0': [ 'q1,q3' ], '1': [ 'q0,q4' ] },
        'q1,q3': { '0': [ 'q2,q3' ], '1': [ 'q0,q4' ] },
        'q0,q4': { '0': [ 'q1,q3' ], '1': [ 'q0,q5' ] },
        'q2,q3': { '0': [ 'q2,q3' ], '1': [ 'q2,q4' ] },
        'q0,q5': { '0': [ 'q1,q5' ], '1': [ 'q0,q5' ] },
        'q2,q4': { '0': [ 'q2,q3' ], '1': [ 'q2,q5' ] },
        'q1,q5': { '0': [ 'q2,q5' ], '1': [ 'q0,q5' ] },
        'q2,q5': { '0': [ 'q2,q5' ], '1': [ 'q2,q5' ] }
      }
      const expected = new NFA(expectedStart, expectedAccept, expectedTable)
      const intersection = NFA.intersection(nfa0, nfa1)
      assert.deepStrictEqual(intersection, expected)
    })
  })

  describe('#diff', () => {
    it('should get the diff between two AFs', () => {
      const start0 = 'S'
      const accept0 = [ 'A' ]
      const table0 = {
        'S': { '0': [ 'A' ] },
        'A': { '0': [ 'A' ], '1': [ 'A' ] }
      }
      const start1 = 'S'
      const accept1 = [ 'A' ]
      const table1 = {
        'S': { '0': [ 'A' ], '1': [ 'S' ] },
        'A': { '0': [ 'A' ], '1': [ 'S' ] }
      }
      const nfa0 = new NFA(start0, accept0, table0)
      const nfa1 = new NFA(start1, accept1, table1)

      const expectedStart = 'qinitial'
      const expectedAccept = [ 'q1,q3' ]
      const expectedTable = {
        'qinitial': { '0': [ 'q1,q4' ], '1': [ 'q2,q3' ] },
        'q1,q4': { '0': [ 'q1,q4' ], '1': [ 'q1,q3' ] },
        'q2,q3': { '0': [ 'q2,q4' ], '1': [ 'q2,q3' ] },
        'q1,q3': { '0': [ 'q1,q4' ], '1': [ 'q1,q3' ] },
        'q2,q4': { '0': [ 'q2,q4' ], '1': [ 'q2,q3' ] }
      }
      const expected = new NFA(expectedStart, expectedAccept, expectedTable)
      const diff = NFA.diff(nfa0, nfa1)
      assert.deepStrictEqual(diff, expected)
    })
  })

  describe('#minimize', () => {
    it('should minimize a AF', () => {
      const start = 'A'
      const accept = [ 'A', 'D', 'G' ]
      const table = {
        'A': { 'a': [ 'G' ], 'b': [ 'B' ] },
        'B': { 'a': [ 'F' ], 'b': [ 'E' ] },
        'C': { 'a': [ 'C' ], 'b': [ 'G' ] },
        'D': { 'a': [ 'A' ], 'b': [ 'H' ] },
        'E': { 'a': [ 'E' ], 'b': [ 'A' ] },
        'F': { 'a': [ 'B' ], 'b': [ 'C' ] },
        'G': { 'a': [ 'G' ], 'b': [ 'F' ] },
        'H': { 'a': [ 'H' ], 'b': [ 'D' ] }
      }
      const nfa0 = new NFA(start, accept, table)

      const expectedStart = 'q0'
      const expectedAccept = [ 'q0' ]
      const expectedTable = {
        'q0': { 'a': [ 'q0' ], 'b': [ 'q1' ] },
        'q1': { 'a': [ 'q1' ], 'b': [ 'q2' ] },
        'q2': { 'a': [ 'q2' ], 'b': [ 'q0' ] }
      }
      const expected = new NFA(expectedStart, expectedAccept, expectedTable)
      const minimal = NFA.minimize(nfa0)
      assert.deepStrictEqual(minimal, expected)
    })
  })
})
