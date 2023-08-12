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
      return this.constructor.create(added, this.getConfig());
    }
    if (deletedIDs.length) {
      return this.constructor.delete(deletedIDs, this.getConfig());
    }
  }

  async fetch() {
    const results = this.constructor.read(this.getConfig());
    return this.add(results, {skipHooks: true, raw: true});
  }
}

export default BaseStoreAdaptor;