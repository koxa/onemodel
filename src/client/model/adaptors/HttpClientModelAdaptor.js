import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

class HttpAdaptor extends BaseAdaptor {
    static create(url, data = {}, config = {}) { //todo: url must be optional (for static calls)
        return fetch(url, {
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

    static read(url, config = {}) { //todo: url or id for static calls
        return fetch(url, {
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


    static update(url, data = {}, config = {}) { //todo: url or id for static calls
        return fetch(url, {
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

    static delete(url, config = {}) { //todo: url or id for static calls
        return fetch(url, {
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
}

export default HttpAdaptor;