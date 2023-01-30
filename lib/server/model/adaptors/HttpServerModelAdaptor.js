import http from 'http';
import HttpModelAdaptor from "../../../common/model/adaptors/HttpModelAdaptor";

class HttpServerModelAdaptor extends HttpModelAdaptor {

    static request({hostname, path, port, method}, data = {}) {
        if (!path || !port || !method) {
            throw new Error('HttpServerModelAdaptor request: Path, Port, Method must be defined');
        }
        return new Promise((resolve, reject) => {
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
            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }
}

export default HttpServerModelAdaptor;