import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

class LocalStorageAdaptor extends BaseAdaptor {
    static create(data, params) {
        data = data instanceof this ? data : new this(data);
        const localCollection = window.localStorage.getItem(this.getKey());
        if (!localCollection) {
            window.localStorage.setItem(this.getKey(), JSON.stringify({
                [data.getId() || data.getClientId()]: data
            }));
        } else {
            window.localStorage.setItem(this.getKey(),
                JSON.stringify(
                    Object.assign(
                        JSON.parse(localCollection), {[data.getClientId()]: data}
                    )
                )
            );
        }
        return this;
    }

    static read(id, params) {
        const json = window.localStorage.getItem(this.getKey());
        if (json) {
            const obj = JSON.parse(json);
            const result = [];
            if (id) { // if id defined look up model by id immediately
                return obj[id];
            } else { // otherwise search by params
                for (let id in obj) {
                    let includeModel = true;
                    let model = obj[id];
                    for (let param in params) { // check if every param is in object
                        if (!model.hasOwnProperty(param) || model[param] !== params[param]) {
                            includeModel = false;
                            break;
                        }
                    }
                    if (includeModel) {
                        result.push(model);
                    }
                }
                return result;
            }
        }
    }

    static update(id, data, params) {
        const json = window.localStorage.getItem(this.getKey());
        if (json) {
            const obj = JSON.parse(json);
            if (obj[id]) {
                Object.assign(obj[id], data);
                window.localStorage.setItem(this.getKey(), JSON.stringify(obj));
                return true;
            }
        }
    }

    static delete(id, params) {
        const json = window.localStorage.getItem(this.getKey());
        if (json) {
            const obj = JSON.parse(json);
            if (obj[id]) {
                delete obj[id];
                window.localStorage.setItem(this.getKey(), JSON.stringify(obj));
                return true;
            }
        }
    }

    static getKey() {
        return this.getCollectionName();
    }
}

export default LocalStorageAdaptor;