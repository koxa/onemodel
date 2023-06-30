import OneModel from "../../OneModel.js"; //making sure to import not from index to avoid recursion

class Store extends Array {
  static modelClass = null;
  // static wrapItems(items = []) {
  //   let modelClass = this.getClassModel();
  //   if (!modelClass && Array.isArray(items)) {
  //     modelClass = this.getClassModelFromItems(items);
  //     modelClass && this.constructor.setConfig({ modelClass });
  //   }
  //   if (modelClass) {
  //     for (let i = 0; i < items.length; i++) {
  //       if (typeof items[i] === "object" && !(items[i] instanceof modelClass)) {
  //         items[i] = new modelClass(items[i]);
  //       }
  //     }
  //   }
  //   return items;
  // }

  /**
   * Wraps items with OneModel class instances
   * todo: support items without modelClass
   * @param modelClass
   * @param items
   * @returns {*[]}
   */
  static wrapItems({modelClass = this.modelClass, items = []}) {
    if (!modelClass) { //todo: maybe capture modelClass from first item if available
      throw new Error("ModelClass must be defined!");
    }
    if (!modelClass instanceof OneModel) {
      throw new Error("ModelClass must be instance of OneModel");
    }
    for (let i = 0; i < items.length; i++) {
      items[i] = new modelClass(items[i]);
    }

    return items;
  }

  /**
   * Args
   * can be either list of items OR
   * can be single Array of items OR
   * can be Object like {data: [], modelClass}
   * todo: improve docs and add test cases
   * @param {*} args
   */
  constructor(...args) {
    super();
    let items, modelClass;
    if (args.length > 1) { // multiple items case
      items = args;
    } else if (args.length === 1) { // items array OR config object case
      if (Array.isArray(args[0])) { // items array
        items = args[0];
      } else if (typeof args[0] === "object") { // config object
        modelClass = args[0].modelClass;
        items = args[0].data;
      }
    }
    //this.defineProperty({ name: 'pushed', value: [], writable: true });
    //this.defineProperty({ name: 'removed', value: [], writable: true });
    this.__hookBeforeConstruct && this.__hookBeforeConstruct(...arguments);
    items && items.length && this.push(...this.constructor.wrapItems({modelClass, items});
    this.__hookAfterConstruct && this.__hookAfterConstruct();
  }

  // defineProperty({ name, value, writable = false }) {
  //   Object.defineProperty(this, name, {
  //     configurable: false,
  //     enumerable: false,
  //     writable,
  //     value,
  //   });
  // }

  get(id) {
    return this.find((item) => item.getId() === id);
  }

  /**
   * Finds the index of an item in the Store by id
   * @param {number} id The id of the item to search for
   * @returns {number} The index of the item or -1 if not found
   */
  findIndex(id) {
    if (id === undefined || id === null || this.length === 0) {
      return -1;
    }
    const idAttr = this.getClassModel().getConfig("idAttr");
    return super.findIndex((item) => item[idAttr] == id);
  }

  /**
   * Finds an item in the Store by id or by key/value pair
   * @param {number|string} param1 The id of the item or the key of the property to search for
   * @param {*} param2 The value of the property to search for (only used if param1 is a string)
   * @throws {Error} If the parameters are invalid
   * @returns {Model|undefined} The found item or undefined if not found
   * example: find(1) or find('firstName', 'Bob')
   */
  find(param1, param2) {
    if (typeof param1 === "number" || !isNaN(param1)) {
      const index = this.findIndex(param1);
      return this[index];
    } else if (typeof param1 === "string" && typeof param2 !== "undefined") {
      return super.find((model) => deepEqual(model[param1], param2));
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`
    );
  }

  removeById(id) {
    const index = this.findIndex(id);
    if (index > -1) {
      this.__hookBeforeChange && this.__hookBeforeChange();
      const primaryKey = this.getClassModel().getConfig("idAttr");
      const id = this[index][primaryKey];
      if (typeof id !== "undefined") {
        this.removed.push(id);
      }
      const out = super.splice(index, 1);
      this.__hookAfterChange && this.__hookAfterChange();
      return out;
    }
    throw new Error("Store removeById: not found by id " + id);
  }

  removeByKeyValue(key, value) {
    const index = super.findIndex((model) => deepEqual(model[key], value));
    if (index > -1) {
      this.__hookBeforeChange && this.__hookBeforeChange();
      const primaryKey = this.getClassModel().getConfig("idAttr");
      const id = this[index][primaryKey];
      if (typeof id !== "undefined") {
        this.removed.push(id);
      } else {
        const pushedIndex = this.pushed.findIndex((pushed) => pushed[key] == value);
        if (pushedIndex > -1) {
          this.pushed.splice(pushedIndex, 1);
        }
      }
      const out = super.splice(index, 1);
      this.__hookAfterChange && this.__hookAfterChange();
      return out;
    }
    throw new Error(`Store removeByKeyValue: not found by ${key}-${value}`);
  }

  /**
   * Removes an item from the Store by id or by key/value pair
   * @param {number|string} param1 The id of the item to remove or the key of the property to search for
   * @param {*} param2 The value of the property to search for (only used if param1 is a string)
   * @throws {Error} If the parameters are invalid
   * @returns {boolean} True if an item was removed, false if no item was found with the given id or key/value pair
   * example: remove(1) or remove('firstName', 'Bob')
   */
  remove(param1, param2) {
    if (typeof param1 === "number" || !isNaN(param1)) {
      return this.removeById(param1);
    } else if (typeof param1 === "string" && typeof param2 !== "undefined") {
      return this.removeByKeyValue(param1, param2);
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`
    );
  }

  push() {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    //this.pushed.push(...items);
    const out = super.push(...this.constructor.wrapItems(...arguments));
    this.__hookAfterChange && this.__hookAfterChange(out);
    return out;
  }

  pop() {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const out = super.pop(...arguments);
    this.__hookAfterChange && this.__hookAfterChange(out);
    return out;
  }

  shift() {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const out = super.shift(...arguments);
    this.__hookAfterChange && this.__hookAfterChange(out);
    return out;
  }

  unshift() {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const out = super.unshift(...arguments);
    this.__hookAfterChange && this.__hookAfterChange(out);
    return out;
  }

  splice() {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const out = super.splice(...arguments);
    this.__hookAfterChange && this.__hookAfterChange(out);
    return out;
  }

  // getClassModel() {
  //   return this.constructor.getConfig('modelClass');
  // }

  // getClassModelFromItems(items) {
  //   if (items && Array.isArray(items)) {
  //     return items.find((item) => isClass(item));
  //   }
  // }
}

export default Store;
