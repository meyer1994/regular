const NFA = require('../src/nfa')

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
   * Return the possible senteces that this grammar can generate.
   *
   * @param  {Number} num Size limit of the sentences to be generated.
   *
   * @return {Array}      Array with all the generated sentences.
   */
  enumerate (num) {
    const sentences = new Set([ this.first ])

    while (true) {
      const newSet = new Set(Array.from(sentences))

      for (const sentence of sentences) {
        const match = sentence.match(/^([a-z]*)([A-Z]'?)$/)
        if (match === null) {
          continue
        }

        const last = match[2]
        const substring = match[1]
        const productions = this.productions[last]
        for (const production of productions) {
          if (production === '&') {
            newSet.add('&')
            continue
          }

          const newSentence = substring + production
          if (newSentence.length <= num) {
            newSet.add(newSentence)
          }
        }
      }

      // No change
      if (newSet.size === sentences.size) {
        break
      }

      // Union of sets
      newSet.forEach(i => sentences.add(i))
    }

    return Array
      .from(sentences)
      .filter(i => i.match(/^([a-z\d]*|&)$/g))
      .sort()
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
        for (const reachState of states) {
          productions[state].push(symbol + reachState)
        }
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
    const nfa1 = NFA.fromGrammar(rga)
    const nfa2 = NFA.fromGrammar(rgb)
    const union = NFA.union(nfa1, nfa2)
    union.minimize()
    union.beautifyABC()
    return Grammar.fromNFA(union)
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
    const nfa1 = NFA.fromGrammar(rga)
    const nfa2 = NFA.fromGrammar(rgb)
    const concat = NFA.concat(nfa1, nfa2)
    concat.minimize()
    concat.beautifyABC()
    return Grammar.fromNFA(concat)
  }

  /**
   * Gets the regular grammar that represents the closure of rga.
   *
   * @param  {Grammar} rga Regular grammar.
   *
   * @return {Grammar}     Regular grammar that is the closure of A.
   */
  static closure (rga) {
    const nfa1 = NFA.fromGrammar(rga)
    const closure = NFA.star(nfa1)
    closure.minimize()
    closure.beautifyABC()
    return Grammar.fromNFA(closure)
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
    const nfa1 = NFA.fromGrammar(rga)
    const nfa2 = NFA.fromGrammar(rgb)
    const intersection = NFA.intersection(nfa1, nfa2)
    intersection.minimize()
    intersection.beautifyABC()
    return Grammar.fromNFA(intersection)
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
    const nfa1 = NFA.fromGrammar(rga)
    const nfa2 = NFA.fromGrammar(rgb)
    const diff = NFA.diff(nfa1, nfa2)
    diff.minimize()
    diff.beautifyABC()
    return Grammar.fromNFA(diff)
  }

  /**
   * Gets the FA that represents the reverse of rga.
   *
   * @param  {Grammar} rga Regular grammar A.
   *
   * @return {Grammar}     Regular grammar that is the reverse of A.
   */
  static reverse (rga) {
    const nfa1 = NFA.fromGrammar(rga)
    const reverse = NFA.reverse(nfa1)
    reverse.minimize()
    reverse.beautifyABC()
    return Grammar.fromNFA(reverse)
  }
}

module.exports = Grammar
