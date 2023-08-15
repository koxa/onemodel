class BaseStoreAdaptor {
  static config = {
    collectionName() { //make sure it's method so scope not in closure here
      return this.name.toLowerCase(); // will be applied during getConfig against workable object
    }
  };

  static create(records = [], config = this.getConfig()) {
    throw new Error("CREATE method must be implemented in child Adaptor");
  }

  static read() {
    throw new Error("READ method must be implemented in child Adaptor");
  }

  static update() {
    throw new Error("UPDATE method must be implemented in child Adaptor");
  }

  static delete(ids = [], config = this.getConfig()) {
    throw new Error("DELETE method must be implemented in child Adaptor");
  }

  async save() {
    let added = this.getAdded();
    let deletedIDs = this.getDeletedIDs();
    if (added.length) {
      const out = await this.constructor.create(added, this.getConfig());
      this.refreshAdded();
      return out;
    }
    if (deletedIDs.length) {
      return this.constructor.delete(deletedIDs, this.getConfig());
    }
  }

  async fetch() {
    this.refreshAdded();
    this.refreshDeleted();
    this.empty(); // clear array before reading
    const results = await this.constructor.read(this.getConfig());
    const res = this.push(...results);
    this.refreshAdded(); //todo: find different approach for this
    return res;
  }
}

export default BaseStoreAdaptor;