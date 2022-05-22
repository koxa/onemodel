import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";
import http from 'http';
import {resolve} from "@babel/core/lib/vendor/import-meta-resolve";

class HttpAdaptor extends BaseAdaptor {
    static getHostname() {
        return '';
    }
    static getPath() {
        return 'api';
    }
    static getPort() {
        return 3000;
    }

    // static getURL(id) {
    //     let url = `${this.getHostname()}/${this.getPath()}/${this.getCollectionName()}`;
    //     url = id ? url + '/' + id : url;
    //     return url;
    // }

    static async create({hostname, path, port}, data = {}, config = {}) {
        // return fetch(url, {
        //     method: config.method || 'POST',
        //     mode: 'same-origin',
        //     cache: 'default',
        //     credentials: 'omit',
        //     headers: {
        //         "Content-Type": "application/json; charset=utf-8"
        //     },
        //     redirect: 'follow',
        //     referrer: 'client',
        //     body: JSON.stringify(data)
        // }).then(resp => {
        //     if (resp.ok) {
        //         return resp.json();
        //     } else {
        //         throw new Error('Response is not ok');
        //     }
        // }).catch(err => console.log(err));

        hostname = config.hostname || hostname;
        path = config.path || path;
        port = config.port || port;
        let method = 'POST' || config.method;

        return await new Promise((resolve, reject) => {
            const req = http.request({
                hostname,
                port,
                path,
                method,
                headers: {         //todo: extra headers support
                    "Content-Type": "application/json; charset=utf-8",
                    //'Content-Length': data.length,
                },
            }, res => {
                res.on('data', d => {
                    try {
                        const data = JSON.parse(d);
                        resolve(data);
                    } catch (err) {
                        reject('error parsing response JSON: ', err);
                    }
                });
            });

            req.on('error', error => {
                //console.log(error);
                reject(error);
            });
            req.write(JSON.stringify(data));
            req.end();
        });
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

    getHostname() {
        return this.getConfig().hostname || this.constructor.getHostname();
    }

    getPort() {
        return this.getConfig().port || this.constructor.getPort();
    }

    getPath() {
        return this.getConfig().path || this.constructor.getPath();
    }

    // getURL(id) {
    //     let url = `${this.getHostname()}/${this.getPath()}/${this.getCollectionName()}`;
    //     url = id ? url + '/' + id : url;
    //     return url;
    // }

    getAdaptorParams() {
        return {
            hostname: this.getHostname(),
            path: '/' + this.getPath() + '/' + this.getCollectionName(),
            port: this.getPort()
        }
    }
}

export default HttpAdaptor;