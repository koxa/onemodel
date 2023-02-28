const express = require('express');
const mariadb = require('mariadb');
const { getQueryParams } = require('../../src/utils/node/index');
const db = mariadb.createPool({
  host: 'localhost',
  database: 'onemodel',
  user: 'root',
  password: 'root',
  port: 3306,
});

const { ServerMariaDbModel } = require('../../dist/onemodel.common.dev');

async function bookMariaDbRouter() {
  const router = express.Router();

  class Book extends ServerMariaDbModel {}
  Book.configure({
    db,
    idAttr: 'id',
    props: {
      title: { type: 'String', value: '' },
      comment: 'default comment',
    },
  });

  router.get('/api/book/:id', async (req, res) => {
    const { id } = req.params;
    const searchParams = getQueryParams(req);
    console.log('GET /api/book', { id, ...searchParams });
    const book = await Book.read({ id, ...searchParams });
    res.json(book);
  });

  router.get('/api/book', async (req, res) => {
    const searchParams = getQueryParams(req);
    console.log('GET /api/book', searchParams);
    const book = await Book.read(searchParams);
    res.json(book);
  });

  router.post('/api/book', async (req, res) => {
    console.log('POST /api/book', req.body);
    const book = new Book(req.body);
    res.json(await book.save());
  });

  router.put('/api/book/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/book', _id, req.body);
    const book = new Book({ id: _id, ...req.body });
    res.json(await book.save());
  });

  router.delete('/api/book/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/book', _id);
    res.json(await Book.deleteOne(_id));
  });

  console.log('BookMariaDbRouter Started');
  return router;
}

module.exports = bookMariaDbRouter;
