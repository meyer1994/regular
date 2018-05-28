
class Grammar {
  /**
   * Constructor.
   *
   * The object passed must obey the following criteria:
   * - Keys are the production symbols, uppercase;
   * - Values are the productions, 1 or 2 characters, the second one must be
   *   uppercase and must be of one of the key values.
   *
   * Example:
   * Grammar, which produces odd number of 'a':
   * S -> aA | a
   * A -> aS
   *
   * Object representation:
   * {
   *   'S': ['aA', 'a'],
   *   'A': ['aS']
   * }
   *
   * @param  {Object} obj Object representing the regular grammar.
   */
  constructor (first, productions) {
    this.first = first
    this.productions = productions
  }

  /**
   * Generates a grammar from a non-deterministic finite automaton.
   *
   * @param {NFA} nfa
   *
   * @return New Grammar object that represents
   */
  static fromNFA (nfa) {
    let firstSymbol = nfa.start
    const productions = {}

    const entries = Object.entries(nfa.table)
    for (const [state, row] of entries) {
      const rowEntries = Object.entries(row)
      productions[state] = []
      for (const [symbol, states] of rowEntries) {
        productions[state] = states.map(i => symbol + i)
        if (states.some(i => nfa.accept.includes(i))) {
          productions[state].push(symbol)
        }
      }
    }

    // if language accepts epsilon, add apsilon to the grammar
    if (nfa.accept.includes(nfa.start)) {
      const secondSymbol = firstSymbol
      firstSymbol += "'"
      productions[firstSymbol] = Array.from(productions[secondSymbol])
      productions[firstSymbol].push('&')
    }

    return new Grammar(firstSymbol, productions)
  }

  /**
   * Gets the regular grammar that represents the union of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A union B.
   */
  static union (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the regular grammar that represents the concatenation of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A concatenated with B.
   */
  static concat (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the regular grammar that represents the closure of rga.
   *
   * @param  {Grammar} rga Regular grammar.
   *
   * @return {Grammar}     Regular grammar that is the closure of A.
   */
  static closure (rga) {
    throw new Error('TODO')
  }

  /**
   * Gets the FA that represents the intersection of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A intersected with B.
   */
  static intersection (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the FA that represents the difference of rga and rgb.
   *
   * @param  {Grammar} rga Regular grammar A.
   * @param  {Grammar} rgb Regular grammar B.
   *
   * @return {Grammar}     Regular grammar that is A - B.
   */
  static diff (rga, rgb) {
    throw new Error('TODO')
  }

  /**
   * Gets the FA that represents the reverse of rga.
   *
   * @param  {Grammar} rga Regular grammar A.
   *
   * @return {Grammar}     Regular grammar that is the reverse of A.
   */
  static reverse (rga) {
    throw new Error('TODO')
  }
}

module.exports = Grammar
