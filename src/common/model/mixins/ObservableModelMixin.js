import ObservableMixin from "../../mixins/ObservableMixin";

class ObservableModelMixin extends ObservableMixin {

    static getEvents() {
        return {
            BEFORE_SET: 'before_set',
            AFTER_SET: 'after_set',
            BEFORE_SET_ALL: 'before_set_all',
            AFTER_SET_ALL: 'after_set_all'
        }
    }

    __hookBeforeSet(prop, val) {
        this.emit(this.constructor.getEvents().BEFORE_SET, prop, val);
        return val;
    }

    __hookAfterSet(prop, val) {
        this.emit(this.constructor.getEvents().AFTER_SET, prop, val);
        return this;
    }

    __hookBeforeSetAll(data) {
        this.emit(this.constructor.getEvents().BEFORE_SET_ALL, data);
        return data;
    }

    __hookAfterSetAll(modifiedProps, data) { //todo: maybe fire only if something modified
        modifiedProps.length && this.emit(this.constructor.getEvents().AFTER_SET_ALL, modifiedProps, data);
        return this;
    }

    __hookBeforeUnset(prop) {
        return prop;
    }

    //todo: maybe fire only if something was unset
    __hookAfterUnset(deleted, prop) {
        return this;
    }

}

export default ObservableModelMixin;