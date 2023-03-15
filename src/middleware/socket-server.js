import http from 'http';
import { server as WebSocketServer } from 'websocket';
import ObservableModel from '../common/model/ObservableModel';
import JsonServerModelAdaptor from '../server/model/adaptors/JsonServerModelAdaptor';

class OneModel extends ObservableModel {}
OneModel.addMixins([JsonServerModelAdaptor]);

class OneModelSocketServer {
  constructor({ server = http.createServer(), port = 3001, models = [OneModel], props } = {}) {
    this.models = new Map(
      models.map((model) => {
        if (props) {
          model.configure({ ...props });
        }
        return [model.getConfig('collectionName'), model];
      }),
    );
    this.server = server;
    this.wsserver = null;
    this.port = port;
    this.clients = new Set();
    this.sockets = {};
    this.nextSocketId = 0;
    this.server.on('connection', (socket) => {
      const socketId = this.nextSocketId++;
      this.sockets[socketId] = socket;
      socket.on('close', () => {
        delete this.sockets[socketId];
      });
    });
    this.buildWebSocketServer();
  }

  buildWebSocketServer() {
    this.wsserver = new WebSocketServer({
      httpServer: this.server,
      autoAcceptConnections: false,
    });
    console.log('WebSocket server started');
    this.wsserver.on('request', (request) => this.handleRequest(request));
  }

  handleRequest(request) {
    const connection = request.accept(null, request.origin);
    this.clients.add(connection);
    console.log(`Client connected. Total clients: ${this.clients.size}`);
    connection.on('message', async (message) => {
      console.log(`Received message: ${message.utf8Data}`);
      try {
        const data = JSON.parse(message.utf8Data);
        this.handleMessage({ connection, ...data });
      } catch (error) {
        console.error(`OneModelSocketServer: error parsing message from client ${error.message}`);
      }
    });
    connection.on('close', () => {
      this.clients.delete(connection);
      console.log(`Client disconnected. Total clients: ${this.clients.size}`);
    });
  }

  async handleMessage({ requestId, connection, operation, collectionName, id, query, body }) {
    try {
      const model = this.getModel(collectionName);
      if (!model) {
        return;
      }

      const operations = {
        read: this.readModel,
        create: this.createModel,
        update: this.updateModel,
        deleteOne: this.deleteOneModel,
      };

      if (!operations[operation]) {
        throw new Error(`Operation ${operation} not allowed`);
      }

      const result = await operations[operation].call(this, {
        connection,
        requestId,
        operation,
        collectionName,
        model,
        id,
        query,
        body,
      });

      if (operation !== 'read') {
        this.broadcast({ requestId, operation, collectionName, id, result });
      }
    } catch (error) {
      this.sendToClient({
        connection,
        requestId,
        response: error.toString(),
        status: 500,
      });
    }
  }

  async readModel({ connection, model, requestId, id, query }) {
    const result =
      id === 'count' ? await model.count() : await model.read(id ? { id, ...query } : query);
    this.sendToClient({
      connection,
      requestId,
      response: result,
    });
  }

  async createModel({ connection, model, collectionName, operation, requestId, body }) {
    const result = await model.create(body);
    this.sendToClient({
      connection,
      requestId,
      response: result,
    });
    this.broadcast({
      requestId,
      operation,
      collectionName,
      result,
    });
  }

  async updateModel({ connection, model, collectionName, operation, requestId, id, query, body }) {
    const result = await model.update(body, id ? { id, ...query } : query);
    this.sendToClient({
      connection,
      requestId,
      response: result,
    });
    this.broadcast({ requestId, operation, collectionName, id, result });
  }

  async deleteOneModel({ connection, model, collectionName, operation, requestId, id }) {
    const result = await model.deleteOne(id);
    this.sendToClient({
      connection,
      requestId,
      response: result,
    });
    this.broadcast({ requestId, operation, collectionName, id, result });
  }

  getModel(collectionName) {
    if (!collectionName) {
      return undefined;
    }
    const model = this.models.get(collectionName.toLowerCase());
    if (!model) {
      throw new Error(`Model not found for collectionName '${collectionName}'`);
    }
    return model;
  }

  sendToClient({ connection, requestId, response, status = 200 }) {
    if (connection.connected) {
      return connection.sendUTF(JSON.stringify({ status, requestId, response }));
    } else {
      console.error(`Client ${connection.remoteAddress} is not connected`);
    }
  }

  broadcast({ requestId, operation, collectionName, id, result }) {
    this.clients.forEach((client) => {
      if (client.connected) {
        return client.sendUTF(
          JSON.stringify({
            status: 'broadcast',
            requestId,
            response: { operation, collectionName, id, result },
          }),
        );
      }
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      const listener = this.server.listen(this.port, '0.0.0.0', (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`WebSocket server started on port ${listener.address().port}`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      Object.values(this.sockets).forEach((socket) => {
        socket.destroy();
      });
      this.server.close((error) => {
        if (error) {
          console.error('Server error: ', error);
          reject(error);
          return;
        }
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

export default OneModelSocketServer;
