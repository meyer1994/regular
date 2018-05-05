const assert = require('assert')
const NFA = require('../src/nfa')

describe('NFA', function () {
	describe('#constructor', function () {
		it('Should separate the alphabet passed', function () {
			const start = 'S'
			const accept = [ 'A' ]
			const table = {
				'S': { 'a': [ 'S', 'A' ], 'b': [ 'A' ], 'c': [ 'C' ] },
				'A': { 'a': [ 'S', 'A' ], 'b': [ 'C' ], 'c': [ 'A' ] },
				'C': { 'a': [ 'S', 'A' ], 'b': [ 'C' ], 'c': [ 'S' ] },
			}
			const alpha = new Set([ 'a', 'b', 'c' ])

			const dfa = new NFA(start, accept, table)
			assert.deepStrictEqual(dfa.alphabet, alpha)
		})
	})
})
