import HashSet from './hashset'
import Transition from './transition'

export default class Automaton {
  /**
   * Constructor of an automaton.
   *
   * It follows the formal definition.
   *
   * @param  {HashSet} states Set of states.
   * @param  {HashSet} alphabet Set of symbols. Each symbol can be a string.
   * @param  {HashSet} transitions Set of transitions objects.
   * @param  {String} start String of the starting state.
   * @param  {HashSet} finals Set of final/acceptance states.
   */
  constructor (states, alphabet, transitions, start, finals) {
    this.states = states
    this.alphabet = alphabet
    this.transitions = transitions
    this.start = start
    this.finals = finals
  }

  static get EPSILON () {
    return '&'
  }

  get EPSILON () {
    return Automaton.EPSILON
  }

  /**
   * Gets the closure of a set of states with some symbol
   *
   * @param  {Iterable[String]} states States to start the clousre from.
   * @param  {String} symbol String with the symbol.
   *
   * @return {HashSet[String]} Set of states that can be reached with some symbol.
   */
  reach (states, symbol) {
    const closure = this.epsilonClosure(states)
    const reach = this._reach(closure, symbol)
    return this.epsilonClosure(reach)
  }

  /**
   * Auxiliary function.
   *
   * It gets the directly reachable states with some symbol.
   *
   * @param  {Iterable[String]} states Set of states get the reach of.
   * @param  {String} symbol Symbol to check for transitions.
   *
   * @return {HashSet[String]} Set of reachable states.
   */
  _reach (states, symbol) {
    let result = new HashSet()
    for (const state of states) {
      const reachableStates = this
        .transitions
        .filter(i => i.from === state)
        .filter(i => i.symbol === symbol)
        .map(i => i.to)
      result = reachableStates.union(result)
    }
    return result
  }

  /**
   * Returns epsilon closure of an array of states.
   *
   * @param  {Iterable[String]} states States to get epsilon closure of.
   *
   * @return {HashSet[String]} Set of reachable states through epsilon
   *                           transistions.
   */
  epsilonClosure (states) {
    // Every state visits itself with epsilon transitions
    let visited = new HashSet(states)
    const stack = [ states ]

    while (stack.length > 0) {
      const currentStates = stack.pop()
      const reach = this._reach(currentStates, this.EPSILON)

      // Visited everyone already
      const notVisited = reach.diff(visited)
      if (notVisited.size === 0) {
        break
      }

      // Visits the rest
      stack.push(notVisited)
      visited = notVisited.union(visited)
    }
    return visited
  }

  /**
   * Checks if an array of symbols is accepted by the language of the
   * automaton.
   *
   * @param  {Array[String]} symbols Array of symbols.
   *
   * @return {Boolean} True if it is accepted. False otherwise.
   */
  match (symbols) {
    // Recursion stack
    const start = this.epsilonClosure([ this.start ])
    let states = start

    // Ride through automaton
    for (const symbol of symbols) {
      states = this.reach(states, symbol)
    }

    // If there is a final state in reachable states
    const finalStates = states.intersect(this.finals)
    return finalStates.size > 0
  }

  /**
   * Checks if the automaton is deterministic or not.
   *
   * An automaton is deterministic if, for every state there is, at most, one
   * transition per alphabet symbol.
   *
   * @return {Boolean} True if deterministic. False otherwise.
   */
  isDeterministic () {
    // If there is a state
    for (const state of this.states) {
      // That with one symbol
      for (const symbol of this.alphabet) {
        const reach = this.reach([ state ], symbol)
        // Can reach more than one state
        if (reach.size > 1) {
          // It is non deterministic
          return false
        }
      }
    }
    return true
  }

  /**
   * Removes epsilon transitions and returns new automaton.
   *
   * @return {Automaton} Automaton equivalent to this one but without epsilon
   *                     transitions.
   */
  removeEpsilon () {
    // New automaton parameters
    const newStates = this.states
    const newAlphabet = this.alphabet
    let newTransitions = new HashSet()
    const newStart = this.start
    const newFinals = this.finals

    // For each state
    for (const state of this.states) {
      // For each symbol
      for (const symbol of this.alphabet) {
        // Get the reach of state with that symbol
        const reach = this.reach([ state ], symbol)
        // Creates new transitions
        const newTrans = reach.map(to => new Transition(state, symbol, to))
        newTransitions = newTransitions.union(newTrans)
      }
    }

    // Epsilonless transitions
    const epsilonLess = this.transitions.filter(i => i.symbol !== this.EPSILON)

    // Add non epsilon transitions to newTransitions
    newTransitions = epsilonLess.union(newTransitions)

    return new Automaton(
      newStates,
      newAlphabet,
      newTransitions,
      newStart,
      newFinals
    )
  }

  /**
   * Performs the determinization of the automaton.
   *
   * @return {Automaton} New, equivalent, automaton that is deterministic.
   */
  determinize () {
    const start = this.epsilonClosure([ this.start ])

    // New automaton parameters
    let newStates = new HashSet()
    const newAlphabet = this.alphabet
    const newTransitions = new HashSet()
    const newStart = start.values().sort().join()
    const newFinals = new HashSet()

    const stack = [ start ]
    while (stack.length > 0) {
      const fromStates = stack.pop()
      const fromStatesName = fromStates.values().sort().join()

      // State already processed
      if (newStates.has(fromStates)) {
        continue
      }
      // Add state
      newStates.add(fromStates)

      for (const symbol of this.alphabet) {
        const reach = this.reach(fromStates, symbol)
        if (reach.size === 0) {
          continue
        }
        stack.push(reach)

        // Add transition
        const stateName = reach.values().sort().join()
        const trans = new Transition(fromStatesName, symbol, stateName)
        newTransitions.add(trans)
      }
    }

    // Add final states
    for (const state of newStates) {
      const finals = this.finals.intersect(state)
      if (finals.size > 0) {
        const stateName = state.values().sort().join()
        newFinals.add(stateName)
      }
    }

    // Convert states to strings
    newStates = newStates.map(i => i.values().sort().join())

    return new Automaton(
      newStates,
      newAlphabet,
      newTransitions,
      newStart,
      newFinals
    )
  }

  /**
   * Checks if the automaton does not recognize anything.
   *
   * @return {Boolean} True if it is an empty automaton. False othwerise.
   */
  empty () {
    return this.finals.size < 1
  }
}
