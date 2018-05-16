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

    beforeEach('Clears visited', function () {
      simone.visited.clear()
    })

    const testDown = [
      { input: 1, expected: new Set([ '1_a' ]) },
      { input: 3, expected: new Set([ '1_a', '3_a' ]) },
      { input: 5, expected: new Set([ '3_a' ]) },
      { input: 7, expected: new Set([ '1_a', '3_a', '5_a', 'lambda' ]) },
      { input: 8, expected: new Set([ '1_a', '3_a', '5_a', 'lambda' ]) },
      { input: 10, expected: new Set([ '5_a', 'lambda' ]) },
      { input: 11, expected: new Set([ '1_a', '3_a', '5_a', '6_b', 'lambda' ]) },
      { input: 13, expected: new Set([ '6_b' ]) },
      { input: 15, expected: new Set([ '7_a', '8_c' ]) },
      { input: 16, expected: new Set([ '7_a', '8_c' ]) },
      { input: 18, expected: new Set([ '6_b', 'lambda' ]) }
    ]
    testDown.forEach(function (t) {
      const node = simone.order[t.input]
      it(`Should go down the tree, order index: ${t.input}, ${node.value}`, function () {
        const result = simone.down(node)
        assert.deepStrictEqual(result, t.expected)
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
      { input: '1_a', expected: new Set([ '2_b' ]) },
      { input: '2_b', expected: new Set([ '1_a', '3_a', '5_a', 'lambda' ]) },
      { input: '3_a', expected: new Set([ '4_c' ]) },
      { input: '4_c', expected: new Set([ '1_a', '3_a', '5_a', 'lambda' ]) },
      { input: '5_a', expected: new Set([ 'lambda' ]) },
      { input: '6_b', expected: new Set([ '7_a', '8_c' ]) },
      { input: '7_a', expected: new Set([ '8_c' ]) },
      { input: '8_c', expected: new Set([ '6_b', 'lambda' ]) }
    ]
    testUp.forEach(function (t) {
      it(`Should go up the tree: ${t.input}`, function () {
        const nodeIndex = simone
          .order
          .map(i => i.value)
          .indexOf(t.input)
        const node = simone.order[nodeIndex]
        const result = simone.up(node)
        assert.deepStrictEqual(result, t.expected)
      })
    })
  })
})
