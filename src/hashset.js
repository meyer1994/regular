
/**
 * HashSet class.
 *
 * It is simply an wrapper creted around an common object to act like a set.
 * The hash function is the toString method. It was created with the same
 * methods as the Set class of the std library.
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
   *
   * @return {HashSet} Returns the set itself.
   */
  add (item) {
    this._values[item] = item
    return this
  }

  /**
   * Checks if item is in set.
   *
   * @return {Boolean} True if item is in set, false otherwise.
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
   * @return {number} As in the Set class, always return 0.
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
   * @return {Boolean} True if something was removed, false otherwise.
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
    this.values().forEach(fn)
  }

  /**
   * Union operation.
   *
   * @param  {HashSet} set Set to perform union with.
   *
   * @return {HashSet} HashSet object with items from both this and set.
   */
  union (set) {
    const union = new HashSet(this.values())
    set.forEach(i => union.add(i))
    return union
  }

  /**
   * Intersects sets.
   *
   * @param  {HashSet} set Set to be intersected with.
   *
   * @return {HashSet} HashSet with the elements that are in both, this and
   *                   set.
   */
  intersect (set) {
    const intersection = new HashSet()
    for (const item of this.values()) {
      if (set.has(item)) {
        intersection.add(item)
      }
    }
    return intersection
  }

  /**
   * Removes all elements of this that are in set.
   *
   * @param  {HashSet} set Set to make the diff with.
   *
   * @return {HashSet} HashSet with the difference of the sets.
   */
  diff (set) {
    const diff = new HashSet(this.values())
    for (const item of set.values()) {
      diff.delete(item)
    }
    return diff
  }

  /**
   * Map function.
   *
   * @param  {Function} fn Should return a value for each item.
   *
   * @return {Array} Array of the mapped values.
   */
  map (fn) {
    return this.values().map(fn)
  }

  /**
   * Filter function.
   *
   * @param  {Function} fn Returns true or false for each item of the set.
   *
   * @return {Array} Array of filtered items.
   */
  filter (fn) {
    return this.values().filter(fn)
  }

  /**
   * Checks if both sets are equal.
   *
   * The check is performed this way:
   * 1. Check if sizes are not the same. Return false if they are not.
   * 2. Checks if the difference bewtween them is 0. If it is, return true.
   * 3. If it is not, return false.
   *
   * @param  {HashSet} set Set to test.
   *
   * @return {Boolean} True if both sets are equal. False otherwise.
   */
  equals (set) {
    if (this.size !== set.size) {
      return false
    }
    const diff = this.diff(set)
    return diff.size === 0
  }

  /**
   * Checks if this set is subset of set.
   *
   * @param  {HashSet} set Set to check if this is subset of.
   *
   * @return {Boolean} True if it is subset of set. False otherwise.
   */
  subsetOf (set) {
    const diff = this.diff(set)
    return diff.size === 0
  }

  /**
   * Checks if this set is supertset of other.
   *
   * Same as using !set.subsetof(otherSet).
   *
   * @param  {HashSet} set Set to check if this is a superset of.
   *
   * @return {Boolean} True if it is a superset of set. False otherwise.
   */
  supersetOf (set) {
    return !this.subsetOf(set)
  }

  /**
   * Calls JSON.stringify on _values
   *
   * @return {String} JSON string of _values.
   */
  toString () {
    return JSON.stringify(this._values)
  }

  some (fn) {
    return this.values().some(fn)
  }
}
