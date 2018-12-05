import HashSet from './hashset'

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
   * Epsilon symbol.
   */
  static get EPSILON () {
    return '&'
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
   * Returns epsilo closure of an array of states.
   *
   * @param  {Iterable[String]} states States to get epsilon closure of.
   *
   * @return {HashSet[String]} Set of reachable states through epsilon transistions.
   */
  epsilonClosure (states) {
    // Every state visits itself with epsilon transitions
    let visited = new HashSet(states)
    const stack = [ states ]

    while (stack.length > 0) {
      const currentStates = stack.pop()
      const reach = this._reach(currentStates, Automaton.EPSILON)

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
    const start = [ this.start ]
    const stack = [ this.epsilonClosure(start) ]

    while (stack.length > 0) {
      const symbol = symbols[index++]
      const states = stack.pop()

      // Get transitions from current states with the current symbol
      const closure = this.epsilonClosure(states)
      const reach = this.reach(closure, symbol)
      const reachClosure = this.epsilonClosure(reach)

      // If not at end of input, continue
      if (index !== symbols.length) {
        stack.push(reachClosure)
        continue
      }

      // At end of input
      const hasFinal = reachClosure.intersect(this.finals)
      return hasFinal.size > 0
    }
  }

  /**
   * Checks if the automaton is deterministic or not.
   *
   * @return {Boolean} True if deterministic. False otherwise.
   */
  isDeterministic () {
    for (const state of this.states) {
      for (const symbol of this.alphabet) {
        const reach = this.reach([ state ], symbol)
        if (reach.size > 1) {
          return false
        }
      }
    }
    return true
  }
}
