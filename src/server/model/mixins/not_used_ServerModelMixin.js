import BaseModel from '../../../common/model/BaseModel';
import Globals from '../../../../shared/stores/GlobalStore';

var Mixin = (Base) =>
  class extends Base {
    static getDbCollectionName() {
      throw new Error('getDbCollectionName must be implemented in child class');
    }

    static getDbCollection() {
      return Globals.DB.collection(this.getDbCollectionName());
    }

    static findById(id) {
      var idAttr = this.getIdAttr();
      this.find({
        idAttr: id,
      });
    }

    static find(params) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self
          .getDbInstance()
          .find(params)
          .toArray(function (err, docs) {
            if (err) {
              reject(err);
            } else {
              resolve(docs);
            }
          });
      });
    }

    save() {
      var collection = this.constructor.getDbInstance();
      var idAttr = this.constructor.getIdAttr();
      if (this.id) {
        collection.updateOne({ idAttr: this[idAttr] }, { $set: this });
      } else {
        collection.insertOne(this);
      }
    }

    remove() {}
  };

export default Mixin;
