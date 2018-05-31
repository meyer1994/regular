const assert = require('assert')
const RE = require('../src/re')
const Parser = RE.Parser

describe('Parser', function () {
  describe('#constructor', function () {
    const testThrow = [
      '_(a)*',
      '(-a)*',
      '=(ab|c)*'
    ]
    testThrow.forEach(function (t) {
      it(`Throws when receiving invalid regex: ${t}`, function () {
        assert.throws(() => new Parser(t))
      })
    })

    const testsRemoval = [
      { input: '    (a.b*)', expected: '(ab*)' },
      { input: `a*   .  b`, expected: 'a*b' },
      { input: 'a?  .a * *', expected: 'a?a**' }
    ]
    testsRemoval.forEach(function (t) {
      it(`Removes dots and spaces: '${t.expected}' <= '${t.input}'`, function () {
        const parser = new Parser(t.input)
        assert.deepStrictEqual(parser.input, t.expected)
      })
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

    it('Should parse regular expression with **', function () {
      const regex = 'a**'
      const parser = new Parser(regex)

      const result = parser.regex()
      const expected = {
        value: '*',
        left: {
          value: '*',
          left: {
            value: 'a',
            left: null,
            right: null
          },
          right: null
        },
        right: null
      }

      assert.deepStrictEqual(result, expected)
    })
  })
})
