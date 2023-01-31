import { isClass } from '../utils';
import { DEFAULT_CLIENT_ID_ATTR, DEFAULT_ID_ATTR } from './const/base';
import { Config } from './types/BaseConfig';

export default class BaseConfig {
  static config: Config = {
    idAttr: DEFAULT_ID_ATTR,
    clientIdAttr: DEFAULT_CLIENT_ID_ATTR,
    props: null,
    reactivity: false,
    validators: null,
    converters: null,
  };

  /**
   * Returns config including dynamic values generated by config functions
   * @returns {{}} New object consisting of static config copy + dynamic config functions
   */
  static getConfig(cfgProp?: string): Config {
    const getCfgVal = (prop) => {
      return typeof this.config[prop] === 'function' && !isClass(this.config[prop])
        ? this.config[prop].apply(this)
        : this.config[prop];
    };
    if (cfgProp) {
      return getCfgVal(cfgProp);
    }
    const out = {};
    for (let prop of Object.getOwnPropertyNames(this.config)) {
      out[prop] = getCfgVal(prop);
    }
    return out as Config;
  }

  static configure(config: Partial<Config>) {
    return Object.assign(this.config, config);
  }
}