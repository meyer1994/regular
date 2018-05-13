
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
   *  'S' : { 'a': [ 'A' ], 'b': [ 'B' ], 'c': [ 'C' ] }
   *  'A' : { 'a': [ 'B' ], 'b': [ 'B' ], 'c': [ 'B' ] }
   *  'B' : { 'a': [ 'C' ], 'b': [ 'C' ], 'c': [ 'C' ] }
   *  'C' : {}  // absence of transitions we assume they do not exist, or go to
   *            // some error state
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
    this.accept = new Set(accept)
    this.table = table
    this.alphabet = new Set()

    // Remove useless transitions from table
    for (let state in this.table) {
      for (let transition in this.table[state]) {
        const val = this.table[state][transition]
        if (val.length === 0) {
          delete this.table[state][transition]
        }
      }
    }

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

  /**
   * @brief Checks if the NFA is deterministic or not.
   *
   * An FA is deterministic if there is only one possible transition from one
   * state to another by each character.
   *
   * Example:
   *   |   a  |
   * --|------|
   * S | A, B |
   * --|------|
   * A |   B  |
   * --|------|
   * B |   C  |
   * Is not deterministic.
   *
   * But this one is:
   *   | a |
   * --|---|
   * S | A |
   * --|---|
   * A | B |
   * --|---|
   * B | C |
   *
   * This algorithm simply checks if the list of possible transitions for each
   * character is bigger than 1.
   *
   * @return {Boolean} True if deterministic, false otherwise.
   */
  isDeterministic () {
    // For every state
    for (let state in this.table) {
      const row = this.table[state]
      // Check if there is more than one possible transition per character
      for (let alpha in row) {
        const destiny = row[alpha]
        if (destiny.length > 1) {
          return false
        }
      }
    }
    return true
  }

  /**
   * @brief Determinize the NFA, if non-deterministic.
   */
  determinize () {
    const newTable = {}
    const stack = [ [ this.start ] ]

    // Iterate over possible transitions
    while (stack.length > 0) {
      const currentStates = stack.pop()
      const stateName = currentStates.join()

      newTable[stateName] = {}

      const transitions = this.getTransitions(currentStates)
      for (let char of transitions) {
        const reachableSet = this.getReach(currentStates, char)
        const reachableStates = [...reachableSet].sort()
        const reachableName = reachableStates.join()

        if (!(reachableName in newTable)) {
          stack.push(reachableStates)
        }

        // Update new table
        newTable[stateName][char] = [ reachableName ]
      }
    }

    // Find final states
    const acceptStates = []
    for (let state in newTable) {
      for (let accept of this.accept) {
        const containsFinal = state.indexOf(accept) !== -1
        if (containsFinal) {
          acceptStates.push(state)
          break
        }
      }
    }

    // Update properties
    this.accept = new Set(acceptStates)
    this.table = newTable
  }

  /**
   * @brief Gets the possible characters from a list of states.
   *
   * @param  {Array} states List of states to get the possible characters.
   *
   * @return {Set} Set containing the transitions.
   */
  getTransitions (states) {
    const set = new Set()

    for (let state of states) {
      const transitions = Object.keys(this.table[state])
      transitions.forEach(i => set.add(i))
    }

    return set
  }

  /**
   * @brief Gets the possible states that are reachable from a list of states
   *        by some character.
   *
   * @param {Array}  states List of states to check for possible next states.
   * @param {String} char   Char to check for the transition.
   *
   * @return {Set}  Set containing reahcable states.
   */
  getReach (states, symbol) {
    const set = new Set()

    // Removes states that do not have the passed symbol as a transition
    const filteredStates = states.filter(i => symbol in this.table[i])

    for (let state of filteredStates) {
      const nextStates = this.table[state][symbol]
      nextStates.forEach(i => set.add(i))
    }

    return set
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
