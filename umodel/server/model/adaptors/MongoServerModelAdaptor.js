import BaseAdaptorMixin from "../../../common/adaptors/BaseAdaptor";

class MongoServerModelAdaptor extends BaseAdaptorMixin {

    static getDriver() {
        throw new Error('getDirver must be implemented in child class');
    }

    static getIdAttr() {
        return '_id';
    }

    static async create(data, params) {
        return await this.getDriver().insertOne(data);
    }

    static async read(id, params) {
        if (id) {
            return new this(await this.getDriver().findOne({[this.getIdAttr()]: id}));
        } else {
            return (await this.getDriver().find(params).toArray()).map(b => new this(b));
        }
    }

    static async update(id, data, params) {
        return await this.getDriver().updateOne({[this.getIdAttr()]: id}, {$set: data});
    }

    static delete(id, params) {

    }
}

export default MongoServerModelAdaptor;