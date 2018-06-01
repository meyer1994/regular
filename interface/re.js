
const VALID_INPUT = /^[\s/|/?/*/.A-Z0-9/(/)]*$/ig
const ALPHABET = /[A-Z0-9]/i
const WHITE_SPACE = /\s/gi
const OPERATORS = /[*|?.]/gi

class RE {
  constructor (reString) {
    this.simone = null
    this.input = reString
    this.parser = new Parser(reString)

    // Get alphabet
    const alpha = reString
      .split('')
      .filter(i => i.match(ALPHABET))
    this.alphabet = Array.from(new Set(alpha))
  }

  toDFA () {
    const tree = this.parser.regex()
    this.simone = new Simone(tree)

    // Get all leafs compositions
    const leafsMap = this.getCompositions()

    const compMap = new Map()
    const start = 'q0'
    const table = {}
    const accept = new Set()

    let stateCounter = 0

    const stack = [ this.simone.down(tree) ]
    while (stack.length > 0) {
      const comp = stack.pop()
      const compName = Array
        .from(comp)
        .map(i => i.index + i.value)
        .sort()
        .join()

      let state = ''
      // Composition already found
      if (compMap.has(compName)) {
        state = compMap.get(compName)

      // New composition
      } else {
        state = 'q' + stateCounter++
        compMap.set(compName, state)
        table[state] = {}
      }

      if (comp.has(this.simone.LAMBDA)) {
        accept.add(state)
      }

      // For each symbol in this composition
      const symbols = this.getSymbolsFromNodes(comp)
      for (const symbol of symbols) {
        const newComp = new Set()

        // Union of the compositions found when going up the tree
        const filteredNodes = this.filterNodesBySymbol(comp, symbol)
        for (const node of filteredNodes) {
          const compSymbol = leafsMap.get(node)
          compSymbol.forEach(i => newComp.add(i))
        }
        const newCompName = Array
          .from(newComp)
          .map(i => i.index + i.value)
          .sort()
          .join()

        // Composition already found, just add transition
        if (compMap.has(newCompName)) {
          const oldState = compMap.get(newCompName)
          table[state][symbol] = [ oldState ]
          continue
        }

        // Add new state to table
        const newState = 'q' + stateCounter++
        table[newState] = {}

        // Add transition from current state to it
        table[state][symbol] = [ newState ]

        // Add to map and stack
        compMap.set(newCompName, newState)
        stack.unshift(newComp)
      }
    }

    return new NFA(start, Array.from(accept), table)
  }

  getCompositions () {
    const leafsMap = new Map()
    const leafs = this.simone.nodes.filter(i => Simone.isLeaf(i))
    for (const leaf of leafs) {
      const leafComp = this.simone.up(leaf)
      leafsMap.set(leaf, leafComp)
    }
    return leafsMap
  }

  filterNodesBySymbol (nodes, symbol) {
    const filtered = Array
      .from(nodes)
      .filter(i => i.value === symbol)
    return new Set(filtered)
  }

  getSymbolsFromNodes (nodes) {
    const symbols = Array
      .from(nodes)
      .filter(i => i.value.match(ALPHABET))
      .map(i => i.value)
    return new Set(symbols)
  }

  static intersection (era, erb) {
    const nfa1 = era.toDFA()
    const nfa2 = erb.toDFA()
    const intersection = NFA.intersection(nfa1, nfa2)
    intersection.minimize()
    intersection.beautifyABC()
    return intersection
  }

  static diff (era, erb) {
    const nfa1 = era.toDFA()
    const nfa2 = erb.toDFA()
    const diff = NFA.diff(nfa1, nfa2)
    diff.minimize()
    diff.beautifyABC()
    return diff
  }

  static reverse (era) {
    const nfa1 = era.toDFA()
    const reverse = NFA.reverse(nfa1)
    reverse.minimize()
    reverse.beautifyABC()
    return reverse
  }
}

class Simone {
  constructor (parseTree) {
    this.tree = parseTree

    this.nodes = []
    this.leafs = []

    this.visited = new Set()

    this.LAMBDA = {
      value: '$',
      left: null,
      right: null
    }

    this.thread()
    this.enumerate()
  }

  thread () {
    // Thread it
    this.nodes = Simone.inOrder(this.tree)
    for (const [i, node] of this.nodes.entries()) {
      if (node.right === null) {
        node.right = this.nodes[i + 1] || null
      }
    }

    // For debugging
    this.nodes.forEach((node, i) => { node.index = i })

    // Add lambda node
    const last = this.nodes[this.nodes.length - 1]
    last.right = this.LAMBDA
    this.nodes.push(this.LAMBDA)
  }

  enumerate () {
    this.leafs = this.nodes.filter(i => Simone.isLeaf(i))
    for (const [i, leaf] of this.leafs.entries()) {
      leaf.number = i
    }
  }

  down (node) {
    const result = this._down(node)
    const copy = Array.from(result).filter(i => !i.value.match(OPERATORS))
    this.visited.clear()
    return new Set(copy)
  }

  up (node) {
    const result = this._up(node)
    const copy = Array.from(result).filter(i => !i.value.match(OPERATORS))
    this.visited.clear()
    return new Set(copy)
  }

  _down (node) {
    const right = node.right
    const left = node.left
    const value = node.value

    // Avoid infinite recursions with **
    if (this.visited.has(node)) {
      return this.visited
    }

    this.visited.add(node)

    switch (value) {
      case '|':
        this._down(left)
        this._down(right)
        break
      case '*':
      case '?':
        this._down(left)
        this._up(right)
        break
      case '.':
        this._down(left)
        break
      default:
        // Does nothing
        break
    }

    return this.visited
  }

  _up (node) {
    if (node === this.LAMBDA) {
      this.visited.add(this.LAMBDA)
      return this.visited
    }

    const right = node.right
    const left = node.left
    const value = node.value

    switch (value) {
      case '|':
        const rightMost = this.rightMost(node)
        this._up(rightMost.right)
        break
      case '*':
        this._down(left)
        this._up(right)
        break
      case '?':
        this._up(right)
        break
      case '.':
        this._down(right)
        break
      default:
        this._up(right)
        break
    }

    return this.visited
  }

  rightMost (node) {
    let right = node
    while (!Simone.isLeaf(right)) {
      if (right.right.value === this.LAMBDA.value) {
        return right
      }
      right = right.right
    }
    return right
  }

  static isLeaf (node) {
    return node.value.match(ALPHABET)
  }

  static inOrder (node) {
    const stack = []
    const nodes = []

    let current = node

    do {
      // Go left
      if (current !== null) {
        stack.push(current)
        current = current.left
        continue
      }

      // Insert yourself
      const parent = stack.pop()
      nodes.push(parent)
      if (parent.right === null) {
        continue
      }

      // Go right
      current = parent.right
    } while (stack.length > 0 || current !== null)

    return nodes
  }
}

class Parser {
  constructor (input) {
    if (input.match(VALID_INPUT) === null) {
      throw new Error(`Invalid regex passed to constructor => ${input}`)
    }

    this.input = input
      .replace('.', '') // remove dots
      .replace(WHITE_SPACE, '') // remove spaces
    this.index = 0
  }

  /**
   * Gets the next symbol from the input.
   *
   * @return {String} The next symbol of the input, empty string if there isn't
   *                  any.
   */
  peek () {
    if (this.index > this.input.length) {
      return ''
    }
    return this.input[this.index]
  }

  /**
   * Consumes the current char of the input.
   *
   * Throws an error if the passed char is different than the current one.
   *
   * @param  {String} char Char to be consumend.
   */
  eat (char) {
    let peek = this.peek()
    if (peek === char) {
      this.index++
      return
    }
    throw new Error(`Invalid regex, it was expected '${char}', but got '${peek}' instead`)
  }

  /**
   * Gets the next char and consumes it.
   *
   * Very similar to the way a pop() works in an stack.
   *
   * @return {String} Next symbol to be threated.
   */
  next () {
    const symbol = this.peek()
    this.eat(symbol)
    return symbol
  }

  /**
   * Checks if there is more symbols to see.
   *
   * @return {Boolean} True if there are symbols, false otherwise.
   */
  more () {
    return this.input.length > this.index
  }

  /**
   * Parses the regular expression.
   *
   * @return {Node} Root node of the operations tree of the RegEx.
   */
  regex () {
    const term = this.term()

    if (this.more() && this.peek() === '|') {
      this.eat('|')
      const regex = this.regex()
      return { value: '|', left: term, right: regex }
    }

    return term
  }

  /**
   * Returns an subexpression.
   *
   * A subexpression is composed only by the following operations:
   * - Concatenation;
   * - Closure;
   * - Final symbols (the alphabet in this implementation).
   *
   * @return {Node} Root node of some branch representing the subexpression.
   */
  term () {
    let factor = this.factor()
    while (this.more() && this.peek() !== ')' && this.peek() !== '|') {
      let next = this.term()
      factor = { value: '.', left: factor, right: next }
    }
    return factor
  }

  /**
   * Gets all the possible number of closures concatenated.
   *
   * Note:
   * Closure operators are cumulative. It does not make much sense. But it is
   * valid RegEx to use (ab)** (which is the same as (ab)*).
   *
   * @return {Node} Root node of the branch of all the closure operations.
   */
  factor () {
    let base = this.base()
    let peek = this.peek()
    while (this.more() && (peek === '*' || peek === '?')) {
      this.eat(peek)
      base = { value: peek, left: base, right: null }
      peek = this.peek()
    }
    return base
  }

  /**
   * Gets the leaf of some branch.
   *
   * Gets the leaf of the branch in this parse tree. In this implementation,
   * all the leafs in a tree are only alphabet symbols and digits.
   *
   * @return {Node} Leaf node. A node without children and a letter, or digit,
   *                as its value.
   */
  base () {
    let char = this.peek()
    if (char.match(ALPHABET)) {
      const leaf = this.next()
      return { value: leaf, left: null, right: null }
    }

    if (char === '(') {
      this.eat(char)
      const regex = this.regex()
      this.eat(')')
      return regex
    }

    throw new Error(`Invalid character at leaf node. Expected alpha-numeric symbol, got '${char} instead' `)
  }
}
