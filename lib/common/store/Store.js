import Base from '../Base';
import ObservableMixin from "../mixins/ObservableMixin";
import SortableStoreMixin from "./mixins/SortableStoreMixin";

class Store extends Array {

    static getModelClass() {
        return null;
    }

    static wrapItems(items) {
        const modelClass = this.getModelClass();
        if (modelClass) {
            for (let i = 0; i < items.length; i++) {
                if (typeof items[i] === 'object' && !(items[i] instanceof modelClass)) {
                    items[i] = new modelClass(items[i]);
                }
            }
        }
        return items;
    }

    constructor() {
        super(...arguments);
        this.__hookBeforeConstruct && this.__hookBeforeConstruct(...arguments);
        this.constructor.wrapItems(this);
        this.__hookAfterConstruct && this.__hookAfterConstruct();
    }

    get(id) {
        return this.find(item => item.getId() === id);
    }

    add(item, skipHooks) {
        !skipHooks && this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const items = this.constructor.wrapItems(arguments);
        const out = super.push(...items);
        !skipHooks && this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    remove(id, skipHooks) {
        !skipHooks && this.__hookBeforeChange && this.__hookBeforeChange();
        const index = this.findIndex(item => item.getId() === id);
        const out = super.splice(index, 1);
        !skipHooks && this.__hookAfterChange && this.__hookAfterChange();
        return out;
    }

    push() {
        this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const items = this.constructor.wrapItems(arguments);
        const out = super.push(...items);
        this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    pop() {
        this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const out = super.pop(...arguments);
        this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    shift() {
        this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const out = super.shift(...arguments);
        this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    unshift() {
        this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const out = super.unshift(...arguments);
        this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    splice() {
        this.__hookBeforeChange && this.__hookBeforeChange(...arguments);
        const out = super.splice(...arguments);
        this.__hookAfterChange && this.__hookAfterChange(out);
        return out;
    }

    //todo: all methods that accept items
}

// Store.addMixins([ObservableMixin, SortableStoreMixin]);

export default Store;