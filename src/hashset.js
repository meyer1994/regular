
/**
 * HashSet class.
 *
 * It is simply an wrapper creted around an common object to act like a set. The
 * hash function is the toString method. It was created with the same methods
 * as the Set class of the std library.
 *
 * For this class to work properly, all the objects should have a decent
 * toString method to function as a hash function.
 */
export default class HashSet {
  /**
   * Creates the set.
   *
   * @param {iterable} [iterable=[]] An iterable to be added initially.
   */
  constructor (iterable = []) {
    this._values = {}
    iterable.forEach(i => this.add(i))
  }

  /**
   * Add item to set.
   */
  add (item) {
    this._values[item] = item
    return this
  }

  /**
   * Checks if item is in set.
   *
   * @return {Boolean}      True if item is in set, false otherwise.
   */
  has (item) {
    return item in this._values
  }

  /**
   * Gets the size of the set.
   *
   * @return {number} The number of items in the set.
   */
  get size () {
    return Object.keys(this._values).length
  }

  /**
   * Gets the legnth.
   *
   * @return {number} As the set class, always return 0.
   */
  get length () {
    return 0
  }

  /**
   * Removes all items from the set.
   *
   * @return Undefined.
   */
  clear () {
    this._values = {}
  }

  /**
   * Deletes the item from the set.
   *
   * @param  {*} item Item to be deleted from set.
   *
   * @return {boolean}      True if something was removed, false otherwise.
   */
  delete (item) {
    const has = this.has(item)
    delete this._values[item]
    return has
  }

  /**
   * Gets values of the set.
   *
   * @return {Array} Array of the values in the set.
   */
  values () {
    return Object.values(this._values)
  }

  /**
   * Get pairs of [key, value] of the items in the set.
   *
   * @return {Array<[key, val]>} Array of pairs.
   */
  entries () {
    return Object.entries(this._values)
  }

  /**
   * Executes the passed function for every item in the set.
   *
   * @param  {Function} fn Function to pass each item to.
   *
   * @return Undefined.
   */
  forEach (fn) {
    this.values().forEach(i => fn(i))
  }
}
