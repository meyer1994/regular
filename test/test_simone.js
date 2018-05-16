const assert = require('assert')
const RE = require('../src/re')
const Simone = RE.Simone
const Parser = RE.Parser

describe('Simone', function () {
  describe('#inOrder', function () {
    it('Should return the in-order tree traversal list', function () {
      const regex0 = '(ab|ac)*a?|(ba?c)*'
      const parser0 = new Parser(regex0)
      const tree0 = parser0.regex()
      const expected0 = 'a.b|a.c*.a?|b.a?.c*'.split('')
      const result0 = Simone.inOrder(tree0).map(n => n.value)
      assert.deepStrictEqual(result0, expected0)

      const regex1 = '(ba|a(ba)*a)*(b|a(ba)*)'
      const parser1 = new Parser(regex1)
      const tree1 = parser1.regex()
      const expected1 = 'b.a|a.b.a*.a*.b|a.b.a*'.split('')
      const result1 = Simone.inOrder(tree1).map(n => n.value)
      assert.deepStrictEqual(result1, expected1)
    })
  })

  describe('#down', function () {
    it('Should go down the tree', function () {
      const regex = '(ab|ac)*a?|(ba?c)*'
      const parser = new Parser(regex)
      const tree = parser.regex()
      const simone = new Simone(tree)
      const result = simone.down(tree)
      const expected = new Set([ '1_a', '3_a', '5_a', '6_b', 'lambda' ])
      assert.deepStrictEqual(result, expected)
    })

    it('Should go up the tree', function () {
      const regex = '(ab|ac)*a?|(ba?c)*'
      const parser = new Parser(regex)
      const tree = parser.regex()
      const simone = new Simone(tree)
      const result = simone.up(simone.order[9])
      const expected = new Set([ 'lambda' ])
      assert.deepStrictEqual(result, expected)
    })
  })
})
