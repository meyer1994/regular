import { strict as assert } from 'assert'

import HashSet from '../src/hashset'
import Automaton from '../src/automaton'
import Transition from '../src/transition'

describe('Automaton', function () {
  let automaton = null

  beforeEach(function () {
    const states = new HashSet([ 'q0', 'q1', 'q2', 'q3', 'q4' ])
    const alphabet = new HashSet([ 'a', 'b' ])
    const transitions = new HashSet([
      new Transition('q0', 'a', 'q1'),
      new Transition('q0', 'b', 'q1'),
      new Transition('q0', '&', 'q3'),
      new Transition('q1', '&', 'q3'),
      new Transition('q2', 'a', 'q4'),
      new Transition('q2', 'b', 'q0'),
      new Transition('q3', '&', 'q2')
    ])
    const start = 'q0'
    const final = new HashSet([ 'q4' ])
    automaton = new Automaton(states, alphabet, transitions, start, final)
  })

  describe('removeEpsilon', function () {
    it('Should remove all epsilon transitions', function () {
      const result = automaton.removeEpsilon().transitions
      const expected = new HashSet([
        new Transition('q0', 'a', 'q1'),
        new Transition('q0', 'a', 'q2'),
        new Transition('q0', 'a', 'q3'),
        new Transition('q0', 'a', 'q4'),
        new Transition('q0', 'b', 'q0'),
        new Transition('q0', 'b', 'q1'),
        new Transition('q0', 'b', 'q2'),
        new Transition('q0', 'b', 'q3'),
        new Transition('q1', 'a', 'q4'),
        new Transition('q1', 'b', 'q0'),
        new Transition('q1', 'b', 'q2'),
        new Transition('q1', 'b', 'q3'),
        new Transition('q2', 'a', 'q4'),
        new Transition('q2', 'b', 'q0'),
        new Transition('q2', 'b', 'q2'),
        new Transition('q2', 'b', 'q3'),
        new Transition('q3', 'a', 'q4'),
        new Transition('q3', 'b', 'q0'),
        new Transition('q3', 'b', 'q2'),
        new Transition('q3', 'b', 'q3')
      ])

      console.log(result.values().sort())
      assert.deepEqual(result, expected)
    })

    it('Should recognize same sequences', function () {
      const input = [ 'a', 'b', 'b', 'a' ]
      assert(automaton.match(input))

      const epsilonLess = automaton.removeEpsilon()
      assert(epsilonLess.match(input))
    })
  })

  describe('epsilonClosure', function () {
    it('Should get the epsilon closure', function () {
      const result = automaton.epsilonClosure([ 'q0', 'q1' ])
      const expected = new HashSet([ 'q0', 'q1', 'q2', 'q3' ])
      assert.deepEqual(result, expected)
    })
  })

  describe('reach', function () {
    it('Should get the reach of the states', function () {
      let result = automaton.reach([ 'q0' ], 'a')
      let expected = new HashSet([ 'q1', 'q2', 'q3', 'q4' ])
      assert.deepEqual(result, expected)

      result = automaton.reach([ 'q0' ], 'b')
      expected = new HashSet([ 'q0', 'q1', 'q2', 'q3' ])
      assert.deepEqual(result, expected)
    })
  })

  describe('isDeterministic', function () {
    it('Should return false', function () {
      const result = automaton.isDeterministic()
      assert(!result)
    })

    it('Should return true', function () {
      // changes all epslon transitions to 'b' transitions
      const epslon = automaton
        .transitions
        .filter(i => i.symbol === Automaton.EPSILON)
      automaton.transitions = automaton.transitions.diff(epslon)
      const result = automaton.isDeterministic()
      assert(result)
    })
  })

  describe('match', function () {
    it('Should recongnize sequences of symbols', function () {
      const symbols = 'aa'.split('')
      const result = automaton.match(symbols)
      assert(result)
    })

    it('Should reject invalid sequences', function () {
      const symbols = 'bb'.split('')
      const result = automaton.match(symbols)
      assert(!result)
    })
  })
})
