import Model from './Model';
import Globals from '../../../shared/stores/GlobalStore';

class ServerModel extends Model {
    
    static getDbCollectionName() {
        throw new Error('getDbCollectionName must be implemented in child class');
    }

    static getDbInstance() {
        return Globals.DB.collection(this.getDbCollectionName());
    }

    static findById(id) {

    }

    static find(params) {

    }

    save() {
        var collection = this.constructor.getDbInstance();
        var idAttr = this.constructor.getIdAttr();
        if (this.id) {
            collection.updateOne({idAttr: this[idAttr]}, {$set: this});
        } else {
            collection.insertOne(this);
        }
    }

    remove() {

    }
}

export default ServerModel;