class BaseAdaptor {
  static config = {
    collectionName() {
      return this.name.toLowerCase(); // will be applied during getConfig against workable object
    }
  };

  static create() {
    throw new Error("CREATE method must be implemented in child Adaptor");
  }

  static read() {
    throw new Error("READ method must be implemented in child Adaptor");
  }

  static update() {
    throw new Error("UPDATE method must be implemented in child Adaptor");
  }

  static delete() {
    throw new Error("DELETE method must be implemented in child Adaptor");
  }

  fetch() {

  }

  save() {

  }
}

export default BaseAdaptor;