import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import BaseAdaptor from '../../../common/adaptors/BaseAdaptor';
import { getFilter } from '../../../utils';

class JsonServerModelAdaptor extends BaseAdaptor {
  static _config = {
    ...BaseAdaptor._config,
    idAttr: 'id',
    pathDir: 'db/json/',
    memoryDb: null,
  };

  static idAttr() {
    return this.getConfig('idAttr');
  }

  /**
   * Executes a request to read data from a collection
   * @param {string} [params.id] Filter by id
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.columns] An object containing columns to select and their values, e.g. { id: true, name: true, email: false }
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @param {object} [params.sort] An object containing sort fields, e.g. { name: 1, age: -1 }
   * @param {number} [params.limit] Maximum number of rows to return
   * @param {number} [params.skip] Number of rows to skip before returning results
   * @param {object} [params={}] Returns all values by default
   * @returns {Promise<Array>} A promise that resolves to an array of row objects returned by the query
   */
  static async read(params = {}) {
    const { id, collectionName, columns, filter, sort, limit, skip, raw } =
      this.getAdaptorParams(params);
    const data = await this.readFile(collectionName);
    const filtered = getFilter(filter);

    let filteredData = raw ? data : data.slice(1);
    if (id) {
      const findElement = filteredData.find((doc) => doc[this.idAttr()] == id);
      filteredData = findElement ? [findElement] : [];
    } else if (filtered) {
      filteredData = filteredData.filter((doc) => this.matchFilter(doc, filtered));
    }

    if (typeof sort === 'object') {
      const sortKeys = Object.keys(sort);
      filteredData.sort((a, b) => {
        for (let i = 0; i < sortKeys.length; i++) {
          const key = sortKeys[i];
          const order = sort[key];
          const aValue = a[key];
          const bValue = b[key];
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, undefined, {
              numeric: true,
              sensitivity: 'base',
            });
            if (comparison !== 0) {
              return order === 1 ? comparison : -comparison;
            }
          } else if (aValue < bValue) {
            return order === 1 ? -1 : 1;
          } else if (aValue > bValue) {
            return order === 1 ? 1 : -1;
          }
        }
        return 0;
      });
    }
    if (skip) {
      filteredData = filteredData.slice(skip);
    }
    if (limit) {
      filteredData = filteredData.slice(0, limit);
    }

    if (columns) {
      const selectedData = [];
      const columnKeys = Object.keys(columns);
      for (let i = 0; i < filteredData.length; i++) {
        const doc = filteredData[i];
        const selectedDoc = {};
        for (let j = 0; j < columnKeys.length; j++) {
          const key = columnKeys[j];
          const select = columns[key];
          if (select) {
            selectedDoc[key] = doc[key];
          }
        }
        selectedData.push(selectedDoc);
      }
      return selectedData;
    }

    return filteredData;
  }

  /**
   * Creates a new document in the collection
   * @param {object} data - Object containing the data to be inserted
   * @param {object} [params.collectionName] - Collection name, e.g. { collectionName: 'test' }
   * @returns {Promise<object>} - A promise that resolves to the newly inserted document
   */
  static async create(data, params = {}) {
    const { collectionName } = this.getAdaptorParams(params);
    const collectionData = await this.readFile(collectionName);
    const id = ++collectionData[0].lastId || 11;
    const newDoc = { ...data, [this.idAttr()]: id };
    collectionData.push(newDoc);
    await this.writeFile(collectionName, collectionData);
    return {
      [this.idAttr()]: Number(id),
    };
  }

  /**
   * Updates an existing document in the collection
   * @param {object} data - Object containing the data to be updated
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @param {object} [params] - Object containing query parameters
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the update was successful
   */
  static async update(data, params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    const filters = getFilter({ [this.idAttr()]: id, ...filter });
    if (!filters) {
      throw new Error(
        'JsonServerModelAdaptor update: "id" or "filter" must be defined to update model',
      );
    }
    const existingDocs = await this.read({ filter: filters }, { collectionName });
    if (!existingDocs || existingDocs.length === 0) {
      throw new Error(`Document with id ${filter[this.idAttr()]} does not exist`);
    }
    const allDocs = await this.read({ collectionName, raw: true });
    const modifiedData = allDocs.map((doc) => {
      if (this.matchFilter(doc, filters)) {
        return { ...doc, ...data };
      }
      return doc;
    });
    await this.writeFile(collectionName, modifiedData);
    return true;
  }

  /**
   * Executes a request to count the number of documents in a collection.
   * @param {string} params.collectionName - The name of the collection to count documents in.
   * @returns {Promise<number>} - The number of documents in the collection.
   */
  static async count(params = {}) {
    const { collectionName } = this.getAdaptorParams(params);
    const data = await this.readFile(collectionName);
    return data.length - 1;
  }

  /**
   * Deletes a document with the given ID from the collection
   * @param {number} id - The ID of the document to delete
   * @param {string} [params.collectionName] The name of the table to select data from
   * @param {object} [params={}] - Object containing parameters that affect the behavior of the function, e.g. { collectionName: 'test' }
   * @returns {Promise<boolean>} - A promise that resolves to a boolean value indicating whether the deletion was successful
   */
  static async deleteOne(id, params = {}) {
    if (!id) {
      throw new Error('JsonServerModelAdaptor deleteOne: ID must be defined');
    }
    const { collectionName } = this.getAdaptorParams(params);
    const collectionData = await this.readFile(collectionName);

    const index = collectionData.findIndex((doc) => doc[this.idAttr()] == id);
    if (index === -1) {
      return {
        deletedCount: 0,
      };
    }

    collectionData.splice(index, 1);
    await this.writeFile(collectionName, collectionData);
    return {
      deletedCount: 1,
    };
  }

  /**
   * Executes a request to delete documents from a collection.
   * @param {string} params.collectionName - The name of the collection to delete documents from.
   * @param {object} [params.id] Filter by id
   * @param {object} [params.filter={}] - The filter to apply to the query. Property names may include
   *   operators, such as $eq, $ne, $lt, $lte, $gt, $gte, $in, $notIn, $like, $notLike, $or and $and.
   *   By default, all documents in the collection will be returned.
   *   e.g. { age: 18, gender: 'female' }, { firstName: { $eq: 'firstName3' } }, { firstName: { $in: ['firstName3', 'firstName7'] } },
   *   { firstName: { $like: 'firstName' } },
   * @returns {Promise<object>} - An object containing information about the operation, including the number of documents deleted.
   */
  static async delete(params = {}) {
    const { id, collectionName, filter } = this.getAdaptorParams(params);
    let deletedCount = 0;
    const filters = getFilter({ [this.idAttr()]: id, ...filter });
    let filteredData = await this.readFile(collectionName);
    filteredData = filteredData.filter((doc, index) => {
      if (index === 0) {
        return true;
      }
      if ((filters && this.matchFilter(doc, filters)) || !filters) {
        deletedCount++;
        return false;
      }
      return true;
    });

    await this.writeFile(collectionName, filteredData);
    return {
      deletedCount,
    };
  }

  static async readFile(collectionName) {
    const initData = [
      {
        lastId: 0,
      },
    ];
    const collectionFile = this.getCollection(collectionName);
    if (this.getConfig('memoryDb')) {
      if (!this.getConfig('memoryDb')[collectionName]) {
        this.getConfig('memoryDb')[collectionName] = initData;
      }
      return [...this.getConfig('memoryDb')[collectionName]];
    }
    if (!existsSync(collectionFile)) {
      return initData;
    }
    const rawData = await fs.readFile(collectionFile, 'utf-8');
    try {
      return JSON.parse(rawData);
    } catch (e) {
      throw new Error('JsonServerModelAdaptor readFile:', e);
    }
  }

  static async writeFile(collectionName, data) {
    const collectionFile = this.getCollection(collectionName);
    if (this.getConfig('memoryDb')) {
      return (this.getConfig('memoryDb')[collectionName] = [...data]);
    }
    const dirPath = this.getConfig('pathDir');
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    try {
      return await fs.writeFile(collectionFile, JSON.stringify(data, null, 2));
    } catch (e) {
      throw new Error('JsonServerModelAdaptor writeFile:' + e);
    }
  }

  /**
   * Matches a document against a filter
   * @param {object} doc The document to match
   * @param {object} filter The filter object
   * @returns {boolean} Whether the document matches the filter
   */
  static matchFilter(doc, filter) {
    const entries = Object.entries(filter);
    const values = entries.map(([key, value]) => ({ key, value }));
    for (let i = 0; i < values.length; i++) {
      const { key, value } = values[i];
      if (key.startsWith('$')) {
        if (key === '$and') {
          for (let j = 0; j < value.length; j++) {
            if (!this.matchFilter(doc, value[j])) {
              return false;
            }
          }
          return true;
        } else if (key === '$or') {
          let matchFound = false;
          for (let j = 0; j < value.length; j++) {
            if (this.matchFilter(doc, value[j])) {
              matchFound = true;
              break;
            }
          }
          return matchFound;
        } else if (key === '$not') {
          return !this.matchFilter(doc, value);
        }
      } else if (typeof value === 'object') {
        const docValue = doc[key];
        const valueKeys = Object.keys(value);
        for (let j = 0; j < valueKeys.length; j++) {
          try {
            const operator = valueKeys[j];
            const operand = value[operator];
            if (operator === '$eq' && docValue != operand) {
              return false;
            } else if (operator === '$ne' && docValue == operand) {
              return false;
            } else if (operator === '$lt' && docValue >= operand) {
              return false;
            } else if (operator === '$lte' && docValue > operand) {
              return false;
            } else if (operator === '$gt' && docValue <= operand) {
              return false;
            } else if (operator === '$gte' && docValue < operand) {
              return false;
            } else if (operator === '$in' && !operand.includes(docValue)) {
              return false;
            } else if (operator === '$notIn' && operand.includes(docValue)) {
              return false;
            } else if (operator === '$like' && !docValue.includes(operand)) {
              return false;
            } else if (operator === '$notLike' && docValue.includes(operand)) {
              return false;
            }
          } catch (error) {
            console.error(error);
          }
        }
      } else if (doc[key] != value) {
        return false;
      }
    }
    return true;
  }

  static getCollection(collectionName = this.getConfig('collectionName')) {
    return path.join(this.getConfig('pathDir'), `${collectionName}.json`);
  }

  static getAdaptorParams({
    id,
    collectionName = this.getConfig('collectionName'),
    raw,
    filter,
    ...props
  }) {
    return {
      id,
      collectionName,
      raw,
      filter,
      ...props,
    };
  }

  getAdaptorParams({
    id = this.getId(),
    collectionName = this.getConfig('collectionName'),
    filter,
    ...props
  }) {
    return {
      id,
      collectionName,
      filter,
      ...props,
    };
  }
}

export default JsonServerModelAdaptor;
