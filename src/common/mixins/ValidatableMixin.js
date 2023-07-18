import { isLiteralObject } from "../../utils/index.js";

class ValidatableMixin {

  static getInvalidResponse(prop, val, message) {
    return {
      mixin: ValidatableMixin.name,
      doSet: false,
      prop: prop,
      val: val,
      message: message
    };
  }

  /**
   *
   * @param propConfig Prop definition
   * @param val Value being tested against prop definition
   * @returns {object} Result object
   */
  static #doValidation(propConfig, val) {
    // it's an object: may have Type[Number, Array, String]. If not Type defined check for fields: options = Array, min/max = Number
    let type, options;
    switch (typeof propConfig) {
      case "object":
        if (propConfig.constructor === Object) {
          if (propConfig["type"]) {
            type = propConfig["type"];
          } else if (propConfig["options"]) {
            type = Array;
            options = propConfig["options"];
          } else if (propConfig["min"] || propConfig["max"]) {
            type = Number;
          } else {
            return { valid: false, message: "Unknown prop config object build up" };
          }
        } else if (propConfig.constructor === Array) { // todo: maybe do not support this for now
          type = Array;
          options = propConfig;
        } else {
          // todo: support null case
          return { valid: false, message: "Unknown prop config object type" };
        }
        break;
      case "string":
        type = String;
        break;
      case "number":
        type = Number;
        break;
      default:
        return { valid: false, message: "Unknown propConfig type" };
    }

    switch (type) {
      case Number:
        if (typeof val !== "number") {
          return { valid: false, message: "Must be Number" };
        }
        break;
      case Array: // todo: make sure val belongs to options defined
        if (options && Array.isArray(options)) {
          if (!options.includes(val)) {
            return { valid: false, message: "Value is not within Options defined" };
          }
        } else {
          return { valid: false, message: "Prop Config Options must be an array" };
        }
        break;
      case String:
        if (typeof val !== "string") {
          return { valid: false, message: "Must be String" };
        }
        break;
      default:
        return { valid: false, message: "Unsupported type in prop config" };
    }
    return { valid: true };
  }

  /**
   *
   * @param prop
   * @param val
   * @returns {object}
   */
  validate(prop, val) {
    //todo: support multi prop validation
    const propConfigs = this.getConfig("props");
    if (isLiteralObject(propConfigs) && propConfigs[prop]) {
      return ValidatableMixin.#doValidation(propConfigs[prop], val);
    }
    return { valid: true };
  }

  __hookBeforeSet(prop, val) {
    const result = this.validate(prop, val);
    return {
      mixin: ValidatableMixin.name,
      doSet: result.valid,
      prop: prop,
      val: val,
      message: result.message ?? null
    };
  }

  __hookBeforeConstruct(data, options, config) {
    const propConfigs = this.getConfig("props");
    let out = {};
    if (propConfigs && typeof propConfigs === "object") {
      for (let prop in propConfigs) { // check each prop config for specific attributes todo: maybe somehow do it in __hookBeforeSet though ability to reject entire construction/setAll must exist
        let propCfg = propConfigs[prop];
        if (isLiteralObject(propCfg)) { // todo: move to util object
          // 'required'
          if (propCfg.required && (data[prop] === undefined || data[prop] === null || data[prop] === "")) {
            out[prop] = {
              mixin: ValidatableMixin.name,
              doSet: false,
              prop: prop,
              val: data[prop],
              message: `Prop "${prop}" is required`
            };
          }
        }
      }
    }
    if (Object.keys(out).length > 0) {
      return {
        mixin: ValidatableMixin.name,
        doSet: false,
        props: out
      }
    } else {
      return {
        mixin: ValidatableMixin.name,
        doSet: true
      }
    }
  }
}

export default ValidatableMixin;