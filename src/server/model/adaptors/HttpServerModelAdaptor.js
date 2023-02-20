import http from 'http';
import HttpModelAdaptor from '../../../common/model/adaptors/HttpModelAdaptor';

class HttpServerModelAdaptor extends HttpModelAdaptor {
  static request({ hostname, path, port, method, headers }, data) {
    if (!path || !port || !method || !hostname) {
      throw new Error(
        'HttpServerModelAdaptor request: Hostname, Path, Port, Method must be defined',
      );
    }

    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
    };

    const requestData = data ? JSON.stringify(data) : undefined;

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const data = responseData ? JSON.parse(responseData) : responseData;
            resolve(data);
          } catch (err) {
            reject('error parsing response JSON: ', err);
          }
          req.end();
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (requestData) {
        req.write(requestData);
      }

      req.end();
    });
  }
}

export default HttpServerModelAdaptor;
