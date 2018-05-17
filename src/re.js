
const VALID_INPUT = /^[\s/|/?/*/.A-Z0-9/(/)]*$/ig
const ALPHABET = /[A-Z0-9]/i
const WHITE_SPACE = /\s/gi

class RE {
  constructor (reString) {
    this.simone = null
    this.input = reString
    this.parser = new Parser(reString)

    // Get alphabet
    const alpha = reString
      .split('')
      .filter(i => i.match(ALPHABET))
    this.alphabet = new Set(alpha)
  }

  toDFA () {
    throw new new Error()
  }

  getCompositions (leafs) {
    throw new new Error()
  }

  getTransitions (composition) {
    throw new new Error()
  }

  static intersection (era, erb) {
    throw new Error('TODO')
  }

  static diff (era, erb) {
    throw new Error('TODO')
  }

  static reverse (era, erb) {
    throw new Error('TODO')
  }
}

class Simone {
  constructor (parseTree) {
    this.tree = parseTree

    this.nodes = null
    this.leafs = {}

    this.visited = new Set()

    this.thread()
    this.enumerate()
  }

  thread () {
    // Thread it
    this.nodes = Simone.inOrder(this.tree)
    const len = this.nodes.length
    for (let i = 0; i < len - 1; i++) {
      const node = this.nodes[i]
      if (node.right === null) {
        const next = this.nodes[i + 1]
        node.right = next
      }
    }
  }

  enumerate () {
    const leafs = this.nodes.filter(i => Simone.isLeaf(i))
    for (let i = 0; i < leafs.length; i++) {
      const leaf = leafs[i]
      leaf.value = `${i + 1}_${leaf.value}`
      this.leafs[leaf.value] = leaf
    }
  }

  down (node) {
    const right = node.right
    const left = node.left
    const value = node.value

    switch (value) {
      case '|':
        this.down(left)
        this.down(right)
        break
      case '*':
      case '?':
        this.down(left)
        this.up(right)
        break
      case '.':
        this.down(left)
        break
      default:
        this.visited.add(value)
        break
    }

    return this.visited
  }

  up (node) {
    if (node === null) {
      this.visited.add('lambda')
      return this.visited
    }

    const right = node.right
    const left = node.left
    const value = node.value

    switch (value) {
      case '|':
        const rightMost = this.rightMost(node)
        this.up(rightMost.right)
        break
      case '*':
        this.down(left)
        this.up(right)
        break
      case '?':
        this.up(right)
        break
      case '.':
        this.down(right)
        break
      default:
        this.up(right)
        break
    }

    return this.visited
  }

  rightMost (node) {
    let right = node
    while (!Simone.isLeaf(right)) {
      if (right.right === null) {
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

module.exports = RE
module.exports.Parser = Parser
module.exports.Simone = Simone
