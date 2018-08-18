import BaseAdaptorMixin from "../../../common/adaptors/BaseAdaptor";

class MongoServerModelAdaptor extends BaseAdaptorMixin {

    static getDriver() {
        throw new Error('getDirver must be implemented in child class');
    }

    static create(data, params) {

    }

    static read(id, params) {

    }

    static update(id, data, params) {

    }

    static delete(id, params) {

    }

    static findById(id) {
        return this.find({
            [this.getIdAttr()]: id
        })
    }

    static find(params) {
        return new Promise((resolve, reject) => {
            this.getDriver().find(params).toArray(function (err, docs) {
                if (err) {
                    reject(err)
                } else {
                    resolve(docs);
                }
            });
        });
    }

    save() {
        const collection = this.constructor.getDriver();
        const idAttr = this.constructor.getIdAttr();
        if (this.id) {
            collection.updateOne({idAttr: this[idAttr]}, {$set: this});
        } else {
            collection.insertOne(this);
        }
    }
}

export default MongoServerModelAdaptor;