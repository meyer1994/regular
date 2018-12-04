import { strict as assert } from 'assert'

import HashSet from '../src/hashset'
import Automaton from '../src/automaton'
import Transition from '../src/transition'

describe('Automaton', function () {
  let automaton = null

  beforeEach(function () {
    // non deterministic. recognizes (a|b)*abb
    const states = new HashSet([ 'q0', 'q1', 'q2', 'q3' ])
    const alphabet = new HashSet([ 'a', 'b' ])
    const transitions = new HashSet([
      new Transition('q0', 'a', 'q0'),
      new Transition('q0', 'b', 'q0'),
      new Transition('q0', 'a', 'q1'),
      new Transition('q1', 'b', 'q2'),
      new Transition('q2', 'b', 'q3')
    ])
    const start = 'q0'
    const final = new HashSet([ 'q3' ])
    automaton = new Automaton(states, alphabet, transitions, start, final)
  })

  describe('match', function () {
    it('Should recongnize sequences of symbols', function () {
      const symbols = 'abaaabb'.split('')
      const result = automaton.match(symbols)
      assert.equal(result, true)
    })

    it('Should reject invalid sequences', function () {
      const symbols = 'abba'.split('')
      const result = automaton.match(symbols)
      assert.equal(result, false)
    })
  })

  describe('reach', function () {
    it('Should get the reach of a set of states', function () {
      const input = new HashSet([ 'q0' ])
      const result = automaton.reach(input, 'a')
      const expected = new HashSet([ 'q0', 'q1' ])
      assert.deepEqual(result._values, expected._values)
    })
  })

  describe('epsilonClosure', function () {
    it('Should return the EPSILON closure of an automaton', function () {
      automaton.transitions.add(new Transition('q0', '&', 'q0'))
      automaton.transitions.add(new Transition('q0', '&', 'q1'))
      automaton.transitions.add(new Transition('q1', '&', 'q2'))
      const input = new HashSet([ 'q0', 'q1' ])
      const result = automaton.epsilonClosure(input)
      const expected = new HashSet([ 'q0', 'q1', 'q2' ])
      assert.deepEqual(result._values, expected._values)
    })

    it('Every state reaches itself with epsilon transitions', function () {
      for (const state of automaton.states.values()) {
        const input = new HashSet([ state ])
        const result = automaton.epsilonClosure(input, Automaton.EPSILON)
        const expected = new HashSet([ state ])
        assert.deepEqual(result._values, expected._values)
      }
    })
  })
})
