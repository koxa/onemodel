import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

class HttpAdaptor extends BaseAdaptor {
    static create(data = {}, config = {}) {
        return fetch(this.getURL(), {
            method: config.method || 'POST',
            mode: 'same-origin',
            cache: 'default',
            credentials: 'omit',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: 'follow',
            referrer: 'client',
            body: JSON.stringify(data)
        });
    }

    static read(id, config = {}) {
        return fetch(this.getURL(id), {
            method: config.method || 'GET',
            mode: 'same-origin',
            cache: 'default',
            credentials: 'omit',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: 'follow',
            referrer: 'client'
        });
    }


    static update(id, data = {}, config = {}) {
        return fetch(this.getURL(id), {
            method: config.method || 'PUT',
            mode: 'same-origin',
            cache: 'default',
            credentials: 'omit',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: 'follow',
            referrer: 'client',
            body: JSON.stringify(data)
        });
    }

    static delete(id, config = {}) {
        return fetch(this.getURL(id), {
            method: config.method || 'DELETE',
            mode: 'same-origin',
            cache: 'default',
            credentials: 'omit',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: 'follow',
            referrer: 'client',
        });
    }

    static getURL(id) {
        let url = '/' + this.getCollectionName();
        url = id ? url + '/' + id : url;
        return url;
    }
}

export default HttpAdaptor;