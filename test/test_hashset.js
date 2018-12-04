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

  describe('union', function () {
    it('Should make the union of sets and return a new set', function () {
      const set1 = new HashSet('abc'.split(''))
      const set2 = new HashSet('cde'.split(''))
      const result = set1.union(set2)

      const expected = new HashSet('abcde'.split(''))
      assert.deepEqual(result, expected)
    })
  })

  describe('intersect', function () {
    it('Should make the intersection of sets and return new set', function () {
      const set1 = new HashSet('abc'.split(''))
      const set2 = new HashSet('cde'.split(''))
      const result = set1.intersect(set2)

      const expected = new HashSet([ 'c' ])
      assert.deepEqual(result, expected)
    })
  })

  describe('map', function () {
    it('Should return mapped array of the elements', function () {
      const set = new HashSet([ 'abc', 'ab', 'a' ])
      const result = set.map(i => i.length)

      const expected = new HashSet([ 3, 2, 1 ])
      assert.deepEqual(result._values, expected._values)
    })
  })

  describe('filter', function () {
    it('Should return fitlered array of the elements', function () {
      const set = new HashSet([ 'abc', 'ab', 'a' ])
      const result = set.filter(i => i.length > 1)

      const expected = new HashSet([ 'abc', 'ab' ])
      assert.deepEqual(result._values, expected._values)
    })
  })

  describe('equals', function () {
    it('Should return true if sets are equal', function () {
      const set1 = new HashSet([ 'abc', 'ab', 'a' ])
      const set2 = new HashSet([ 'abc', 'ab', 'a' ])
      let result = set1.equals(set2)
      assert.equal(result, true)
      result = set2.equals(set1)
      assert.equal(result, true)

      // remove element
      set1.delete('abc')
      result = set1.equals(set2)
      assert.equal(result, false)
    })
  })

  describe('diff', function () {
    it('Should perform the difference operation', function () {
      const set1 = new HashSet('abcd'.split(''))
      const set2 = new HashSet('abc'.split(''))
      const result = set1.diff(set2)

      const expected = new HashSet([ 'd' ])
      assert.deepEqual(result, expected)
    })
  })

  describe('subsetOf', function () {
    it('Should return true if set is a subset of other', function () {
      const set1 = new HashSet('abc'.split(''))
      const set2 = new HashSet('abcd'.split(''))
      const result = set1.subsetOf(set2)
      assert.equal(result, true)
    })
  })

  describe('supersetOf', function () {
    it('Should return true when set is superset of other', function () {
      const set1 = new HashSet('abcde'.split(''))
      const set2 = new HashSet('abc'.split(''))
      const result = set1.supersetOf(set2)
      assert.equal(result, true)
    })
  })

  describe('toString', function () {
    it('Should return string representation of set', function () {
      const set = new HashSet([ 1, 2, 'a' ])
      const result = set.toString()
      const expected = JSON.stringify({ 1: 1, 2: 2, a: 'a' })
      assert.deepEqual(result, expected)
    })
  })

  describe('some', function () {
    it('Should return true if one element return true', function () {
      const set = new HashSet([ 1, 2, 3 ])
      const even = i => i % 2 === 0
      const result = set.some(even)
      assert.equal(result, true)
    })
  })
})
