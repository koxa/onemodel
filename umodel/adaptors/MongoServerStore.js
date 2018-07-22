import ServerStore from '../store/ServerStore';

class MongoServerStore extends ServerStore {

    static getDbCollection() {
        return this.getModelClass().getDbInstance();
    }

    // add(item, silent, updateIfExists, noPersist) {
    //     super(item, silent, updateIfExists);
    //     return new Promise((resolve, reject)=>{
    //         if(!noPersist){
    //             resolve()
    //         }else{
    //             this.constructor.serverAdd(this.items);
    //         }
    //     });
    //
    // }
    //
    // addAll(items, silent, updateIfExists, noPersist) {
    //     super(items, silent, updateIfExists, true);
    //     !noPersist && this.constructor.serverAddAll(this.items);
    // }

    // serverFetch(params) {
    //     console.log('serverFetch');
    //     var db = this.constructor.getDbInstance();
    //     var modelClass = this.constructor.getModelClass();
    //     var fetchProp;
    //     if (!params) {
    //         fetchProp = modelClass.getIdAttr();
    //     } else {
    //         fetchProp = params;
    //     }
    //     //todo: REWORK
    //     var i = 0, len = this.items.length, ids = [];
    //     for (; i < len; i++) {
    //         if (!Array.isArray(fetchProp)) {
    //             if (this.items[i][fetchProp] !== undefined) {
    //                 ids.push(this.items[i][fetchProp]);
    //             } else {
    //                 console.log('Not Fetch Prop found in item, prop:' + fetchProp);
    //             }
    //         } else {
    //             let obj = {};
    //             for (let p = 0; p < fetchProp.length; p++) {
    //                 let prop = fetchProp[i];
    //                 if (this.items[i][prop] !== undefined) {
    //                     obj[prop] = this.items[i][prop];
    //                 }
    //             }
    //             if (Object.keys(obj).length === fetchProp.length) {
    //                 ids.push(obj);
    //             } else {
    //                 console.log('Not All Composite Fetch Props found in item, prop:' + fetchProp);
    //             }
    //         }
    //     }
    //
    //     return db.find(ids).toArray(function (err, docs) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("serverFetch DONE", docs);
    //         }
    //     });
    // }

    static find(params) {
        console.log('serverFind');
        var db = this.getDbCollection();
        return new Promise((resolve, reject) => {
            db.find(params).toArray(function (err, docs) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("serverFind DONE", docs);
                    resolve(docs);
                }
            });
        });
    }

    // static serverSave() {
    //     console.log('serverSave');
    //     var db = this.constructor.getDbInstance();
    //     var self = this;
    //     return new Promise(function (resolve, reject) {
    //         db.insertMany(self.items, function (err, result) {
    //             if (err) {
    //                 console.log(err);
    //                 reject(err);
    //             } else {
    //                 console.log("serverSave DONE", result);
    //                 resolve(result);
    //             }
    //         });
    //     });
    // }

    static add(item) {
        console.log('serverAdd');
        var db = this.getDbCollection();
        return db.insertOne(item, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("serverAdd DONE", result);
            }
        });
    }

    static addAll(items) {
        console.log('serverAddAll');
        var db = this.getDbCollection();
        return new Promise((resolve, reject) => {
            db.insertMany(items, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("serverAddMany DONE", result);
                    resolve(result);
                }
            });
        });
    }

    static update(filter, update, options) {
        console.log('serverUpdate');
        var db = this.getDbCollection();
        return db.updateMany(filter, update, options, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("serverUpdate DONE", result);
            }
        });
    }

    static updateAll(filter, update, options) {
        console.log('serverUpdateAll');
        var db = this.getDbCollection();
        return db.updateMany(filter, update, options, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("serverUpdateAll DONE", result);
            }
        });
    }

    static remove(id) {

    }

    static removeAll(params) {

    }
}

export default MongoServerStore;