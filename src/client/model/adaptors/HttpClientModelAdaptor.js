import HttpModelAdaptor from '../../../common/model/adaptors/HttpModelAdaptor';

class HttpClientModelAdaptor extends HttpModelAdaptor {
  static async request({ hostname, path, port, method, protocol }, data = {}) {
    hostname = hostname || (typeof location !== 'undefined' && location.hostname);
    port = port || (typeof location !== 'undefined' && location.port);
    if (!hostname || !path || !port || !method) {
      throw new Error(
        'HttpClientModelAdaptor request: Hostname, Path, Port, Method must be defined',
      );
    }
    protocol = protocol || (typeof location !== 'undefined' && location.protocol) || '';
    const url = `${protocol}//${hostname}:${port}${path}`;
    try {
      const response = await fetch(url, {
        method,
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          //todo: extra headers support
          'Content-Type': 'application/json;charset=utf-8',
          //'Content-Length': data.length,
        },
        body: method === 'GET' ? undefined : JSON.stringify(data),
      });
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HttpClientModelAdaptor: Response is not ok ${url}`);
      }
    } catch (err) {
      throw new Error('HttpClientModelAdaptor: Exception during request' + err);
    }
  }
}

export default HttpClientModelAdaptor;
