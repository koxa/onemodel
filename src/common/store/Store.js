import Base from '../Base';
import ObservableMixin from "../mixins/ObservableMixin";
import SortableStoreMixin from "./mixins/SortableStoreMixin";

class Store extends Base {

    static getModelClass() {
        return null;
    }

    constructor(items = []) {
        super();
        this.items = [];
        if (items) {
            if (Array.isArray(items)) {
                this.addAll(items);
            } else {
                throw new Error('Items must be an Array');
            }
        }
    }

    get(key, val) {
        for (let item of items) {
            if (typeof item === 'object' && item.hasOwnProperty(key) && item[key] === val) {
                return item;
            }
        }
        return null;
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
        const modelClass = this.constructor.getModelClass();
        if (modelClass && !(item instanceof modelClass)) {
            item = new modelClass(item);
        }
        this.items.push(item);
        !silent && this.emit("update");
        //!noSync && this.syncDown(item);
        //sync && this.serverAdd(item);
        return this;
    }

    addAll(items, silent, updateIfExists, ...rest) {
        for (let item of items) {
            this.add(item, true, updateIfExists, ...rest);
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

Store.addMixins([ObservableMixin, SortableStoreMixin]);

export default Store;