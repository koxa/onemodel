import ObservableModel from '../../common/model/ObservableModel';
import { applyProps, addMixins } from '../../utils/mixins';
import Store from '../../common/store/Store';

class ClientStore extends Store {
  static _config = {
    model: null,
  };

  static addMixins(mixins = []) {
    return addMixins(this, mixins);
  }

  constructor() {
    super(...arguments);
    for (let cls of this.constructor.__appliedMixins) {
      const clsObj = new cls(...arguments);
      applyProps(this, clsObj);
    }
  }

  /**
   * Returns a new OneStore that contains only the items that have been modified
   * @returns {ClientStore}
   */
  getModified() {
    const modified = this.filter((model) => model && model.isModified);
    return new ClientStore(...modified);
  }

  /**
   * Saves all changes made to the OneStore to the database
   * @returns {Promise<Object>} An object containing the results of the database operations (insertedCount, insertedIds, update, deletedCount)
   */
  async saveAll() {
    const result = {};
    const updates = this.getModified();
    const model = this.getClassModel();
    if (updates && updates.length) {
      const updateMany = await model.updateMany(updates);
      updates.forEach((model) => {
        model.isModified = false;
      });
      result.update = updateMany;
    }
    if (this.removed && this.removed.length) {
      const deleteMany = await model.deleteMany(this.removed);
      result.deletedCount = deleteMany.deletedCount;
      this.removed = [];
    }
    if (this.pushed && this.pushed.length) {
      const insertMany = await model.insertMany(this.pushed);
      result.insertedCount = insertMany.insertedCount;
      result.insertedIds = insertMany.insertedIds;
      this.pushed = [];
    }
    return result;
  }
}

ClientStore.addMixins([ObservableModel]);

export default ClientStore;
