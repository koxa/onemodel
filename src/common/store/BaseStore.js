import BaseModel from "../model/BaseModel.js";
import BaseArray from "../BaseArray.js";
import { isClass } from "../../utils/index.js"; //making sure to import not from index to avoid recursion

class BaseStore extends BaseArray {
  static config = {
    modelClass: null
  }

  /**
   * Wraps items with modelClass class instances
   * todo: support items without modelClass
   * @param modelClass
   * @param items
   * @returns {*[]}
   */
  static wrapItems({ modelClass = this.modelClass, items = [] }) {
    if (!modelClass) {
      //todo: maybe capture modelClass from first item if available
      throw new Error("ModelClass must be defined!");
    }
    if (!(modelClass.prototype instanceof BaseModel)) {
      throw new Error("ModelClass must be instance of BaseModel");
    }
    for (let i = 0; i < items.length; i++) {
      items[i] = new modelClass(items[i]);
    }

    return items;
  }

  static getConfig(singleProp) {
    const getProp = prop => typeof this.config[prop] === "function" && !isClass(this.config[prop]) ? this.config[prop].apply(this) : this.config[prop];
    if (singleProp) {
      return getProp(singleProp);
    }
    const out = {};
    for (let prop in this.config) {
      // if config is function apply it against static this before return
      out[prop] = getProp(prop);
    }
    return out;
  }

  static setConfig(config) {
    this.config = { ...this.config, ...config };
    return this.config;
  }

