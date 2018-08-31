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
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('Response is not ok');
            }
        }).catch(err => console.log(err));
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
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('Response is not ok');
            }
        }).catch(err => console.log(err));
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
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('Response is not ok');
            }
        }).catch(err => console.log(err));
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
        }).then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                throw new Error('Response is not ok');
            }
        }).catch(err => console.log(err));
    }

    static getURL(id) {
        let url = '/' + this.getCollectionName();
        url = id ? url + '/' + id : url;
        return url;
    }
}

export default HttpAdaptor;