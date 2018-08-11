import BaseAdaptor from "./BaseAdaptor";

class LocalStorageAdaptor extends BaseAdaptor {
    static create(data, params) {
        data = data instanceof this ? data : new this(data);
        const localCollection = window.localStorage.getItem(this.getKey());
        if (!localCollection) {
            window.localStorage.setItem(this.getKey(), JSON.stringify({
                [data.getClientId()]: data
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
        let obj = window.localStorage.getItem(this.getKey());
        if (obj) {
            return JSON.parse(obj)[id];
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

    static find() {

    }

    static getKey() {
        return this.getCollectionName();
    }
}

export default LocalStorageAdaptor;