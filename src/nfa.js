
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
  /**
   * auto completes the missing transitions of automata
   * transitions table.
   */
  complete () {
    const newState = 'qdead'
    let isComplete = true
    Object.values(this.table).forEach(row => {
      for (const char of this.alphabet) {
        if (row[char] === undefined || row[char] === []) {
          row[char] = new Set([ newState ])
          isComplete = false
        }
      }
    })
    if (!isComplete) {
      this.table[newState] = {}
      for (const char of this.alphabet) {
        this.table[newState][char] = new Set([ newState ])
      }
    }
  }

  /**
   * transforms automaton states into q1, q2, ..., qn.
   *
   * @param {number} begin number which q to start.
   */
  beautifyQn (begin = 0) {
    const newTable = {}
    const dict = {}
    dict[this.start] = 'q' + begin
    begin++
    // dict construction
    Object.keys(this.table).forEach(state => {
      if (state !== this.start) {
        dict[state] = 'q' + begin
        begin++
      }
    })
    // new table construction
    Object.entries(this.table).forEach(([state, row]) => {
      const beautifulState = dict[state]
      newTable[beautifulState] = {}
      Object.entries(row).forEach(([nonTerminalSymbol, reachableStates]) => {
        const beautifulReachableStates = new Set()
        for (const state of reachableStates) {
          beautifulReachableStates.add(dict[state])
        }
        newTable[beautifulState][nonTerminalSymbol] = beautifulReachableStates
      })
    })
    // accept states construction
    const newAccept = new Set()
    for (const state of this.accept) {
      newAccept.add(dict[state])
    }
    // altering object
    this.start = dict[this.start]
    this.table = newTable
    this.accept = newAccept
  }

  /**
   * @brief Calculates FA1 U FA2.
   *
   * @param {NFA} fa1 Finite automata 1.
   * @param {NFA} fa2 Finite automate 2.
   *
   * @return {NFA} FA that represents FA1 union with FA2.
   */
  static union (fa1, fa2) {
    // assert both automatas don't have states with same name
    fa1.beautifyQn()
    fa2.beautifyQn(Object.keys(fa1).length - 1)
    // create new initial state
    const initialState = 'qinitial'
    // create acceptStates
    const finalStates = []
    if (fa1.accept.has(fa1.start) || fa2.accept.has(fa2.start)) {
      finalStates.push(initialState)
    }
    for (const state of fa1.accept) {
      finalStates.push(state)
    }
    for (const state of fa2.accept) {
      finalStates.push(state)
    }
    // create new transitions table
    const newTable = {}
    const visitedTransitions = new Set()
    Object.entries(fa1.table).forEach(([state, row]) => {
      newTable[state] = row
    })
    Object.entries(fa2.table).forEach(([state, row]) => {
      newTable[state] = row
    })
    // copies transitions from previous initial states to new initial state
    newTable[initialState] = {}
    Object.entries(fa1.table[fa1.start]).forEach(([transition, states]) => {
      newTable[initialState][transition] = new Set(states)
      if (fa2.table[fa2.start][transition]) {
        newTable[initialState][transition].add(...fa2.table[fa2.start][transition])
      }
      visitedTransitions.add(transition)
    })
    Object.entries(fa2.table[fa2.start]).forEach(([transition, states]) => {
      if (!visitedTransitions.has(transition)) {
        newTable[initialState][transition] = new Set(states)
      }
    })
    return new NFA(initialState, finalStates, newTable)
  }

  /**
   * @brief concatenates FA1 with FA2.
   *
   * @param {NFA} fa1 Finite automata 1.
   * @param {NFA} fa2 Finite automate 2.
   *
   * @return {NFA} FA that represents FA1 concatenated with FA2.
   */
  static concat (fa1, fa2) {
    // assert both automatas don't have states with same name
    fa1.beautifyQn()
    fa2.beautifyQn(Object.keys(fa1).length - 1)
    const newStart = fa1.start
    let newTable = Object.assign({}, fa1.table)
    const newAccept = fa2.accept
    Object.entries(fa2.table[fa2.start]).forEach(([char, states]) => {
      for (const finalState of fa1.accept) {
        if (newTable[finalState][char] === undefined) {
          newTable[finalState][char] = new Set(states)
        } else {
          for (const state of states) {
            newTable[finalState][char].add(state)
          }
        }
      }
    })
    newTable = Object.assign(newTable, fa2.table)
    if (fa2.accept.has(fa2.start)) {
      for (const acceptState of fa1.accept) {
        newAccept.add(acceptState)
      }
    }
    return new NFA(newStart, newAccept, newTable)
  }

  /**
   * @brief produces the automata representing the star of the
   * original automata.
   *
   * @param {NFA} fa original finite automata.
   *
   * @return {NFA} FA that is the star of original FA.
   */
  static star (fa) {
    const newStart = fa.start
    const newTable = Object.assign({}, fa.table)
    const newAccept = fa.accept
    Object.entries(newTable[newStart]).forEach(([char, states]) => {
      for (const acceptState of newAccept) {
        if (newTable[acceptState][char] === undefined) {
          newTable[acceptState][char] = states
        } else {
          for (const state of states) {
            newTable[acceptState][char].add(state)
          }
        }
      }
    })
    return new NFA(newStart, newAccept, newTable)
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

  /**
   * @brief revertes the automata. Everything that was accepted
   * now is rejected and everything that was rejected now is accepted.
   *
   * @param {NFA} dfa DFA to be reversed.
   *
   * @return {NFA} reversed DFA.
   */
  static reverse (dfa) {
    const reversedDFA = new NFA(dfa.start, dfa.accept, dfa.table)
    reversedDFA.determinize()
    reversedDFA.complete()
    const newAccept = new Set()
    Object.keys(reversedDFA.table).forEach(state => {
      if (!reversedDFA.accept.has(state)) {
        newAccept.add(state)
      }
    })
    reversedDFA.accept = newAccept
    return reversedDFA
  }
}

module.exports = NFA
