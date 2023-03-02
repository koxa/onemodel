import http from 'http';

/**
 * The Default OneModel HTTP Server
 * Will support basic CRUD Operations
 * Using default Adaptor
 */
class OneModelServer {
  constructor(port = 3000) {
    this.port = port;
    this.sockets = {};
    this.nextSocketId = 0;
    this.server = http.createServer((req, res) => {

    });
    this.server.on('connection', function (socket) {
      let socketId = this.nextSocketId++;
      this.sockets[socketId] = socket;
      socket.on('close', () => delete this.sockets[socketId]);
      socket.setTimeout(1000);
    });
  }

  /**
   * HTTP server middleware handler
   * By Default supports basic OneModel CRUD operations
   * @param req
   * @param res
   */
  handleReqRes(req, res) {

  }

  async start() {
    await this.server.listen(this.port);
  }
}

export default OneModelServer;