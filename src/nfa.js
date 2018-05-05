
class NFA {
	/**
	 * @brief Constructor
	 *
	 * The transition table will be in the following form:
	 * Accepts 'aaa', 'bb' and 'c'.
	 *   | a | b | c |
	 * --|---|---|---|
	 * S | A | B | C |
	 * --|---|---|---|
	 * A | B | B | B |
	 * --|---|---|---|
	 * B | C | C | C |
	 * --|---|---|---|
	 * C | - | - | - |
	 *
	 * As an object:
	 * {
	 * 	'S' : { 'a': [ 'A' ], 'b': [ 'B' ], 'c': [ 'C' ] }
	 * 	'A' : { 'a': [ 'B' ], 'b': [ 'B' ], 'c': [ 'B' ] }
	 * 	'B' : { 'a': [ 'C' ], 'b': [ 'C' ], 'c': [ 'C' ] }
	 * 	'C' : { 'a': [], 'b': [], 'c': [] }
	 * }
	 *
	 * Both representations represent the exact same thing.
	 *
	 * @param {String} start  String representing the starting state.
	 * @param {Array}  accept List of string representing accepting states.
	 * @param {Object} table  Object representing the table of states transitions.
	 */
  constructor (start, accept, table) {
    this.start = start
    this.accept = accept
  	this.table = table
    this.alphabet = new Set()

    // Gets alphabet
    for (let state in table) {
    	const row = table[state]
    	for (let alpha in row) {
    		this.alphabet.add(alpha)
    	}
    }
  }

  toRegExp () {
    throw new Error('TODO')
  }

  toGrammar () {
    throw new Error('TODO')
  }

  static minimize (dfa) {
    throw new Error('TODO')
  }

  static intersection (dfa, dfb) {
    throw new Error('TODO')
  }

  static diff (dfa, dfb) {
    throw new Error('TODO')
  }

  static reverse (dfa, dfb) {
    throw new Error('TODO')
  }
}

module.exports = NFA
