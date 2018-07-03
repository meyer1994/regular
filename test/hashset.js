import { strict as assert } from 'assert'
import HashSet from '../src/hashset'

describe('HashSet', function () {
  describe('constructor', function () {
    it('Should be empty when no iterable has been passed', function () {
      const set = new HashSet()

      const result = set._values
      const expected = {}
      assert.deepEqual(result, expected)
    })

    it('Should throw an error if constructor object is not iterable', function () {
      assert.throws(() => new HashSet(null))
      assert.throws(() => new HashSet({}))
    })

    it('Should add all items of the iterable', function () {
      const input = [ 1, 2, 'nice', 'some', 1, 1, 1 ]
      const set = new HashSet(input)

      const result = set._values
      const expected = {}
      input.forEach(i => { expected[i] = i })

      assert.deepEqual(result, expected)
    })
  })

  describe('add', function () {
    it('Should not change when adding repeated items', function () {
      const set = new HashSet()

      set.add(0)
      set.add(1)

      const result = set._values
      const expected = {
        0: 0,
        1: 1
      }
      assert.deepEqual(result, expected)

      set.add(1)
      assert.deepEqual(result, expected)
    })
  })

  describe('has', function () {
    it('Should check if item is in set', function () {
      const input = [ 1, 2, 'nice', 'some' ]
      const set = new HashSet(input)

      for (const item of input) {
        assert(set.has(item))
      }

      assert(!set.has(0))
    })
  })

  describe('size', function () {
    it('Should return the current size of the set', function () {
      const set = new HashSet()

      for (let i = 0; i < 10; i++) {
        assert.equal(set.size, i)
        set.add(i)
      }
    })
  })

  describe('length', function () {
    it('Should always return 0', function () {
      const set = new HashSet()

      for (let i = 0; i < 10; i++) {
        assert.equal(set.length, 0)
        set.add(i)
      }
    })
  })

  describe('clear', function () {
    it('Should remove all items of the set', function () {
      const input = [ 1, 2, 'nice', 'some' ]
      const set = new HashSet(input)

      set.clear()
      const result = set._values
      const expected = {}
      assert.deepEqual(result, expected)
    })
  })

  describe('delete', function () {
    let input = [ 1, -1, 'nice' ]
    let set = new HashSet(input)

    it('Should return true when item was removed', function () {
      for (const item of input) {
        const result = set.delete(item)
        assert(result)
      }
    })

    it('Should return false when item was not removed', function () {
      set = new HashSet([ 2 ])
      for (const item of input) {
        const result = set.delete(item)
        assert(!result)
      }
    })
  })

  describe('values', function () {
    it('Should return a list of values in the set', function () {
      const input = [ 0, 1, 'nuice', 1 ]
      const set = new HashSet(input)

      const result = set.values()
      result.sort()
      const expected = input
      expected.pop()
      expected.sort()
      assert.deepEqual(result, expected)
    })
  })

  describe('entries', function () {
    it('Should return a list of [ key, value ] of items', function () {
      const input = [ 0, 1, 'nuice', 1 ]
      const set = new HashSet(input)

      const result = set.entries()
      const expected = [ ['0', 0], ['1', 1], ['nuice', 'nuice'] ]
      result.sort()
      expected.sort()
      assert.deepEqual(result, expected)
    })
  })

  describe('forEach', function () {
    it('Should run the passed function for each value', function () {
      const input = [ 0, 1, 'nuice', 1 ]
      const set = new HashSet(input)

      const result = []
      const expected = [ 0, 1, 'nuice' ]
      expected.sort()
      set.forEach(i => result.push(i))
      result.sort()
      assert.deepEqual(result, expected)
    })
  })
})
