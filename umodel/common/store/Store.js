import Base from '../../Base';
import ObservableMixin from "../mixins/ObservableMixin";

class Store extends Base {

    static getModelClass() {
        throw new Error('getModelClass must be implemented in child class');
    }

    constructor(items = []) {
        super();
        this.items = [];
        if (items) {
            var modelClass = this.constructor.getModelClass();
            if (Array.isArray(items)) {
                this.addAll(items);
            } else {
                throw new Error('Items must be an Array');
            }
        }
    }

    get(id) {
        var modelClass = this.constructor.getModelClass();
        var idAttr = modelClass.getIdAttr();

        if (idAttr) {
            return this._indexedItems[idAttr][id];
        } else {
            console.log("indexing is not enabled");
            return false;
        }
    }

    getIds() {

    }

    getAt(index) {
        return this.items[index];
    }

    getAll() {
        return this.items;
    }

    getSize() {
        return this.items.length;
    }

    add(item, silent, updateIfExists) {
        var modelClass = this.constructor.getModelClass();
        if (!(item instanceof modelClass)) {
            item = new modelClass(item);
        }

        //if indexes available check for item existance
        let indexes = modelClass.getIndexes();
        if (indexes) {
            let i = 0, len = indexes.length;
            for (; i < len; i++) {
                let index = indexes[i]; //todo: check supported index types
                let name = index.name ? index.name : !Array.isArray(index.field) ? index.field : index.field.join();
                let field = index.field;
                let value;
                if (!Array.isArray(field)) {
                    value = item[field];
                } else {
                    value = '';
                    for (let f = 0; f < field.length; f++) {
                        value += item[field[f]];
                    }
                }

                if (!value && index.type === modelClass.INDEX_PRIMARY) { // if Primary field value is not defined or empty, we will use Id instead
                    value = item.getId();
                }

                if (!this._indexedItems) {
                    this._indexedItems = {};
                }

                if (!this._indexedItems[name]) {
                    this._indexedItems[name] = {};
                }
                if (this._indexedItems[name][value]) {
                    if (!updateIfExists) {
                        console.log('item already exists by index: ' + name + ', value:' + value);
                    } else {
                        console.log('item was updated because already exists by index: ' + name + ', value:' + value);
                        this._indexedItems[name][value].setAll(item);
                    }
                    return this;
                } else {
                    //add an item to index
                    this._indexedItems[name][value] = item;
                }
            }
        }
        this.items.push(item);
        !silent && this.emit("update");
        //!noSync && this.syncDown(item);
        //sync && this.serverAdd(item);
        return this;
    }

    addAll(items, silent, updateIfExists, ...rest) {
        var i = 0, len = items.length;
        for (; i < len; i++) {
            this.add(items[i], true, updateIfExists, ...rest);
        }
        //sync && this.serverSave();
        //!noSync && this.syncDown(items);
        !silent && this.emit("update");
        return this;
    }

    remove(id, silent) {
        let item = this.get(id);
        if (item) {
            let index = this.items.indexOf(item);
            this.items.splice(index, 1);
            delete this._indexedItems[id];
            !silent && this.emit("update");
            //!noSync && this.serverRemove(id);
        } else {
            console.log('not item found: ', id);
        }
        return this;
    }

    save() {

    }

    removeAt(index) {

    }

    _indexItems() {
        var modelClass = this.constructor.getModelClass();
        var idAttr = modelClass.getIdAttr();
        if (idAttr) {
            let i = 0, len = this.items.length;
            for (; i < len; i++) {
                let item = this.items[i];
                this._indexedItems[item.getId()] = item;
            }
        }
    }


    // syncDown(item) {
    //     if (typeof window !== 'undefined') {
    //         //window.localStorage && localStorage.setItem(this.constructor.name, JSON.stringify(this.items));
    //     }
    // }
    //
    // syncUp() {
    //     var self = this;
    //     if (typeof window !== 'undefined') {
    //         // if (window.localStorage) {
    //         //     console.log("storage", localStorage);
    //         //     var itemsString = localStorage.getItem(this.constructor.name);
    //         //     if (itemsString) {
    //         //         this.addAll(JSON.parse(itemsString), true);
    //         //     }
    //         // }
    //         $.get(this.endpoint, function (items) {
    //             self.addAll(items);
    //         });
    //     }
    // }
}

Store.addMixins([ObservableMixin]);

export default Store;