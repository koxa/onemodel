class ArrayModelReturns extends Array {
  constructor(params, ...items) {
    super(...items);
    this.params = params || {};
  }

  getModified() {
    return this.filter((model) => {
      if (model && model.isModified) {
        return model;
      }
    });
  }

  async restore() {
    const updates = this.getModified();
    if (updates && updates.length) {
      try {
        const model = updates[0].constructor;
        const result = await model.read.apply(
          model,
          Object.keys(this.params)
            .map((key) => this.params[key])
            .filter(Boolean),
        );
        this.splice(0, this.length, ...result);
        return this;
      } catch (err) {
        throw new Error('ArrayModel reset: ' + err);
      }
    }
    return this;
  }

  async saveAll() {
    const updates = this.getModified();
    if (updates && updates.length) {
      try {
        const result = await updates[0].constructor.updateMany(updates);
        if (result) {
          updates.forEach((model) => {
            model.isModified = false;
          });
        }
        return result;
      } catch (err) {
        throw new Error('ArrayModel saveAll: ' + err);
      }
    }
    return false;
  }
}

export default ArrayModelReturns;
