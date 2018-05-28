
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
    this.accept = accept
    this.table = table

    this.fillTransitions()
  }

  get alphabet () {
    const set = new Set()
    const rows = Object.values(this.table)

    for (const row of rows) {
      Object
        .keys(row)
        .forEach(i => set.add(i))
    }

    return Array.from(set)
  }

  /**
   * Fill out omitted transitions.
   *
   * It creates an empty array and stores it into the states transitions.
   */
  fillTransitions () {
    const alphabet = this.alphabet
    const rows = Object.values(this.table)

    for (const row of rows) {
      for (const symbol of alphabet) {
        if (!(symbol in row)) {
          row[symbol] = []
        }
      }
    }
  }

  /**
   * Checks if some string is contained in the language of this automaton.
   *
   * @param  {String} wordInput String to check.
   *
   * @return {Boolean}           True if it belongs, false otherwise.
   */
  match (wordInput) {
    const word = wordInput.split('').reverse()

    let state = this.start
    while (word.length > 0) {
      const char = word.pop()

      const transitions = this.getTransitions([ state ])
      if (!transitions.includes(char)) {
        return false
      }

      // Assumes it is deterministic
      state = this.table[state][char][0]
    }

    return this.accept.includes(state)
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
    const rows = Object.values(this.table)

    for (const row of rows) {
      for (const symbol in row) {
        const destination = row[symbol]
        if (destination.length > 1) {
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
    const newAccept = []
    const stack = [ [ this.start ] ]

    // Iterate over possible transitions
    while (stack.length > 0) {
      const currentStates = stack.pop()
      const currentStateName = currentStates.join()

      newTable[currentStateName] = {}

      const transitions = this.getTransitions(currentStates)
      for (const symbol of transitions) {
        const reachable = this.getReach(currentStates, symbol)
        const reachableName = reachable.join()

        if (!(reachableName in newTable)) {
          stack.push(reachable)
        }

        // Update new table
        newTable[currentStateName][symbol] = [ reachableName ]
      }
    }

    // Find final states
    for (const state in newTable) {
      for (const accept of this.accept) {
        const containsFinal = state.indexOf(accept) !== -1
        if (containsFinal) {
          newAccept.push(state)
          break
        }
      }
    }

    // Update properties
    this.accept = newAccept.sort()
    this.table = newTable
    this.fillTransitions()
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

    for (const state of states) {
      const row = this.table[state]

      for (const transition in row) {
        const destination = row[transition]
        if (destination.length !== 0) {
          set.add(transition)
        }
      }
    }
    set.delete('&')

    return Array.from(set).sort()
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
      const transitions = Object.keys(this.table[state])

      if (transitions.includes(symbol)) {
        const row = this.table[state]
        const destinations = row[symbol]
        destinations.forEach(i => set.add(i))
      }
    }

    return Array.from(set).sort()
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
    // New values
    const newTable = {}
    const newAccept = new Set()

    for (const state in this.table) {
      newTable[state] = {}

      // Check for the new accepts
      const closure = this.getEpslonClosure([ state ])
      for (const accept of this.accept) {
        if (closure.includes(accept)) {
          newAccept.add(state)
        }
      }

      // Get closures
      const transitions = this.getTransitions(closure)
      for (const symbol of transitions) {
        const reach = this.getReach(closure, symbol)
        const reachClosure = this.getEpslonClosure(reach)
        newTable[state][symbol] = reachClosure
      }
    }

    // Update object
    this.table = newTable
    this.accept = Array.from(newAccept).sort()
    this.fillTransitions()
  }

  /**
   * Gets the closure of a symbolm from a list of states.
   *
   * @param  {Iterable}  states List of states to start from.
   *
   * @return {Set}        Set containing the closure of reach of epslon.
   */
  getEpslonClosure (states) {
    const set = new Set(states)
    const visited = new Set()
    const stack = [ states ]

    while (stack.length > 0) {
      const notVisited = stack
        .pop()
        .filter(i => !visited.has(i))

      // Visits states
      notVisited.forEach(i => visited.add(i))

      // Adds reach to set
      const nextStates = this.getReach(notVisited, '&')
      nextStates.forEach(i => set.add(i))
      if (nextStates.length > 0) {
        stack.push(nextStates)
      }
    }

    return Array.from(set).sort()
  }

  /**
   * Checks if the NFA is complete.
   *
   * An automata is complete if there is one transition for each symbol of the
   * alphabet in every state.
   *
   * @return {Boolean} True if complete, false otherwise.
   */
  isComplete () {
    const rows = Object.values(this.table)
    for (const row of rows) {
      for (const char of this.alphabet) {
        if (row[char].length === 0) {
          return false
        }
      }
    }

    return true
  }

  /**
   * auto completes the missing transitions of automata
   * transitions table.
   */
  complete (errorState = 'qdead') {
    let errorAdded = false

    // Add error state where it needs to
    const rows = Object.values(this.table)
    for (const row of rows) {
      for (const symbol of this.alphabet) {
        if (row[symbol].length === 0) {
          row[symbol] = [ errorState ]
          errorAdded = true
        }
      }
    }

    // Create error state
    if (errorAdded) {
      this.table[errorState] = {}
      for (const char of this.alphabet) {
        this.table[errorState][char] = [ errorState ]
      }
    }
  }

  /**
   * transforms automaton states into q1, q2, ..., qn.
   *
   * @param {number} begin number which q to start.
   */
  beautify (begin = 0, prefix = 'q') {
    const newTable = {}
    const dict = {}

    // Creates a new state for each, already existing, state
    dict[this.start] = prefix + begin++
    for (const state in this.table) {
      if (state !== this.start) {
        dict[state] = prefix + begin++
      }
    }

    // Translate the old table to the new table, with new names
    const entries = Object.entries(this.table)
    for (const [state, row] of entries) {
      const newState = dict[state]
      newTable[newState] = {}

      const rowEntries = Object.entries(row)
      for (const [symbol, reachable] of rowEntries) {
        const newReachable = reachable.map(i => dict[i])
        newTable[newState][symbol] = newReachable
      }
    }

    // Accept states construction
    const newAccept = this.accept.map(i => dict[i])

    // Updating object
    this.start = dict[this.start]
    this.table = newTable
    this.accept = newAccept

    this.fillTransitions()
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
    // Assert both automatas don't have states with same name
    fa1.beautify()
    fa2.beautify(Object.keys(fa1).length)

    // New initial state
    const initialState = 'qinitial'

    // New accept states
    const finalStates = fa1.accept.concat(fa2.accept)
    if (fa1.accept.includes(fa1.start) || fa2.accept.includes(fa2.start)) {
      finalStates.push(initialState)
    }

    // New table
    const newTable = {}

    // Add both automatas transitions to new table
    Object
      .entries(fa1.table)
      .forEach(([state, row]) => { newTable[state] = row })
    Object
      .entries(fa2.table)
      .forEach(([state, row]) => { newTable[state] = row })

    // Creates new initial state
    newTable[initialState] = {}

    // So it fills up the ommitted transitions
    const nfa = new NFA(initialState, finalStates, newTable)

    // Copies transitions from previous initial states to new initial state
    const start1 = Object.entries(fa1.table[fa1.start])
    const start2 = Object.entries(fa2.table[fa2.start])

    for (const [symbol, states] of start1) {
      nfa.table[initialState][symbol].push(...states)
    }
    for (const [symbol, states] of start2) {
      nfa.table[initialState][symbol].push(...states)
    }

    // Sort states transitions by state name
    for (const row of Object.values(nfa.table)) {
      for (const transition of Object.values(row)) {
        transition.sort()
      }
    }

    return nfa
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
    fa1.beautify()
    fa2.beautify(Object.keys(fa1).length)

    const newStart = fa1.start
    let newTable = Object.assign({}, fa1.table)
    const newAccept = fa2.accept

    const entries = Object.entries(fa2.table[fa2.start])
    for (const [char, states] of entries) {
      for (const finalState of fa1.accept) {
        newTable[finalState][char].push(...states)
      }
    }

    newTable = Object.assign(newTable, fa2.table)
    if (fa2.accept.includes(fa2.start)) {
      newAccept.push(...fa1.accept)
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
    const newAccept = fa.accept
    const newTable = Object.assign({}, fa.table)

    const entries = Object.entries(newTable[newStart])
    for (const [char, states] of entries) {
      for (const acceptState of newAccept) {
        newTable[acceptState][char].push(...states)
      }
    }

    return new NFA(newStart, newAccept, newTable)
  }

  /**
   * Remove state
   * @param  {[type]} states [description]
   * @return {[type]}        [description]
   */
  removeState (state) {
    // Remove from start
    if (this.start === state) {
      this.start = ''
    }

    // Remove from accept
    const index = this.accept.indexOf(state)
    if (index !== -1) {
      this.accept.splice(index, 1)
    }

    // Remove from table
    delete this.table[state]

    // Remove other entries
    const rows = Object.values(this.table)
    for (const row of rows) {
      const rowStates = Object.values(row)
      for (const states of rowStates) {
        const index = states.indexOf(state)
        if (index !== -1) {
          states.splice(index, 1)
        }
      }
    }
  }

  get states () {
    return Object.keys(this.table)
  }

  /**
   * @brief removes states that can't be reached from automata.
   */
  removeUnreachable () {
    const visited = new Set()
    const stack = [ this.start ]

    // Get unreachable states
    while (stack.length > 0) {
      const currentState = stack.pop()

      visited.add(currentState)

      for (const symbol of this.alphabet) {
        const reach = this.getReach([ currentState ], symbol)
        reach
          .filter(i => !visited.has(i))
          .forEach(i => stack.push(i))
      }
    }

    // Remove them
    this
      .states
      .filter(i => !visited.has(i))
      .forEach(i => this.removeState(i))
  }

  /**
   * @brief removes states that can't reach a accept state.
   */
  removeDead () {
    const notDead = new Set(this.accept)

    while (true) {
      const marked = new Set()

      for (const state of this.states) {
        if (notDead.has(state)) {
          continue
        }

        for (const char of this.alphabet) {
          const reach = this.getReach([ state ], char)
          for (const reachableState of reach) {
            if (notDead.has(reachableState)) {
              marked.add(state)
            }
          }
        }
      }

      if (marked.size === 0) {
        break
      }

      marked.forEach(i => notDead.add(i))
    }

    this
      .states
      .filter(i => !notDead.has(i))
      .forEach(i => this.removeState(i))
  }

  /**
   * @brief Merge equivalent states.
   */
  mergeEquivalents () {
    const nonFinal = this.states.filter(i => !this.accept.includes(i))

    const undistiguishable = new Set()
    combinations(Array.from(this.accept), 2)
      .forEach(i => undistiguishable.add(i))
    combinations(nonFinal, 2)
      .forEach(i => undistiguishable.add(i))

    while (true) {
      let newDistiguishableFound = false
      const undistiguishableCopy = new Set(undistiguishable)
      for (const pair of undistiguishableCopy) {
        const [stateA, stateB] = pair

        if (!this.areUndistinguishable(stateA, stateB, undistiguishableCopy)) {
          undistiguishable.delete(pair)
          newDistiguishableFound = true
        }
      }

      if (!newDistiguishableFound) {
        break
      }
    }
    for (const [stateA, stateB] of undistiguishable) {
      this.mergeStates(stateA, stateB)
    }
  }

  /**
   * @brief State a and b are distinguishable if they go to distinguishable
   * states for some input symbol.
   *
   * @param {string} stateA
   * @param {string} stateB
   * @param {Set} undistiguishable
   */
  areUndistinguishable (stateA, stateB, undistiguishable) {
    for (const symbol of this.alphabet) {
      const transitionA = this.getReach([ stateA ], symbol)[0]
      const transitionB = this.getReach([ stateB ], symbol)[0]
      if (transitionA !== transitionB) {
        let has = false
        for (const set of undistiguishable) {
          const newSet = new Set([ transitionA, transitionB ])
          if (equals(newSet, set)) {
            has = true
            break
          }
        }

        if (!has) {
          return false
        }
      }
    }
    return true
  }

  /**
   * @brief merges stateB into stateA, making them one state.
   *
   * @param {string} stateA
   * @param {string} stateB
   */
  mergeStates (stateA, stateB) {
    // Change start
    if (stateB === this.start) {
      this.start = stateA
    }

    // Remove from accept
    const index = this.accept.indexOf(stateB)
    if (index !== -1) {
      this.accept.splice(index, 1)

      // Add A to accept, if not in there
      if (!this.accept.includes(stateA)) {
        this.accept.push(stateA)
      }
    }

    // Delete state B
    delete this.table[stateB]

    // Replace all appearences of state B with state A
    const rows = Object.values(this.table)
    for (const row of rows) {
      for (const symbol of this.alphabet) {
        if (row[symbol][0] === stateB) {
          row[symbol] = [ stateA ]
        }
      }
    }
  }

  /**
   * minimizes the automata.
   *
   * @param {NFA} dfa
   *
   * @return {NFA} dfa minimized.
   */
  minimize () {
    this.determinize()
    this.removeUnreachable()
    this.removeDead()
    this.mergeEquivalents()
    this.beautify()
  }

  /**
   * @brief calculates the intersection between two DFA's.
   *
   * @param {NFA} dfa
   * @param {NFA} dfb
   *
   * @return {NFA} returns FA that represents the intersection of dfa with dfb.
   */
  static intersection (dfa, dfb) {
    const complementA = NFA.complement(dfa)
    const complementB = NFA.complement(dfb)
    const union = NFA.union(complementA, complementB)
    return NFA.complement(union)
  }

  /**
   * @brief calculates DFA - DFB.
   *
   * @param {NFA} dfa
   * @param {NFA} dfb
   *
   * @returns returns FA that represents DFA - DFB
   */
  static diff (dfa, dfb) {
    const complementB = NFA.complement(dfb)
    return NFA.intersection(dfa, complementB)
  }

  /**
   * @brief Gets automata that represents the complement of the one passed.
   *
   * @param {NFA} dfa DFA to get the complement.
   *
   * @return {NFA} Complement of DFA.
   */
  static complement (dfa) {
    // Apply properties
    const complementedNFA = new NFA(dfa.start, dfa.accept, dfa.table)
    complementedNFA.determinize()
    complementedNFA.complete()

    // Gets states that are not accept states
    const nonAccept = Object
      .keys(complementedNFA.table)
      .filter(i => !complementedNFA.accept.includes(i))

    // Switch
    complementedNFA.accept = nonAccept

    return complementedNFA
  }
}

function combinations (array, size) {
  const result = new Set()

  function p (t, i) {
    if (t.length === size) {
      result.add(new Set(t))
      return
    }
    if (i + 1 > array.length) {
      return
    }
    p(t.concat(array[i]), i + 1)
    p(t, i + 1)
  }

  p([], 0)
  return result
}

function difference (setA, setB) {
  const difference = new Set(setA)
  for (const elem of setB) {
    difference.delete(elem)
  }
  return difference
}

function equals (setA, setB) {
  return difference(setA, setB).size === 0
}

module.exports = NFA
