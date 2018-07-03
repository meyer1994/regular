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
})
