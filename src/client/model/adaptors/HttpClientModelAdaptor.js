import BaseAdaptor from "../../../common/adaptors/BaseAdaptor";

class HttpClientModelAdaptor extends BaseAdaptor {
    static async request({hostname, path, port, method}, data = {}) {
        if (!hostname || !path || !port || !method) {
            throw new Error('HttpServerModelAdaptor request: Hostname, Path, Port, Method must be defined');
        }
        const url = `${hostname}:${port}${path}`;
        try {
            const res = await fetch(url, {
                method,
                headers: {         //todo: extra headers support
                    "Content-Type": "application/json; charset=utf-8",
                    //'Content-Length': data.length,
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('HttpClientModelAdaptor: Response is not ok');
            }
        } catch (err) {
            throw new Error('HttpClientModelAdaptor: Exception during request' + err);
        }
    }
}

export default HttpClientModelAdaptor;