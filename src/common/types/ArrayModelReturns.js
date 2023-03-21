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

  find(id) {
    const index = this.findIndex(id);
    if (index > -1) {
      return this[index];
    }
  }

  findIndex(id) {
    if (id === undefined || id === null || this.length === 0) {
      return -1;
    }
    const idAttr = this.model.getConfig('idAttr');
    return super.findIndex((item) => item[idAttr] === id);
  }

  push() {
    for (const element of arguments) {
      this.pushed.push(element);
      super.push(element);
    }
  }

  remove(id) {
    const index = this.findIndex(id);
    if (index > -1) {
      this.removed.push(this[index][this.model.getConfig('idAttr')]);
      super.splice(index, 1);
    }
    return false;
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
      result.delete = deleteMany;
      console.log('saveAll delete: ', this.removed, 'response: ', deleteMany);
      this.removed = [];
    }
    if (this.pushed && this.pushed.length) {
      const insertMany = await this.model.insertMany(this.pushed);
      result.insert = insertMany;
      console.log('saveAll insert: ', this.pushed, 'response: ', insertMany);
      this.pushed = [];
    }
    return result;
  }
}

export default ArrayModelReturns;
