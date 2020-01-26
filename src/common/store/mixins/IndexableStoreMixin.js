class IndexableStoreMixin {
    static getIndexes() {
        throw new Error('GetIndexes must be implemented in child class');
    }

    // static getIndexes() {
    //     return [
    //         {field: '_id', type: Model.INDEX_PRIMARY}
    //     ]
    // }

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
}

export default IndexableStoreMixin;