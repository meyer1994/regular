const fs = require('fs')

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
   * Converts this regular grammar into a deterministic finite automaton.
   *
   * @return {DFA} This regular grammar, converted to an automaton.
   */
  toDFA () {
    throw new Error('TODO')
  }

  /**
   * Generates a grammar from a non-deterministic finite automaton.
   *
   * @param {NFA} nfa
   *
   * @return New Grammar object that represents
   */
  static fromNFA (nfa) {
    const firstSymbol = nfa.start
    const productions = {}
    const aux = new Set()
    for (let state in nfa.table) {
      aux.clear()
      for (let terminalSymbol in nfa.table[state]) {
        for (let nonTerminalSymbol of nfa.table[state][terminalSymbol]) {
          aux.add(terminalSymbol + nonTerminalSymbol)
          if (nfa.accept.has(nonTerminalSymbol)) {
            aux.add(terminalSymbol)
          }
        }
      }
      productions[state] = Array.from(aux)
    }
    // if language accepts epsilon, add apsilon to the grammar
    if (nfa.accept.has(nfa.start)) {
      const newFirstSymbol = firstSymbol + "'"
      productions[newFirstSymbol] = Array.from(productions[firstSymbol])
      productions[newFirstSymbol].push('&')
      return new Grammar(newFirstSymbol, productions)
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

  /**
   * Open JSON File that represents a rga object.
   *
   * @param {string} path path to .json file.
   *
   * @return {Grammar}    Regular grammar that represents JSON file.
   */
  static open (path) {
    const rawData = fs.readFileSync(path)
    const grammar = JSON.parse(rawData)
    return new Grammar(grammar.first, grammar.productions)
  }

  /**
   * Save object into JSON file.
   *
   * @param {string} path path to .json file.
   *
   * @return {void} returns nothing.
   */
  save (path) {
    const data = JSON.stringify(this, null, 2)
    fs.writeFileSync(path, data)
  }
}

module.exports = Grammar
