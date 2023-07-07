class ValidatableMixin {

  static #validateProp(propConfig, val) {
    // it's an object: may have Type[Number, Array, String]. If not Type defined check for fields: options = Array, min/max = Number
    let type = propConfig["type"] ?? (propConfig["options"] ? Array : null) ?? (propConfig["min"] || propConfig["max"] ? Number : null);
    switch (type) {
      case Number:
        if (typeof val !== "number") {
          //throw new Error("Must be Number");
          return { valid: false, info: "Must be Number" };
        }
        break;
      case Array:
        if (!Array.isArray(val)) {
          //throw new Error("Must be Array");
          return { valid: false, info: "Must be Array" };
        }
        break;
      case String:
        if (typeof val !== "string") {
          //throw new Error("Must be String");
          return { valid: false, info: "Must be String" };
        }
        break;
      default:
        return { valid: false, info: "Unknown prop config type" };
    }
    return { valid: true };
  }
  //todo: support multi prop validation
  validate(prop, val) {
    const propConfigs = this.getConfig("props");
    if (propConfigs && typeof propConfigs === "object") {
      if (propConfigs[prop] && typeof propConfigs[prop] === "object") {
        return ValidatableMixin.#validateProp(propConfigs[prop], val);
      }
    }
    return { valid: true };
  }

  __hookBeforeSet(prop, val) {
    let { valid, info } = this.validate(prop, val);
    return {
      mixin: ValidatableMixin.name,
      doSet: valid,
      prop: prop,
      val: val,
      info: info
    };
  }
}

export default ValidatableMixin;