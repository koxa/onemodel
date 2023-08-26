import { isLiteralObject } from "../../../utils/index.js";
import ValidatableModelMixin from "./ValidatableModelMixin.js";

function beforeConstruct(data, options, config) {
  const result = this.convertAll(data);
  return {
    mixin: ConvertibleModelMixin.name,
    doSet: result.success,
    data: result.data,
    ...(result.errors ?? {})
  };
}

function beforeSet(prop, val) {
  const result = this.convert(prop, val);
  return {
    mixin: ConvertibleModelMixin.name,
    doSet: result.success,
    prop: prop,
    val: result.val,
    ...(result.error ?? {})
  };
}

function doConversion(propConfig, val) {
  let error = "";
  let success = true;
  let convertedVal = val;
  switch (propConfig.type) {
    case String:
      convertedVal = String(val); //todo: can everything be converted to String ?
      break;
    case Number:
      switch (typeof val) {
        case "undefined":
          // return as is, validator will check further
          break;
        case "function":
        case "object":
        case "symbol":
          success = false;
          error = "Unable to convert value to Number";
          break;
        case "number":
        case "bigint": //todo: review bigint
        case "boolean": //todo: should boolean be converted to number ?
          convertedVal = Number(val);
          if (isNaN(convertedVal)) {
            success = false;
            error = "Unable to convert value to Number";
          }
          break;
        case "string":
          // empty string must be returned as is to be treated by validator further
          if (val.trim() === "") {
            break;
          }
          // otherwise try to convert String to Number
          convertedVal = Number(val);
          if (isNaN(convertedVal)) {
            success = false;
            error = "Unable to convert value to Number";
          }
          break;
        default:
          success = false;
          error = "Unknown value type to be converted to Number";
      }
      break;
    default:
      success = false;
      error = "Unsupported OR Undefined type in prop config";
  }
  return { success, val: convertedVal, error };
}

export default class ConvertibleModelMixin {
  static hooks = {
    beforeConstruct: [beforeConstruct],
    beforeSet: [beforeSet]
  };

  convert(prop, val) {
    const props = this.getConfig("props");
    if (isLiteralObject(props[prop])) {
      return doConversion(props[prop], val);
    }
    return { success: true, val };
  }

  convertAll(data) {
    const props = this.getConfig("props");
    let errors = {};
    let success = true;
    for (let prop in data) { // we only convert incoming data
      const propCfg = props[prop];
      if (isLiteralObject(propCfg)) {
        const result = doConversion(propCfg, data[prop]);
        data[prop] = result.val;
        if (!result.success) {
          success = false;
          errors[prop] = result.error;
        }
      }
    }

    return Object.assign({ success, data }, success ? {} : { errors });
  }
}