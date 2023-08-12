import { isLiteralObject } from "../../../utils/index.js";

class ValidatableModelMixin {

  static getInvalidResponse(prop, val, message) {
    return {
      mixin: ValidatableModelMixin.name,
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

    // only support literal object configs for now
    if (!isLiteralObject(propConfig)) {
      return { valid: true };
    }

    if (propConfig["type"]) {
      type = propConfig["type"];
    }
    // todo: reconsider this later
    // else if (propConfig["options"]) {
    //   type = Array;
    //   options = propConfig["options"];
    // } else if (propConfig["min"] || propConfig["max"]) {
    //   type = Number;
    // } else {
    //   //todo: maybe consider default type as String
    //   return { valid: false, message: "Unknown prop config object build up" };
    // }

    /** 'REQUIRED' VALIDATION **/
    if (propConfig.required && (val === undefined || val === null || val === "")) {
      return { valid: false, message: `Prop is required` };
    }
    if (propConfig.primaryKey && propConfig.autoIncrement === false) { // if autoIncrement disabled for primaryKey then it must be user-defined
      return { valid: false, message: `Prop is required` };
    }

    /** BASIC TYPE & OPTIONS VALIDATION **/
    if (val !== undefined) { // only if val was defined we validate type
      switch (type) {
        case Number:
          if (typeof val !== "number") {
            return { valid: false, message: "Must be Number" };
          }
          break;
        case Array: // Array of Strings likely todo: maybe implement this under String/Number
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
          return { valid: false, message: "Unsupported OR Undefined type in prop config" };
      }
    }
    /** END OF TYPE VALIDATION CHECK **/

    /** CUSTOM VALIDATION WITH 'VALIDATOR' PROP **/
    if (propConfig.validator && !propConfig.validator(val)) {
      return { valid: false, message: "Failed custom validation" }; // todo: support custom messages in custom validators
    }

    return { valid: true };
  }

  /**
   * Reads propConfig by 'prop' and validates against 'val'
   * @param prop
   * @param val
   * @returns {object}
   */
  validate(prop, val) {
    const propConfigs = this.getConfig("props");
    if (isLiteralObject(propConfigs) && propConfigs[prop]) {
      return ValidatableModelMixin.#doValidation(propConfigs[prop], val);
    }
    return { valid: true };
  }

  validateAll(data) {
    const propConfigs = this.getConfig("props");
    let out = {};
    if (isLiteralObject(propConfigs)) {
      for (let prop in propConfigs) {
        let propCfg = propConfigs[prop];
        if (isLiteralObject(propCfg)) {
          let res = ValidatableModelMixin.#doValidation(propCfg, data[prop]);
          if (res.valid === false) { // only collect invalid results
            out[prop] = res;
          }
        }
      }
    }
    if (Object.keys(out).length > 0) { // if invalid results collected
      return { valid: false, props: out };
    }
    return { valid: true };
  }

  __hookBeforeSet(prop, val) {
    const result = this.validate(prop, val);
    return {
      mixin: ValidatableModelMixin.name,
      doSet: result.valid,
      prop: prop,
      val: val,
      message: result.message ?? null
    };
  }

  __hookBeforeConstruct(data, options, config) {
    const result = this.validateAll(data);
    if (!result.valid) {
      return {
        mixin: ValidatableModelMixin.name,
        doSet: false,
        props: result.props
      };
    } else {
      return {
        mixin: ValidatableModelMixin.name,
        doSet: true
      };
    }
  }
}

export default ValidatableModelMixin;