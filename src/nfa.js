
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
        this.table[state][transition] = new Set(val)

        if (val.length === 0) {
          delete this.table[state][transition]
        }
      }
    }

    // Gets alphabet
    for (let state in table) {
      const row = Object.keys(table[state])
      row.forEach(i => this.alphabet.add(i))
    }
  }

  toRegExp () {
    throw new Error('TODO')
  }

  toGrammar () {
    throw new Error('TODO')
  }

  /**
   * Checks if some string is contained in the language of this automaton.
   *
   * @param  {String} wordInput String to check.
   *
   * @return {[type]}           True if it belongs, false otherwise.
   */
  match (wordInput) {
    const word = wordInput.split('').reverse()

    let state = this.start
    while (word.length > 0) {
      const char = word.pop()

      if (!(char in this.table[state])) {
        return false
      }

      // Holy!!! This is ugly
      state = this.table[state][char].values().next().value
    }

    return this.accept.has(state)
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
    for (let state in this.table) {
      const row = this.table[state]
      for (let alpha in row) {
        const destiny = row[alpha]
        if (destiny.size > 1) {
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
    this.removeEpslon()

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
        const reachableStates = Array.from(reachableSet).sort()
        const reachableName = reachableStates.join()

        if (!(reachableName in newTable)) {
          stack.push(reachableStates)
        }

        // Update new table
        newTable[stateName][char] = new Set([ reachableName ])
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
   * @param  {Iterable} states List of states to get the possible characters.
   *
   * @return {Set} Set containing the transitions.
   */
  getTransitions (states) {
    const set = new Set()

    for (let state of states) {
      Object
        .keys(this.table[state])
        .forEach(i => set.add(i))
    }
    set.delete('&')
    return set
  }

  /**
   * @brief Gets the possible states that are reachable from a list of states
   *        by some character.
   *
   * @param {Iterable}  states List of states to check for possible next states.
   * @param {String}    char   Char to check for the transition.
   *
   * @return {Set}  Set containing reahcable states.
   */
  getReach (states, symbol) {
    const set = new Set()

    for (const state of states) {
      if (symbol in this.table[state]) {
        this.table[state][symbol].forEach(i => set.add(i))
      }
    }

    return set
  }

  /**
   * Removes epslon transitions from automaton.
   *
   * It works in 4 steps:
   * 1 - Get epslon closure of each state;
   * 2 - For every symbol in the alphabet, get the next possible states for the
   * closure;
   * 3 - For the set of states obtained in step 2, get the epslon closure again;
   * 4 -
   */
  removeEpslon () {
    const newTable = {}
    const newAccept = new Set()

    for (const state in this.table) {
      newTable[state] = {}

      const closure = this.getEpslonClosure([ state ])
      for (const accept of this.accept) {
        if (closure.has(accept)) {
          newAccept.add(state)
        }
      }
      const transitions = this.getTransitions(closure)

      for (const symbol of transitions) {
        const reach = this.getReach(closure, symbol)
        const reachClosure = this.getEpslonClosure(reach)

        newTable[state][symbol] = reachClosure
      }
    }

    // Update object
    this.table = newTable
    this.accept = newAccept
  }

  /**
   * Gets the closure of a symbolm from a list of states.
   *
   * @param  {Iterable}  states List of states to start from.
   *
   * @return {Set}        Set containing the closure of reach of epslon.
   */
  getEpslonClosure (states) {
    const symbol = '&'
    const set = new Set(states)
    const visited = new Set()
    const stack = [ Array.from(states) ]

    while (stack.length > 0) {
      const notVisited = stack
        .pop()
        .filter(i => !visited.has(i))

      // Visits states
      notVisited.forEach(i => visited.add(i))

      // Adds reach to set
      const nextStates = this.getReach(notVisited, symbol)
      nextStates.forEach(i => set.add(i))
      if (nextStates.size > 0) {
        stack.push(Array.from(nextStates))
      }
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
