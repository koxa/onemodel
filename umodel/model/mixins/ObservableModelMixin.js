import ObservableMixin from "../../mixins/ObservableMixin";

class ObservableModelMixin extends ObservableMixin {

    constructor() {
        super(...arguments);
    }

    __hookBeforeSet(prop, val) {
        this.emit('before_set', prop, val);
        return this;
    }

    __hookAfterSet(modified, prop, val) {
        modified && this.emit('after_set', prop, val);
        return this;
    }

    __hookBeforeSetAll(data) {
        this.emit('before_set_all', data);
        return this;
    }

    __hookAfterSetAll(modifiedProps, data) {
        modifiedProps.length && this.emit('after_set_all', modifiedProps, data);
        return this;
    }

    __hookBeforeDelete() {
        return this;
    }

    __hookAfterDelete() {
        return this;
    }

}

export default ObservableModelMixin;