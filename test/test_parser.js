const assert = require('assert')
const RE = require('../src/re')
const Parser = RE.Parser

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
})
