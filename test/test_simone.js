const assert = require('assert')
const RE = require('../src/re')
const Simone = RE.Simone
const Parser = RE.Parser

describe('Simone', function () {
  describe('#inOrder', function () {
    const testOrder = [
      { input: '(ab|ac)*a?|(ba?c)*', expected: 'a.b|a.c*.a?|b.a?.c*' },
      { input: '(ba|a(ba)*a)*(b|a(ba)*)', expected: 'b.a|a.b.a*.a*.b|a.b.a*' }
    ]
    testOrder.forEach(function (t) {
      it(`Should return the in-order tree traversal: ${t.expected}`, function () {
        const expected = t.expected.split('')
        const parser = new Parser(t.input)
        const tree = parser.regex()
        const result = Simone.inOrder(tree).map(n => n.value)
        assert.deepStrictEqual(result, expected)
      })
    })
  })

  describe('#down', function () {
    const regex = '(ab|ac)*a?|(ba?c)*'
    const parser = new Parser(regex)
    const tree = parser.regex()
    const simone = new Simone(tree)

    const testDown = [
      { input: 1, expected: [ 0 ] },
      { input: 3, expected: [ 0, 4 ] },
      { input: 5, expected: [ 4 ] },
      { input: 7, expected: [ 0, 4, 9, 19 ] },
      { input: 8, expected: [ 0, 4, 9, 19 ] },
      { input: 10, expected: [ 9, 19 ] },
      { input: 11, expected: [ 0, 4, 9, 12, 19 ] },
      { input: 13, expected: [ 12 ] },
      { input: 15, expected: [ 14, 17 ] },
      { input: 16, expected: [ 14, 17 ] },
      { input: 18, expected: [ 12, 19 ] }
    ]
    testDown.forEach(function (t) {
      const node = simone.nodes[t.input]
      it(`Should go down the tree, order index: ${t.input}, ${node.value}`, function () {
        const result = simone.down(node)
        const expected = new Set(t.expected.map(i => simone.nodes[i]))
        assert.deepStrictEqual(result, expected)
      })
    })
  })

  describe('#up', function () {
    const regex = '(ab|ac)*a?|(ba?c)*'
    const parser = new Parser(regex)
    const tree = parser.regex()
    const simone = new Simone(tree)

    beforeEach('Clears visited', function () {
      simone.visited.clear()
    })

    const testUp = [
      { input: 0, expected: [ 2 ] },
      { input: 2, expected: [ 0, 4, 9, 19 ] },
      { input: 4, expected: [ 6 ] },
      { input: 6, expected: [ 0, 4, 9, 19 ] },
      { input: 9, expected: [ 19 ] },
      { input: 12, expected: [ 14, 17 ] },
      { input: 14, expected: [ 17 ] },
      { input: 17, expected: [ 12, 19 ] }
    ]
    testUp.forEach(function (t) {
      it(`Should go up the tree: ${t.input}`, function () {
        const node = simone.nodes[t.input]
        const result = simone.up(node)
        const expected = new Set(t.expected.map(i => simone.nodes[i]))
        assert.deepStrictEqual(result, expected)
      })
    })
  })
})
