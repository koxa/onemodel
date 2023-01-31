import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

//todo: move to separate package

class MongoServerModelAdaptor extends BaseAdaptor {

    static config = {
        ...BaseAdaptor.config,
        idAttr: '_id',
        mongo: null, // global Mongo reference
        db: null // DB instance
    };

    static getCollection(collectionName = this.getConfig().collectionName || typeof this.getCollectionName !== 'undefined' && this.getCollectionName()) {
        const db = this.getConfig().db || this.db();
        if(!db || typeof collectionName !== 'string') {
            throw new Error('MongoServerModelAdaptor: DB instance or CollectionName is not defined');
        }
        return db.collection(this.getConfig().collectionName);
    }

    static async create(data, {id, collectionName, filter, raw}) {
        const params = this.getAdaptorParams( {id, collectionName, filter, raw}); //todo: ability to save
        return await this.getCollection(params.collectionName).insertOne(data).then(result => {
            return {_id: result.insertedId};
        });
    }

    static async read(params) {
        return (await this.getCollection().find(params).toArray()).map(b => new this(b));
    }

    /**
     * Finds one record by param or set of params or ID
     * @param key or {key: val, ...} or Mongo.ObjectID or ID
     * @param val
     * @returns {Promise<MongoServerModelAdaptor>}
     */
    static async readOne(key, val) {
        let query;
        const mongo = this.getConfig().mongo;
        if (typeof key === 'object') { // e.g. {key: val} or Mongo.ObjectID
            if (key instanceof mongo.ObjectID) { // if ObjectID supplied
                query = {[this.getConfig().idAttr]: val};
            } else { // if key in format {key: val, key2: val2,...}
                query = key;
            }
        } else if (key && val !== undefined) {
            query = {[key]: val}
        } else if (key) { // if only key and it;s not object it's likely a numeric ID
            query = {[this.getConfig().idAttr]: new mongo.ObjectID(key)};
        }
        const result = await this.getConfig().db.findOne(query);
        return new this(result);
    }


    static async update(data, {id, collectionName, filter, raw}) {
        const params = this.getAdaptorParams( {id, collectionName, filter, raw}); //todo: ability to save
        if (!params.id) {
            throw new Error('MongoServerModelAdaptor update: ID must be defined to update model')
        }
        const mongo = this.getConfig().mongo;
        const myID = params.id instanceof mongo.ObjectID ? params.id : new mongo.ObjectID(params.id); //todo: ObjectID is deprecated //todo: move to getAdaptorParams
        let result
        try {
            result = await this.getCollection().updateOne({[this.getConfig().idAttr]: myID}, {$set: data});
        } catch (err) {
            throw new Error('MongoServerModelAdaptor update: MongoDB error during updateOne: ' + err.toString());
        }
        if (result.acknowledged && result.modifiedCount === 1 && result.matchedCount === 1) {
            return true;
        } else {
            //todo: support Model changes rollback if unable to save OR implement sync/pending changes/versioning
        }
        throw new Error('MongoServerModelAdaptor update: Acknowledged false or modifiedCount/matchedCount not 1');
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