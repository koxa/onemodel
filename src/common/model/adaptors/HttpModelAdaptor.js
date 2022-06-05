import BaseAdaptor from "../../adaptors/BaseAdaptor";

class HttpModelAdaptor extends BaseAdaptor {
    static _config = {
        ...BaseAdaptor._config,
        hostname: this.getHostname(),
        prefix: this.getPrefix(),
        port: this.getPort()
    }

    static getHostname() {
        return '';
    }

    static getPrefix() {
        return 'api';
    }

    static getPort() {
        return 3000;
    }

    static async create(params, data = {}) { //todo: optimize so that params and config is one
        return await this.request({...this.getAdaptorParams(params), method: 'POST'}, data);
    }

    static async read(params) { //todo: url or id for static calls
        return await this.request({...this.getAdaptorParams(params), method: 'GET'});
    }


    static async update(params, data = {}) { //todo: url or id for static calls
        return await this.request({...this.getAdaptorParams(params), method: 'PUT'}, data);
    }

    static async delete(params) { //todo: url or id for static calls
        return await this.request({...this.getAdaptorParams(params), method: 'DELETE'});
    }

    static getAdaptorParams({id, hostname, prefix, port, collectionName, path}) {
        hostname = hostname || this.getConfig().hostname;
        port = port || this.getConfig().port;
        if (!path) {
            prefix = prefix || this.getConfig().prefix;
            collectionName = collectionName || this.getConfig().collectionName;
            path = path || (`/${prefix}/${collectionName}` + (id ? `/${id}` : ''));
        }
        return {
            id,
            hostname,
            path,
            port
        }
    }

    getAdaptorParams({id, hostname, prefix, port, collectionName, path}) {
        hostname = hostname || this.getConfig().hostname;
        port = port || this.getConfig().port;
        id = id || this.getId();
        prefix = prefix || this.getConfig().prefix;
        collectionName = collectionName || this.getConfig().collectionName;
        return {
            id,
            hostname,
            port,
            prefix,
            collectionName,
            path
        }
    }
}

export default HttpModelAdaptor;