const mongodb = require('mongodb');
const http = require('http');
const express = require('express');
const MongoMemoryServer =  require("mongodb-memory-server").MongoMemoryServer;
const OneModel = require('../dist/onemodel.common.dev').OneModel;


async function createServer() {

    const mongoServer = await MongoMemoryServer.create();
    const con = await mongodb.MongoClient.connect(mongoServer.getUri(), {});
    const db = con.db(mongoServer.instanceInfo.dbName);

    const app = express();
    const router = express.Router();

    OneModel.configure({
        db: db,
        mongo: mongodb,
        //collectionName: 'user'
    });

    app.post('/api/user', async (req, res) => {
        const user = new OneModel(req.data, undefined, {
            collectionName: 'user'
        });
        await user.save();
    })

    app.get('/api/user', async (req, res) => {
        const user = await OneModel.readOne('lastName', 'Money1');
        res.json(user);
    })

    app.use(express.static('testapp'));

    http.createServer(app).listen(3000, '0.0.0.0', () => {
        console.log('Listening on port 3000');
    });
}

createServer().then(()=> {
    console.log('Server Started');
});


