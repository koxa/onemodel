import ServerModel from "../ServerModel";
import BaseAdaptorMixin from "../../../common/mixins/BaseAdaptorMixin";

class MongoServerModel extends BaseAdaptorMixin {

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
        const collection = this.constructor.getDbInstance();
        const idAttr = this.constructor.getIdAttr();
        if (this.id) {
            collection.updateOne({idAttr: this[idAttr]}, {$set: this});
        } else {
            collection.insertOne(this);
        }
    }
}

export default ServerModel;