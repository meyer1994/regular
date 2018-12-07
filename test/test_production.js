import { strict as assert } from 'assert'
import Production from '../src/production'

describe('Production', function () {
  let production = null

  beforeEach(function () {
    const left = [ 'S' ]
    const right = [ 'a', 'c' ]
    production = new Production(left, right)
  })

  describe('toString', function () {
    it('Should return string representation', function () {
      const result = production.toString()
      const expected = 'S => a c'
      assert.equal(result, expected)
    })
  })

  describe('equals', function () {
    it('Should compare productions', function () {
      const left = 'S'
      const right = 'ac'.split('')
      const expected = new Production(left, right)

      // true
      assert(production.equals(expected))

      // remove item
      expected.right.pop()
      assert(!production.equals(expected))
    })
  })
})