  //#modelClass = null;
  #config;
  #added = []; // tracks added not saved record ids //todo: maybe move to Adaptor ?
  #deleted = []; // tracks deleted not saved record ids //todo: maybe move to Adaptor ?

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
    let items, config;
    if (args.length > 1) { // multiple items case
      items = args;
    } else if (args.length === 1) { // items array OR config object case
      if (Array.isArray(args[0])) { // items array
        items = args[0];
      } else if (typeof args[0] === "object") { // config object //todo: maybe support 2 args case (data, config), maybe use single object for config {modelClass, data, etc}
        config = args[0].config;
        items = args[0].data;
      }
    }
    if (config && Object.keys(config).length) {
      // if custom config provided store it in instance
      this.#config = { ...this.constructor.getConfig(), ...config }; // primaryKey autoIncrement and other defaults are generated here
    }
    //
    let modelClass = this.getConfig('modelClass');
    if (modelClass) {
      // todo: read modelClass from actual items maybe if not specified explicitly
      if (!modelClass.prototype) {
        throw new Error("Correct ModelClass must be specified");
      }
      if (!(modelClass.prototype instanceof BaseModel)) {
        throw new Error("Specified ModelClass must be inherited from BaseModel");
      }
      if (!modelClass.getPrimaryKeyProp()) {
        throw new Error("Primary Key must be defined on modelClass in order to Store");
      }
    }
    this.__hookBeforeConstruct && this.__hookBeforeConstruct(...arguments);
    items && items.length && this.push(...this.constructor.wrapItems({ modelClass, items }));
    this.__hookAfterConstruct && this.__hookAfterConstruct();
  }

  getModelClass() {
    return this.getConfig('modelClass');
  }

  getConfig(prop) {
    let out = Object.assign({}, this.constructor.getConfig(), this.#config);
    return prop ? out[prop] : out;
    //return prop ? this.#config[prop] : this.#config;
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
    //todo: enable Indexing for primary and unique keys by default
    return this.find((item) => item.getID() === id); //todo: think whether comparison should be strict or not like 1 !== "1" etc.
  }

  // /**
  //  * Finds the index of an item in the Store by id
  //  * @param {number} id The id of the item to search for
  //  * @returns {number} The index of the item or -1 if not found
  //  */
  // findIndex(id) {
  //   if (id === undefined || id === null || this.length === 0) {
  //     return -1;
  //   }
  //   const idAttr = this.getClassModel().getConfig("idAttr");
  //   return super.findIndex((item) => item[idAttr] == id);
  // }

  // /**
  //  * Finds an item in the Store by id or by key/value pair
  //  * @param {number|string} param1 The id of the item or the key of the property to search for
  //  * @param {*} param2 The value of the property to search for (only used if param1 is a string)
  //  * @throws {Error} If the parameters are invalid
  //  * @returns {Model|undefined} The found item or undefined if not found
  //  * example: find(1) or find('firstName', 'Bob')
  //  */
  // find(param1, param2) {
  //   if (typeof param1 === "number" || !isNaN(param1)) {
  //     const index = this.findIndex(param1);
  //     return this[index];
  //   } else if (typeof param1 === "string" && typeof param2 !== "undefined") {
  //     return super.find((model) => deepEqual(model[param1], param2));
  //   }
  //   throw new Error(
  //     `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`
  //   );
  // }

  // removeById(id) {
  //   const index = this.findIndex(id);
  //   if (index > -1) {
  //     this.__hookBeforeChange && this.__hookBeforeChange();
  //     const primaryKey = this.getClassModel().getConfig("idAttr");
  //     const id = this[index][primaryKey];
  //     if (typeof id !== "undefined") {
  //       this.removed.push(id);
  //     }
  //     const out = super.splice(index, 1);
  //     this.__hookAfterChange && this.__hookAfterChange();
  //     return out;
  //   }
  //   throw new Error("Store removeById: not found by id " + id);
  // }

  // removeByKeyValue(key, value) {
  //   const index = super.findIndex((model) => deepEqual(model[key], value));
  //   if (index > -1) {
  //     this.__hookBeforeChange && this.__hookBeforeChange();
  //     const primaryKey = this.getClassModel().getConfig("idAttr");
  //     const id = this[index][primaryKey];
  //     if (typeof id !== "undefined") {
  //       this.removed.push(id);
  //     } else {
  //       const pushedIndex = this.pushed.findIndex((pushed) => pushed[key] == value);
  //       if (pushedIndex > -1) {
  //         this.pushed.splice(pushedIndex, 1);
  //       }
  //     }
  //     const out = super.splice(index, 1);
  //     this.__hookAfterChange && this.__hookAfterChange();
  //     return out;
  //   }
  //   throw new Error(`Store removeByKeyValue: not found by ${key}-${value}`);
  // }

  // /**
  //  * Removes an item from the Store by id or by key/value pair
  //  * @param {number|string} param1 The id of the item to remove or the key of the property to search for
  //  * @param {*} param2 The value of the property to search for (only used if param1 is a string)
  //  * @throws {Error} If the parameters are invalid
  //  * @returns {boolean} True if an item was removed, false if no item was found with the given id or key/value pair
  //  * example: remove(1) or remove('firstName', 'Bob')
  //  */
  // remove(param1, param2) {
  //   if (typeof param1 === "number" || !isNaN(param1)) {
  //     return this.removeById(param1);
  //   } else if (typeof param1 === "string" && typeof param2 !== "undefined") {
  //     return this.removeByKeyValue(param1, param2);
  //   }
  //   throw new Error(
  //     `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`
  //   );
  // }

  // add(items = [], config = {}) {
  //   const models = this.constructor.wrapItems({ modelClass: this.getModelClass(), items });
  //   const res = super.push(...models);
  //   if (!config.raw) {
  //     this.#added.push(...models.map(model => model.getID()));
  //   }
  //   return res;
  // }

  push(...items) {
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const models = this.constructor.wrapItems({ modelClass: this.getModelClass(), items });
    const res = super.push(...models);
    this.#added.push(...models.map(model => model.getID()));
    this.__hookAfterChange && this.__hookAfterChange(models, newLength);
    return res;
  }

  // pop() {
  //   this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
  //   const out = super.pop(...arguments);
  //   this.__hookAfterChange && this.__hookAfterChange(out);
  //   return out;
  // }
  //
  // shift() {
  //   this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
  //   const out = super.shift(...arguments);
  //   this.__hookAfterChange && this.__hookAfterChange(out);
  //   return out;
  // }
  //
  // unshift() {
  //   this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
  //   const out = super.unshift(...arguments);
  //   this.__hookAfterChange && this.__hookAfterChange(out);
  //   return out;
  // }

  splice() {
    //todo: support insert/replace tracking
    this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
    const deleted = super.splice(...arguments);
    this.#deleted.push(deleted.map(model => model.getID()));
    this.__hookAfterChange && this.__hookAfterChange(deleted);
    return deleted;
  }

  /**
   * Join similar to classic MySql join
   * Currently only supports match by key: primary Key
   * usage: joinBy({store, fieldID= storePrimaryKey}, ...)
   * todo: improve jsDOC
   * @param {{fieldID: Store}[]} joins
   * @param {Object} selectFields Should be object like {fieldID: storeID}
   */
  // joinBy(joins, selectFields) {
  //   return this.map(item => {
  //     return
  //   })
  // }

  // getClassModel() {
  //   return this.constructor.getConfig('modelClass');
  // }

  // getClassModelFromItems(items) {
  //   if (items && Array.isArray(items)) {
  //     return items.find((item) => isClass(item));
  //   }
  // }

  empty() {
   this.splice(0, this.length);// todo: review this splice
  }

  //todo: remove this hack
  refreshAdded() {
    this.#added = [];
  }

  refreshDeleted() {
    this.#deleted = [];
  }

  getAdded() {
    return this.#added.map(id => this.get(id));
  }
  // getUpdated() {
  //   return this.#updated;
  // }
  getDeletedIDs() {
    return this.#deleted;
  }
}

export default BaseStore;
