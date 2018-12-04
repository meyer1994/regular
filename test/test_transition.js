import { strict as assert } from 'assert'
import Transition from '../src/transition'

describe('Transition', function () {
  const transition = new Transition('A', 'ab', 'B')

  describe('toString', function () {
    it('Should return a string representation of the class', function () {
      const expected = '(A, ab) => B'
      const result = transition.toString()
      assert.equal(result, expected)
    })
  })

  describe('equals', function () {
    it('Should check if transitions are equal', function () {
      const t0 = new Transition('q0', 'a', 'q1')
      const t1 = new Transition('q0', 'b', 'q1')
      const t2 = new Transition('q0', 'a', 'q1')

      // True
      assert(t0.equals(t2))

      // False
      assert(!t0.equals(t1))
      assert(!t1.equals(t2))
    })
  })
})
