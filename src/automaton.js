import HashSet from './hashset'
import Transition from './transition'

const EPSILON = '&'

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
      const reach = this._reach(currentStates, EPSILON)

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
    let index = 0
    // Recursion stack
    const start = this.epsilonClosure([ this.start ])
    const stack = [ start ]

    while (stack.length > 0) {
      const symbol = symbols[index++]
      const states = stack.pop()

      // Get transitions from current states with the current symbol
      const reach = this.reach(states, symbol)

      // If not at end of input, continue
      if (index !== symbols.length) {
        stack.push(reach)
        continue
      }

      // At the end of input, if there is a final state in reachable states
      const hasFinal = reach.intersect(this.finals)
      return hasFinal.size > 0
    }
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
    const epsilonLess = this.transitions.filter(i => i.symbol !== EPSILON)

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
}
