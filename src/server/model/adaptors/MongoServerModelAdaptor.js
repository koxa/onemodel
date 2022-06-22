import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

//todo: move to separate package

class MongoServerModelAdaptor extends BaseAdaptor {

    static _config = {
        ...BaseAdaptor._config,
        idAttr: this.getIdAttr(),
        mongo: this.getMongo(),
        db: this.getDb()
    };

    static getMongo() {
        return null;
    }

    static getDb() {
        return null;
    }

    static getIdAttr() {
        return '_id';
    }

    static async create(data, {id, collectionName, filter, raw}) {
        const normalizedParams = this.getAdaptorParams( {id, collectionName, filter, raw}); //todo: ability to save
        return await this.getConfig().db.insertOne(data).then(result => {
            return {_id: result.insertedId};
        });
    }

    static async read(params) {
        return (await this.getConfig().db.find(params).toArray()).map(b => new this(b));
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
        const result = await this.getConfig().db.findOne(query);
        return new this(result);
    }

    static async update(id, data, params) {
        const mongo = this.getMongo();
        id = id instanceof mongo.ObjectID ? id : new mongo.ObjectID(id);
        return await this.getDb().updateOne({[this.getIdAttr()]: id}, {$set: data});
    }

    static delete(id, params) {

    }

    static getAdaptorParams({id, collectionName = this.getConfig().collectionName, filter, raw = false}) {
        return {
            id,
            collectionName,
            filter,
            raw
        }
    }

    getAdaptorParams({id = this.getId(), collectionName = this.getConfig().collectionName, filter, raw = false}) {
        return {
            id,
            collectionName,
            filter,
            raw
        }
    }
}

export default MongoServerModelAdaptor;