const assert = require('assert')
const Parser = require('../src/re').Parser
const inOrder = require('../src/re').inOrder

describe('Parser', function () {
  describe('#constructor', function () {
    it('Should throw when receiveing invalid regex', function () {
      const input0 = '_(a)*'
      const input1 = '(-a)*'
      const input2 = '=(ab|c)*'

      assert.throws(() => new Parser(input0))
      assert.throws(() => new Parser(input1))
      assert.throws(() => new Parser(input2))
    })

    it('Should remove dots and spaces from input', function () {
      const input0 = '    (a.b*)'
      const parser0 = new Parser(input0)
      assert.equal(parser0.input, '(ab*)')

      const input1 = `a* \n\n  .  b`
      const parser1 = new Parser(input1)
      assert.equal(parser1.input, 'a*b')

      const input2 = 'a?  .a * *'
      const parser2 = new Parser(input2)
      assert.equal(parser2.input, 'a?a**')
    })
  })

  describe('#regex', function () {
    it('Should parse a regular expression into a tree', function () {
      const regex = '(ab|ac)*a?|(ba?c)*'
      const parser = new Parser(regex)
      const expected = {
        value: '|',
        left: {
          value: '.',
          left: {
            value: '*',
            left: {
              value: '|',
              left: {
                value: '.',
                left: {
                  value: 'a',
                  left: null,
                  right: null
                },
                right: {
                  value: 'b',
                  left: null,
                  right: null
                }
              },
              right: {
                value: '.',
                left: {
                  value: 'a',
                  left: null,
                  right: null
                },
                right: {
                  value: 'c',
                  left: null,
                  right: null
                }
              }
            },
            right: null
          },
          right: {
            value: '?',
            left: {
              value: 'a',
              left: null,
              right: null
            },
            right: null
          }
        },
        right: {
          value: '*',
          left: {
            value: '.',
            left: {
              value: 'b',
              left: null,
              right: null
            },
            right: {
              value: '.',
              left: {
                value: '?',
                left: {
                  value: 'a',
                  left: null,
                  right: null
                },
                right: null
              },
              right: {
                value: 'c',
                left: null,
                right: null
              }
            }
          },
          right: null
        }
      }

      assert.deepStrictEqual(parser.regex(), expected)
    })
  })

  describe('inOrder', function () {
    it('Should return the in-order tree traversal list', function () {
      const regex0 = '(ab|ac)*a?|(ba?c)*'
      const parser0 = new Parser(regex0)
      const tree0 = parser0.regex()
      const expected0 = 'a.b|a.c*.a?|b.a?.c*'.split('')
      const result0 = inOrder(tree0).map(n => n.value)
      assert.deepStrictEqual(result0, expected0)

      const regex1 = '(ba|a(ba)*a)*(b|a(ba)*)'
      const parser1 = new Parser(regex1)
      const tree1 = parser1.regex()
      const expected1 = 'b.a|a.b.a*.a*.b|a.b.a*'.split('')
      const result1 = inOrder(tree1).map(n => n.value)
      assert.deepStrictEqual(result1, expected1)
    })
  })
})
