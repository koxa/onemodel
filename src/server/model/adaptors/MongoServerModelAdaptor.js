import BaseAdaptorMixin from "../../../common/adaptors/BaseAdaptor";
import {ObjectID} from "mongodb"

class MongoServerModelAdaptor extends BaseAdaptorMixin {

    static getDriver() {
        throw new Error('getDirver must be implemented in child class');
    }

    static getIdAttr() {
        return '_id';
    }

    static async create(data, params) {
        return await this.getDriver().insertOne(data).then(result => {
            return {_id: result.insertedId};
        });
    }

    static async read(id, params) {
        if (id) {
            id = id instanceof ObjectID ? id : new ObjectID(id);
            const result = await this.getDriver().findOne({[this.getIdAttr()]: id});
            return new this(result);
        } else {
            return (await this.getDriver().find(params).toArray()).map(b => new this(b));
        }
    }

    static async update(id, data, params) {
        id = id instanceof ObjectID ? id : new ObjectID(id);
        return await this.getDriver().updateOne({[this.getIdAttr()]: id}, {$set: data});
    }

    static delete(id, params) {

    }
}

export default MongoServerModelAdaptor;