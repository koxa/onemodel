require("babel-register");
require("babel-polyfill");
const http = require('http');
const app = require('express')();
const {ServerModel} = require('./onemodel/server');
const MongoClient = require('mongodb').MongoClient;

async function run() {
    const client = await MongoClient.connect('mongodb://127.0.0.1', {logger: console});
    const DB = client.db('universal-model');
    console.log('Mongo connected');
    http.createServer(app).listen(3000, "0.0.0.0");
    console.log('Listening on port 3000');

    class Book extends ServerModel {
        static getDriver() {
            return DB.collection(this.getCollectionName());
        }

        static getModelConfig() {
            return Object.assign(super.getModelConfig(), {
                lockProps: true
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

    app.route('/api/books').get(async (req, res) => {
        const books = await Book.find();
        books[0].set('title', 'Garry Garry');
        books[0].save();
        res.json(books);
    });
}

run().catch(err => console.error(err));





