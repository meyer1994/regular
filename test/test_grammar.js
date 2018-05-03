const assert = require('assert')
const Grammar = require('../src/grammar.js')

describe('Grammar', function () {
  describe('#constructor()', function () {

    describe('first parameter', function () {
      it('should throw if it is not a string', function () {
        assert.throws(() => { new Grammar(1, {}) })
        assert.throws(() => { new Grammar([[], {}], {}) })
        assert.throws(() => { new Grammar([], {}) })
        assert.throws(() => { new Grammar({}, {}) })
      })

      it('should throw if it is not of size 1', function () {
        assert.throws(() => { new Grammar('AA', {}) })
        assert.throws(() => { new Grammar('aa', {}) })
        assert.throws(() => { new Grammar('A1', {}) })
        assert.throws(() => { new Grammar('  ', {}) })
      })

      it('should throw if it is not an UPPERCASE letter', function () {
        assert.throws(() => { new Grammar('', {}) })
        assert.throws(() => { new Grammar('s', {}) })
        assert.throws(() => { new Grammar('1', {}) })
      })

      it('should throw if it is not on left side', function () {
        const bad0 = {
          'S': ['aS']
        }
        const bad1 = {
          'S': ['xS', 'aA'],
          'A': ['bS', 'a']
        }

        assert.throws(() => { new Grammar('A', bad0) })
        assert.throws(() => { new Grammar('B', bad1) })
      })
    })

    describe('obj parameter', function () {
      it('should throw if it is not an object', function () {
        assert.throws(() => { new Grammar('A', '') })
        assert.throws(() => { new Grammar('A', 1) })
      })

      describe('Left side of production', function() {
        it('should throw when it has length different than 1', function () {
          const bad0 = {
            'S': ['aA'],
            '': ['aA'],
            'A': ['aA']
          }
          const bad1 = {
            'S': ['aA'],
            'AA': ['aA']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
        })

        it('should throw when it is not an UPPERCASE letter', function () {
          const bad0 = {
            'S': ['ba'],
            'a': ['ba']
          }
          const bad1 = {
            'S': ['a1'],
            '1': ['a1']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
        })

        it('should not accept when it appears more than once', function () {
          // This one is impossible to happen with JS implementation of object
          // It cannot have more than one key with the same value ¯\_(ツ)_/¯
          // const bad = {
          //   'A': ['aA'],
          //   'A': ['bA']
          // }
          //
          // assert.throws(() => { new Grammar('A', bad) })
        })
      })

      describe('Right side of production', function () {
        it('should throw if first production is recursive and has "&"', function () {
          const bad = {
            'S': ['aS', '&']
          }
          assert.throws(() => new Grammar('S', bad))
        })

        it('should throw when other than the first production has "&"', function () {
          const bad0 = {
            'S': ['aS', 'bA', '&'],
            'A': ['aA', 'bS', '&']
          }
          const bad1 = {
            'S': ['aS', 'bA'],
            'A': ['aA', 'bS', '&']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
        })

        it('should throw when there there is more than one "&"', function () {
          const bad0 = {
            'S': ['a&']
          }
          const bad1 = {
            'S': ['aA', 'bA'],
            'A': ['&A', 'b']
          }

          assert.throws(() => { new Grammar(bad0) })
          assert.throws(() => { new Grammar(bad1) })
        })

        it('should throw when it has 0 or more than 2 characters', function () {
          const bad0 = {
            'S': ['aA', 'bS'],
            'A': ['abA']
          }
          const bad1 = {
            'S': ['aaa']
          }
          const bad2 = {
            'S': ['aA'],
            'A': ['aAb']
          }
          const bad3 = {
            'S': [''],
            'A': ['a']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
          assert.throws(() => { new Grammar('S', bad2) })
          assert.throws(() => { new Grammar('S', bad3) })
        })

        it('should throw when it has only UPPERCASE letter(s)', function () {
          const bad0 = {
            'S': ['aS', 'AA'],
            'A': ['aA']
          }
          const bad1 = {
            'S': ['aS', 'aA'],
            'A': ['AA']
          }
          const bad2 = {
            'S': ['aS', 'aA'],
            'A': ['bA', 'B']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
          assert.throws(() => { new Grammar('S', bad2) })
        })

        it('should throw when second character is not an UPPERCASE letter', function () {
          const bad0 = {
            'S': ['aa']
          }
          const bad1 = {
            'S': ['aA'],
            'A': ['aa']
          }
          const bad2 = {
            'S': ['a1', 'bA'],
            'A': ['aA']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
          assert.throws(() => { new Grammar('S', bad2) })
        })

        it('should throw if second character does not appear on left side', function () {
          const bad0 = {
            'S': ['aS', 'bA'],
            'A': ['bA', 'bB']
          }
          const bad1 = {
            'S': ['aA'],
            'A': ['aC']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
        })

        it('should throw if there is non-terminal that is not on the left side', function () {
          const bad0 = {
            'S': ['aA', 'aB'],
            'A': ['aA']
          }
          const bad1 = {
            'S': ['aS', 'aA'],
            'A': ['aB']
          }

          assert.throws(() => { new Grammar('S', bad0) })
          assert.throws(() => { new Grammar('S', bad1) })
        })
      })
    })
  })
})
