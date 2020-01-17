import BaseAdaptorMixin from "../../../common/adaptors/BaseAdaptor";

//todo: move to separate package

class MongoServerModelAdaptor extends BaseAdaptorMixin {

    static getMongo() {
        throw new Error('getMongo must be implemented in child class');
    }

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

    static async read(params) {
        return (await this.getDriver().find(params).toArray()).map(b => new this(b));
    }

    /**
     * Finds one record by param or set of params or ID
     * @param key or {key: val, ...} or Mongo.ObjectID or ID
     * @param val
     * @returns {Promise<MongoServerModelAdaptor>}
     */
    static async readOne(key, val) {
        let query;
        const mongo = this.getMongo();
        if (typeof key === 'object') { // e.g. {key: val} or Mongo.ObjectID
            if (key instanceof mongo.ObjectID) { // if ObjectID supplied
                query = {[this.getIdAttr()]: val};
            } else { // if key in format {key: val, key2: val2,...}
                query = key;
            }
        } else if (key && val !== undefined) {
            query = {[key]: val}
        } else if (key) { // if only key and it;s not object it's likely a numeric ID
            query = {[this.getIdAttr()]: new mongo.ObjectID(key)};
        }
        const result = await this.getDriver().findOne(query);
        return new this(result);
    }

    static async update(id, data, params) {
        const mongo = this.getMongo();
        id = id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id);
        return await this.getDriver().updateOne({[this.getIdAttr()]: id}, {$set: data});
    }

    static delete(id, params) {

    }
}

export default MongoServerModelAdaptor;