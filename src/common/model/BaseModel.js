import Base from "../Base";
import { isClass, deepEqual } from "../../utils";
import { underscoredIf } from "sequelize/lib/utils";

class BaseModel extends Base {
  static config = {
    //todo: make config private ? but how to extend in children ? //todo: make it private with es6 '#' private props
    idAttr: "id", //this.getIdAttr(), // id attr is a Primary Key. It is immutable and can't be modified once set  //todo: maybe use null in BaseModel
    props: null, //this.getProps(),
    reactivity: true //this.getReactivity(),
  };

  /**
   *
   * @param {string} [singleProp]
   * @returns {{}|*}
   */
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

  /**
   * Parses Prop Configuration to return just default value
   * //todo: maybe move this to mixin
   * @param propObj
   */
  static #getDefaultValueFromPropConfig(val) {
    if (val === null) { // null is object so treat it in advance
      return null;
    }
    switch (typeof val) {
      case "bigint":
      case "boolean":
      case "undefined":
      case "string":
      case "number":
        return val;
      case "object":
        if (Array.isArray(val)) {
          return null; // no default value. todo: should be null or undefined ?
        } else {
          // it's an object: may have Type[Number, Array, String]. If not Type defined check for fields: options = Array, min/max = Number
          let type = val["type"] ?? (val["options"] ? Array : null) ?? (val["min"] || val["max"] ? Number : null);
          //todo: support validator/converter right here
          switch (type) {
            case Number:
            case Array:
            case String:
              return val["value"];
            default:
              throw new Error("Unknown prop config type" + type);
          }
        }
      case "function":
        console.log(val); //todo
      default:
        throw new Error("Unknown prop config value" + val);
    }
  }

  /**
   * Optional custom config for model todo review
   */
  #config;

  constructor(
    data,
    options = { skipHooks: false, skipConvert: false, skipValidate: false },
    config = {}
  ) {
    super(...arguments);
    if (config && Object.keys(config).length) {
      // if custom config provided store it in instance
      this.#defineConfig({ ...this.constructor.getConfig(), ...config });
    }
    const fullConfig = this.getConfig();
    if (fullConfig.props) {
      for (let prop in fullConfig.props) {
        this.#defineProperty(prop, BaseModel.#getDefaultValueFromPropConfig(fullConfig.props[prop]), fullConfig.reactivity);
      }
    }
    //this.#defineModified(false);
    data && this.setAll(data, options); // do not skip hooks unless it's specifically set by user
  }

  /**
   * Returns FULL CONFIG (merge of class config and instance config)
   * @param {string} [prop]
   * @returns {any}
   */
  getConfig(prop) {
    let out = Object.assign({}, this.constructor.getConfig(), this.#config);
    return prop ? out[prop] : out;
  }

  /**
   * Sets any custom config properties
   * @param {object} config
   * @returns {*} Returns own config object
   */
  setConfig(config) {
    return this.#config ? Object.assign(this.#config, config) : this.#defineConfig(config);
  }

  getId() {
    let idAttr = this.getConfig("idAttr");
    return this[idAttr];
  }

  getClientId() {
    //todo: maybe move getClientIdAttr to config
    return this[this.constructor.getClientIdAttr()];
  }

  setId(id) {
    return this.set(this.getConfig("idAttr"), id);
  }

  //todo: do we need this method ?
  get(prop) {
    return this[prop];
  }

  // //todo: do we need this method ?
  // getAll(...exclude) {
  //   let out = {};
  //   for (let prop in this) {
  //     if (this.hasOwnProperty(prop)) {
  //       // to avoid prototype props since for...in walks prototype
  //       if (exclude.indexOf(prop) < 0) {
  //         out[prop] = this[prop];
  //       }
  //     }
  //   }
  //   return out;
  // }

  #defineConfig(config) {
    // Object.defineProperty(this, "#config", {
    //   configurable: false,
    //   enumerable: false,
    //   writable: false,
    //   value: config // initial value is assigned
    // });
    this.#config = config;
    return this.#config;
  }

  // __defineModified(val) {
  //   Object.defineProperty(this, 'isModified', {
  //     configurable: false,
  //     enumerable: false,
  //     writable: true,
  //     value: val,
  //   });
  //   return this['isModified'];
  // }

  #defineId(val) {
    Object.defineProperty(this, this.constructor.getConfig("idAttr"), {
      configurable: true,
      enumerable: true,
      writable: false, // id is immutable by default
      value: val // initial value is assigned
    });
    return this[this.constructor.getConfig("idAttr")];
  }

  #defineProperty(prop, val, reactivity) {
    const def = {
      configurable: true,
      enumerable: true
    };
    const tmpProps = {
      [prop]: val
    };
    def.get = () => {
      return tmpProps[prop];
    };
    def.set = (val) => {
      if (tmpProps[prop] === val) { // if value same just skip it
        return;
      }
      let doSet = true, info = null, mixin;
      if (reactivity && this.__hookBeforeSet) {
        ({ mixin, doSet, prop, val, info } = this.__hookBeforeSet(prop, val));
        // if (typeof tmpProps[prop] !== 'undefined') {
        //   this.isModified = true;
        //   this.__hookUpdate && this.__hookUpdate(prop, val);
        // }
      }
      if (doSet === true) {
        tmpProps[prop] = val;
        reactivity && this.__hookAfterSet && this.__hookAfterSet(prop, val);
      } else if (doSet === false) {
        //console.log(`__hookBeforeSet: false, prop: ${prop}, val: ${val}, info: ${info}`);
        throw {method: '__hookBeforeSet', mixin, doSet: false, prop, val, info};
      } else {
        throw new Error("__hookBeforeSet: doSet must return boolean");
      }
    };
    Object.defineProperty(this, prop, def);
  }

  #isPropExists(prop) {
    return Object.keys(this).includes(prop);
  }

  set(prop, val, options = { skipHooks: false, skipValidate: false, skipConvert: false }) {
    const config = this.getConfig();
    const { skipHooks, skipValidate, skipConvert } = options;

    if (!this.#isPropExists(prop)) {
      // then define prop
      // should be defined with 'undefined' as default value
      this.#defineProperty(prop, undefined, config.reactivity);
    }

    if (config.reactivity) {
      // todo: whether to fire hooks on undefined
      const oldVal = this[prop];
      this[prop] = val; // property's setter will call preparation function
      return val !== oldVal; // if prop didn't exist before or val modified
    } else {
      if (this[prop] === val) {
        // skip set when value is same todo: review for deep equality of objects and arrays
        return false;
      }
      let doSet = true, info = null;
      if (!skipHooks && this.__hookBeforeSet) {
        ({ doSet, prop, val, info } = this.__hookBeforeSet(prop, val));
      }
      if (doSet === true) {
        if (prop === this.constructor.getConfig("idAttr") && this[prop] === undefined) {
          this.#defineId(val); // will define and set id attr as immutable
        } else {
          this[prop] = val;
        }
        !skipHooks && this.__hookAfterSet && this.__hookAfterSet(prop, this[prop]); // todo: maybe call this always with didSet: true/false param
      } else if (doSet === false) {
        console.log(`__hookBeforeSet: false, prop: ${prop}, val: ${val}, info: ${info}`);
      } else {
        throw new Error("__hookBeforeSet: doSet must return boolean");
      }
      return doSet;
    }
  }

  /**
   * Sets all properties from a passed object to self
   * Will only set properties defined in default props (if available)
   * Ignores properties with undefined values anyway
   *
   * @param data Object to copy data from
   * @param {Boolean} skipHooks Skip Hooks
   * @return {Object} Array of modified props or {} if nothing was modified
   */
  setAll(data = {}, options = { skipHooks: false, skipValidate: false, skipConvert: false }) {
    const modifiedProps = {};
    const { skipHooks } = options;
    !skipHooks && this.__hookBeforeSetAll && this.__hookBeforeSetAll(data); //todo: should hooks be executed even if values not really set ?
    for (let prop in data) {
      if (this.set(prop, data[prop], options)) {
        modifiedProps[prop] = this[prop]; // record modified props and return them at the end
      }
    }
    // if (this.isModified) {
    //   this.isModified = false;
    // }
    !skipHooks && this.__hookAfterSetAll && this.__hookAfterSetAll(modifiedProps, data);
    return modifiedProps;
  }

  unset(prop, skipHooks = false) {
    let deleted = false;
    !skipHooks && this.__hookBeforeUnset && this.__hookBeforeUnset(prop);
    if (prop in this) {
      delete this[prop];
      deleted = true;
    }
    !skipHooks && this.__hookAfterUnset && this.__hookAfterUnset(deleted, prop);
    return deleted;
  }

  __hookAfterConstruct(data) {
    return this;
  }

  //todo: how do you apply multiple mixins ?
  __hookBeforeSet(prop, val) {
    return {
      doSet: true,
      prop: prop,
      val: val,
      info: null
    };
  };

  __hookAfterSet(prop, val) {
    return this;
  }

  __hookBeforeSetAll(data) {
    return data;
  }

//todo: maybe fire only if something modified
  __hookAfterSetAll(modifiedProps, data) {
    return this;
  }

  __hookBeforeUnset(prop) {
    return prop;
  }

//todo: maybe fire only if something was unset
  __hookAfterUnset(deleted, prop) {
    return this;
  }
}

export default BaseModel;
