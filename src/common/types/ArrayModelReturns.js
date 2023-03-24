import { deepEqual } from '../../utils';

/**
 * Array Model Returns
 * Extension of Array that includes additional functionality to support CRUD operations for a specific Model
 * @param _params Object that includes optional parameters to configure the behavior of the ArrayModelReturns.
 *  The object should have the following properties:
 * - model: A reference to a OneModel object that will be used for CRUD operations
 * - mixed1, mixed2, mixed3: A parameters for the OneModel's read method (optional)
 * @param items Array of initial items to populate the ArrayModelReturns
 */
class ArrayModelReturns extends Array {
  /** References to the "emit, on, once, removeListener, off" functions of the EventEmitter class in the model, if supported */
  emit(eventName, ...args) {
    if (!this.model.emit) {
      throw new Error('The "emit" function is not supported in the model');
    }
    this.model.emit(eventName, ...args);
  }

  on(eventName, listener) {
    if (!this.model.on) {
      throw new Error('The "on" function is not supported in the model');
    }
    this.model.on(eventName, listener);
  }

  once(eventName, listener) {
    if (!this.model.once) {
      throw new Error('The "once" function is not supported in the model');
    }
    this.model.once(eventName, listener);
  }

  removeListener(eventName, listener) {
    if (!this.model.removeListener) {
      throw new Error('The "removeListener" function is not supported in the model');
    }
    this.model.removeListener(eventName, listener);
  }

  off(eventName, listener) {
    if (!this.model.off) {
      throw new Error('The "off" function is not supported in the model');
    }
    this.model.off(eventName, listener);
  }

  defineProperty({ name, value, writable = false }) {
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: false,
      writable,
      value,
    });
  }

  constructor(_params, ...items) {
    super(...items);
    const { model, ...params } = _params;
    this.defineProperty({ name: 'params', value: params || {} });
    this.defineProperty({ name: 'model', value: model });
    this.defineProperty({ name: 'pushed', value: [], writable: true });
    this.defineProperty({ name: 'removed', value: [], writable: true });
    for (let i = 0; i < this.length; i++) {
      if (typeof this[i] === 'object' && !(this[i] instanceof model)) {
        this[i] = new model(this[i]);
      }
    }
  }

  /**
   * Returns a new ArrayModelReturns that contains only the items that have been modified
   * @returns {ArrayModelReturns}
   */
  getModified() {
    const modified = super.filter((model) => model && model.isModified);
    return new ArrayModelReturns({ model: this.model, ...this.params }, ...modified);
  }

  /**
   * Finds an item in the ArrayModelReturns by id or by key/value pair
   * @param {number|string} param1 The id of the item or the key of the property to search for
   * @param {*} param2 The value of the property to search for (only used if param1 is a string)
   * @throws {Error} If the parameters are invalid
   * @returns {Model|undefined} The found item or undefined if not found
   * example: find(1) or find('firstName', 'Bob')
   */
  find(param1, param2) {
    if (typeof param1 === 'number' || !isNaN(param1)) {
      const index = this.findIndex(param1);
      return this[index];
    } else if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
      return super.find((model) => deepEqual(model[param1], param2));
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`,
    );
  }

  /**
   * Finds the index of an item in the ArrayModelReturns by id
   * @param {number} id The id of the item to search for
   * @returns {number} The index of the item or -1 if not found
   */
  findIndex(id) {
    if (id === undefined || id === null || this.length === 0) {
      return -1;
    }
    const idAttr = this.model.getConfig('idAttr');
    return super.findIndex((item) => item[idAttr] == id);
  }

  /**
   * Adds one or more items to the ArrayModelReturns and creates new Model instances for each item
   * @param {...*} element The item(s) to add to the ArrayModelReturns
   */
  push() {
    for (const element of arguments) {
      const model = !(element instanceof this.model) ? new this.model(element) : element;
      this.pushed.push(model);
      super.push(model);
    }
  }

  /**
   * Removes an item from the ArrayModelReturns by id
   * @param {number} id The id of the item to remove
   * @returns {boolean} True if an item was removed, false if no item was found with the given id
   */
  removeById(id) {
    const index = this.findIndex(id);
    if (index > -1) {
      const primaryKey = this.model.getConfig('idAttr');
      const id = this[index][primaryKey];
      if (typeof id !== 'undefined') {
        this.removed.push(id);
      }
      super.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes an item from the ArrayModelReturns by key/value pair
   * @param {string} key name of the property to search for
   * @param {*} value of the property to search for
   * @returns {boolean} True if an item was removed, false if no item was found with the given key/value pair
   */
  removeByKeyValue(key, value) {
    const index = super.findIndex((model) => deepEqual(model[key], value));
    if (index > -1) {
      const primaryKey = this.model.getConfig('idAttr');
      const id = this[index][primaryKey];
      if (typeof id !== 'undefined') {
        this.removed.push(id);
      } else {
        const pushedIndex = this.pushed.findIndex((pushed) => pushed[key] == value);
        if (pushedIndex > -1) {
          this.pushed.splice(pushedIndex, 1);
        }
      }
      super.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes an item from the ArrayModelReturns by id or by key/value pair
   * @param {number|string} param1 The id of the item to remove or the key of the property to search for
   * @param {*} param2 The value of the property to search for (only used if param1 is a string)
   * @throws {Error} If the parameters are invalid
   * @returns {boolean} True if an item was removed, false if no item was found with the given id or key/value pair
   * example: remove(1) or remove('firstName', 'Bob')
   */
  remove(param1, param2) {
    if (typeof param1 === 'number' || !isNaN(param1)) {
      return this.removeById(param1);
    } else if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
      return this.removeByKeyValue(param1, param2);
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`,
    );
  }

  /**
   * Restores the ArrayModelReturns to its original state by reloading the data from the database
   * @returns {Promise<ArrayModelReturns>} The restored ArrayModelReturns
   * @throws {Error} If there is an error while restoring the data
   */
  async restore() {
    const updates = this.getModified();
    if (updates && updates.length) {
      try {
        const result = await this.model.read.apply(
          this.model,
          Object.keys(this.params)
            .map((key) => this.params[key])
            .filter(Boolean),
        );
        this.pushed = [];
        this.removed = [];
        this.splice(0, this.length, ...result);
        return this;
      } catch (err) {
        throw new Error('ArrayModel reset: ' + err);
      }
    }
    return this;
  }

  /**
   * Saves all changes made to the ArrayModelReturns to the database
   * @returns {Promise<Object>} An object containing the results of the database operations (insertedCount, insertedIds, update, deletedCount)
   */
  async saveAll() {
    const result = {};
    const updates = this.getModified();
    if (updates && updates.length) {
      const updateMany = await this.model.updateMany(updates);
      updates.forEach((model) => {
        model.isModified = false;
      });
      result.update = updateMany;
    }
    if (this.removed && this.removed.length) {
      const deleteMany = await this.model.deleteMany(this.removed);
      result.deletedCount = deleteMany.deletedCount;
      this.removed = [];
    }
    if (this.pushed && this.pushed.length) {
      const insertMany = await this.model.insertMany(this.pushed);
      result.insertedCount = insertMany.insertedCount;
      result.insertedIds = insertMany.insertedIds;
      this.pushed = [];
    }
    return result;
  }
}

export default ArrayModelReturns;
