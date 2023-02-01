import getSchemaUtils from '../../../utils/schema';
import BaseAdaptor from '../../adaptors/BaseAdaptor';
import { HttpParams } from '../../types/Http';

abstract class HttpModelAdaptor extends BaseAdaptor {
  static config = {
    ...BaseAdaptor.config,
    hostname: HttpModelAdaptor.getHostname(),
    prefix: HttpModelAdaptor.getPrefix(),
    port: HttpModelAdaptor.getPort(),
  };

  static getHostname() {
    return '';
  }

  static getPrefix() {
    return 'api';
  }

  static getPort() {
    return 3001;
  }

  abstract request(params: Partial<HttpParams>, data?: any);

  /**
   *
   * @param params
   * @param data
   * @returns {Promise<*>}
   */
  async create(data = {}, params: Partial<HttpParams> = {}) {
    //todo: optimize so that params and config is one
    params.method = params.method || 'POST';
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  /**
   * Issues GET REST call to read by params or ID
   * Supported formats: [id] | [{params}] | [id, {params}] | [key, val] | [key, val, {params}]
   * @param {object|string|number} [mixed1] ID or Params Object or Key
   * @param {string|number|object} [mixed2] Value for a key in case first argument is key. Or Params object in case first param is id;
   * @param {object} [mixed3]
   * @returns {Promise<*>}
   */
  async read(mixed1, mixed2, mixed3) {
    //let id, hostname, prefix, port, collectionName, path, filter, raw, method; // possible supported params
    let id,
      filter,
      params: Partial<HttpParams> = {};

    if (arguments.length > 3) {
      throw new Error('HttModelAdaptor READ: Read method support maximum of 3 arguments');
    }

    if (arguments.length === 1) {
      // either ID or Params Object
      if (typeof mixed1 === 'number' || typeof mixed1 === 'string') {
        //ID
        id = mixed1;
      } else if (typeof mixed1 === 'object') {
        //Params object
        params = mixed1;
      } else {
        throw new Error('HttModelAdaptor READ: Unsupported argument type for arguments length 1');
      }
    } else if (arguments.length === 2) {
      //either key-val or (ID and Params Object)
      if (typeof mixed1 === 'string' && ['number', 'string'].includes(typeof mixed2)) {
        //key-val
        filter = { [mixed1]: mixed2 };
      } else if (['number', 'string'].includes(typeof mixed1) && typeof mixed2 === 'object') {
        //ID and Params Object
        id = mixed1;
        params = mixed2;
      } else {
        throw new Error('HttModelAdaptor READ: Unsupported argument type for arguments length 2');
      }
    } else if (arguments.length === 3) {
      //key-val and Params object
      if (
        typeof mixed1 === 'string' &&
        ['number', 'string'].includes(typeof mixed2) &&
        typeof mixed3 === 'object'
      ) {
        //key-val and Params
        filter = { [mixed1]: mixed2 };
        params = mixed3;
      } else {
        throw new Error('HttModelAdaptor READ: Unsupported argument type for arguments length 3');
      }
    }

    let { hostname, prefix, port, collectionName, path, raw, method } = { ...params };
    id = id || params.id;
    filter = filter || params.filter;
    method = method || 'GET';

    const normalizedParams: Partial<HttpParams> = this.getAdaptorParams({
      id,
      hostname,
      prefix,
      port,
      collectionName,
      path,
      filter,
      raw,
      method,
    });
    return await this.request(normalizedParams);
  }

  async update(data = {}, params: Partial<HttpParams> = {}) {
    //todo: url or id for static calls
    params.method = params.method || 'PUT';
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  async delete(params: Partial<HttpParams> = {}) {
    //todo: url or id for static calls
    params.method = params.method || 'DELETE';
    return await this.request({ ...this.getAdaptorParams(params) });
  }

  getAdaptorParams({
    // maybe rename to 'normalizeParams'
    id = this.getBaseModel().getId(),
    path,
    hostname = HttpModelAdaptor.config.hostname,
    prefix = HttpModelAdaptor.config.prefix,
    port = HttpModelAdaptor.config.port,
    collectionName,
    filter,
    raw = false,
    method,
  }: Partial<HttpParams>) {
    const { getDefaultCollectionName } = getSchemaUtils(this);
    if (!collectionName) {
      collectionName = getDefaultCollectionName();
    }

    if (!path) {
      path = `/${prefix}/${collectionName}` + (id ? `/${id}` : '');
    }
    if (filter && typeof filter === 'object' && Object.keys(filter).length) {
      // if filter is not empty
      // convert filter to querystring
      path += '?' + new URLSearchParams(filter);
    }
    return {
      id,
      path,
      hostname,
      port,
      method,
      raw,
    };
  }
}

export default HttpModelAdaptor;
