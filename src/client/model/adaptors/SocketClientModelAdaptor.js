import SocketModelAdaptor from '../../../common/model/adaptors/SocketModelAdaptor';

class SocketClientModelAdaptor extends SocketModelAdaptor {
  static socketClient;
  static socketBroadcastName = 'socket-broadcast';

  static async request(params, body = {}) {
    const { id, hostname, prefix, port, operation, collectionName, query } = params;
    const host = hostname || (typeof location !== 'undefined' && location.hostname);
    const portNumber = port || (typeof location !== 'undefined' && location.port);

    if (!host || !collectionName || !portNumber || !operation) {
      throw new Error(
        'SocketClientModelAdaptor request: Hostname, CollectionName, Port, Operation must be defined',
      );
    }

    const url = `ws://${host}:${portNumber}${prefix ? `/${prefix}` : ''}`;
    return await this.send(url, { operation, collectionName, id, query, body });
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      if (this.socketClient && this.socketClient.readyState === WebSocket.OPEN) {
        resolve();
      } else {
        this.socketClient = new WebSocket(url);
        this.socketClient.onopen = () => {
          console.log('WebSocket connection established!');
          resolve();
        };
        this.socketClient.onclose = () => {
          console.log('WebSocket connection closed!');
          this.socketClient = null;
          reject(new Error('WebSocket connection closed'));
        };
        this.socketClient.addEventListener('message', (event) => this.handleMessage(event));
      }
    });
  }

  static handleMessage(event) {
    if (!event.data) return;
    try {
      const { status, response } = JSON.parse(event.data);
      if (status === 'broadcast') {
        if (this.emit) {
          this.emit(this.socketBroadcastName, { detail: response });
        } else {
          document.dispatchEvent(new CustomEvent(this.socketBroadcastName, { detail: response }));
        }
      }
    } catch (error) {
      console.error('SocketClientModelAdaptor handleMessage: ' + error);
    }
  }

  static async send(url, data) {
    if (!this.socketClient || this.socketClient.readyState !== WebSocket.OPEN) {
      await this.connect(url);
    }
    return new Promise((resolve, reject) => {
      if (this.socketClient.readyState === WebSocket.OPEN) {
        const requestId = Math.random().toString(36).substring(2, 15); // generate a unique ID for the request
        const listener = (event) => {
          const data = JSON.parse(event.data);
          if (data.requestId === requestId) {
            this.socketClient.removeEventListener('message', listener);
            resolve(data.response);
          }
        };
        this.socketClient.addEventListener('message', listener);
        const request = { ...data, requestId };
        this.socketClient.send(JSON.stringify(request));
      } else {
        reject(new Error('WebSocket connection is not open: ' + url));
      }
    });
  }

  static reconnect() {}

  static close() {
    if (this.socketClient) {
      this.socketClient.removeEventListener('message', (event) => this.handleMessage(event));
      this.socketClient.close();
      this.socketClient = null;
    }
  }
}

export default SocketClientModelAdaptor;
