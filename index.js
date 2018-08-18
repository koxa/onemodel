require("babel-register");
const http = require('http');
const app = require('express')();
const {ServerModel} = require('./umodel/server');
const MongoClient = require('mongodb').MongoClient;
let DB;

app.route('/api/books').get((req, res) => {
    res.json([b1]);
});

http.createServer(app).listen(3000, "0.0.0.0");
console.log('Listening on port 3000');

class Book extends ServerModel {
    static getDriver() {
        return DB.collection(this.getCollectionName());
    }

    static getModelConfig() {
        return Object.assign(super.getModelConfig(), {
            strictProps: true
        });
    }

    static getDefaultProps() {
        return {
            title: null,
            author: 'hui-sobachiy'
        }
    }

    static getCollectionName() {
        return 'books';
    }

    constructor() {
        super(...arguments);
    }
}

MongoClient.connect('mongodb://127.0.0.1', (err, client) => {
    DB = client.db('universal-model');

    const b1 = new Book();
    const b2 = new Book({title: 'Harry Potter', author: 'Author'});
    const b3 = new Book({title: 'Star Wars', author: 'Lucas'});
    b2.save();
});





