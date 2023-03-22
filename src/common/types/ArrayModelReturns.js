import { deepEqual } from '../../utils';

class ArrayModelReturns extends Array {
  constructor(_params, ...items) {
    super(...items);
    const { model, ...params } = _params;
    Object.defineProperty(this, 'params', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: params || {},
    });

    Object.defineProperty(this, 'model', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: model,
    });

    Object.defineProperty(this, 'pushed', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: [],
    });

    Object.defineProperty(this, 'removed', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: [],
    });
  }

  getModified() {
    const modified = super.filter((model) => model && model.isModified);
    return new ArrayModelReturns({ model: this.model, ...this.params }, ...modified);
  }

  find(param1, param2) {
    if (typeof param1 === 'number' || !isNaN(param1)) {
      const index = this.findIndex(param1);
      return this[index];
    } else if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
      return super.find((model) => deepEqual(model[param1], param2));
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`,
    );
  }

  findIndex(id) {
    if (id === undefined || id === null || this.length === 0) {
      return -1;
    }
    const idAttr = this.model.getConfig('idAttr');
    return super.findIndex((item) => item[idAttr] == id);
  }

  push() {
    for (const element of arguments) {
      const model = new this.model(element);
      this.pushed.push(model);
      super.push(model);
    }
  }

  removeById(id) {
    const index = this.findIndex(id);
    if (index > -1) {
      const primaryKey = this.model.getConfig('idAttr');
      const id = this[index][primaryKey];
      if (typeof id !== 'undefined') {
        this.removed.push(id);
      }
      super.splice(index, 1);
      return true;
    }
    return false;
  }

  removeByKeyValue(key, value) {
    const index = super.findIndex((model) => deepEqual(model[key], value));
    if (index > -1) {
      const primaryKey = this.model.getConfig('idAttr');
      const id = this[index][primaryKey];
      if (typeof id !== 'undefined') {
        this.removed.push(id);
      } else {
        const pushedIndex = this.pushed.findIndex((pushed) => pushed[key] == value);
        if (pushedIndex > -1) {
          this.pushed.splice(pushedIndex, 1);
        }
      }
      super.splice(index, 1);
      return true;
    }
    return false;
  }

  remove(param1, param2) {
    if (typeof param1 === 'number' || !isNaN(param1)) {
      return this.removeById(param1);
    } else if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
      return this.removeByKeyValue(param1, param2);
    }
    throw new Error(
      `Invalid parameters, param1 takes id or param1 key and param2 value: param1 - ${typeof param1}, param2 - ${typeof param2}`,
    );
  }

  async restore() {
    const updates = this.getModified();
    if (updates && updates.length) {
      try {
        const result = await this.model.read.apply(
          this.model,
          Object.keys(this.params)
            .map((key) => this.params[key])
            .filter(Boolean),
        );
        this.pushed = [];
        this.removed = [];
        this.splice(0, this.length, ...result);
        return this;
      } catch (err) {
        throw new Error('ArrayModel reset: ' + err);
      }
    }
    return this;
  }

  async saveAll() {
    const result = {};
    const updates = this.getModified();
    if (updates && updates.length) {
      const updateMany = await this.model.updateMany(updates);
      updates.forEach((model) => {
        model.isModified = false;
      });
      result.update = updateMany;
      console.log('saveAll update: ', updates, 'response: ', updateMany);
    }
    if (this.removed && this.removed.length) {
      const deleteMany = await this.model.deleteMany(this.removed);
      result.deletedCount = deleteMany.deletedCount;
      console.log('saveAll delete: ', this.removed, 'response: ', deleteMany);
      this.removed = [];
    }
    if (this.pushed && this.pushed.length) {
      const insertMany = await this.model.insertMany(this.pushed);
      result.insertedCount = insertMany.insertedCount;
      result.insertedIds = insertMany.insertedIds;
      console.log('saveAll insert: ', this.pushed, 'response: ', insertMany);
      this.pushed = [];
    }
    return result;
  }
}

export default ArrayModelReturns;
