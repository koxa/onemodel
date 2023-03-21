import BaseAdaptor from '../../adaptors/BaseAdaptor';
import ArrayModelReturns from '../../types/ArrayModelReturns';
import { getFilter } from '../../../utils';

class HttpModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    hostname: this.getHostname(),
    prefix: this.getPrefix(),
    port: this.getPort(),
  };

  static getHostname() {
    return '';
  }

  static getPrefix() {
    return 'api';
  }

  static getPort() {
    return 3000;
  }

  /**
   *
   * @param params
   * @param data
   * @returns {Promise<*>}
   */
  static async create(data = {}, params = {}) {
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
  static async read(mixed1, mixed2, mixed3) {
    //let id, hostname, prefix, port, collectionName, path, filter, raw, method; // possible supported params
    let id,
      filter,
      params = {};

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

    let { hostname, prefix, port, collectionName, path, raw, method, sort, limit, skip, columns } =
      { ...params };
    id = id || params.id;
    filter = { ...filter, ...params.filter };
    method = method || 'GET';

    const normalizedParams = this.getAdaptorParams({
      id,
      hostname,
      prefix,
      port,
      collectionName,
      path,
      filter,
      raw,
      method,
      sort,
      limit,
      skip,
      columns,
    });
    const response = await this.request(normalizedParams);
    return Array.isArray(response)
      ? new ArrayModelReturns(
          { model: this, mixed1, mixed2, mixed3 },
          ...response.map((item) => new this(item)),
        )
      : new this(response);
  }

  static async update(data = {}, params = {}) {
    //todo: url or id for static calls
    params.method = params.method || 'PUT';
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  static async updateMany(data = [], params = {}) {
    params.method = params.method || 'PUT';
    params.options = { isUpdateMany: true };
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  static async insertMany(data = [], params = {}) {
    params.method = params.method || 'POST';
    params.options = { isInsertMany: true };
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  static async deleteMany(data = [], params = {}) {
    params.method = params.method || 'DELETE';
    params.options = { isDeleteMany: true };
    return await this.request({ ...this.getAdaptorParams(params) }, data);
  }

  static async count(params = {}) {
    //todo: url or id for static calls
    params.method = params.method || 'GET';
    return await this.request({ ...this.getAdaptorParams({ ...params, id: 'count' }) });
  }

  static async delete(params = {}) {
    //todo: url or id for static calls
    params.method = params.method || 'DELETE';
    return await this.request({ ...this.getAdaptorParams(params) });
  }

  static getAdaptorParams({
    // maybe rename to 'normalizeParams'
    id,
    path,
    hostname = this.getConfig().hostname,
    prefix = this.getConfig().prefix,
    port = this.getConfig().port,
    collectionName = this.getConfig().collectionName,
    raw = false,
    method,
    filter,
    sort,
    limit,
    skip,
    columns,
    options,
  }) {
    if (!path) {
      path = `/${prefix}/${collectionName}` + (id ? `/${id}` : '');
    }

    const queryParams = getFilter({ filter, sort, limit, skip, columns, options });

    return {
      id,
      path,
      hostname,
      port,
      method,
      raw,
      queryParams,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    path,
    hostname = this.getConfig().hostname,
    prefix = this.getConfig().prefix,
    port = this.getConfig().port,
    collectionName = this.getConfig().collectionName,
    raw = false,
    method,
    filter,
    sort,
    limit,
    skip,
    columns,
    options,
  }) {
    if (!path) {
      path = `/${prefix}/${collectionName}` + (id ? `/${id}` : '');
    }

    const queryParams = getFilter({ filter, sort, limit, skip, columns, options });

    return {
      id,
      path,
      hostname,
      port,
      prefix,
      collectionName,
      raw,
      method,
      queryParams,
    };
  }
}

export default HttpModelAdaptor;
