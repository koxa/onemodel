const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { getQueryParams } = require('../../src/utils/node/index');
const { ServerSQLiteModel } = require('../../dist/onemodel.common.dev');

async function CommentSQLiteRouter() {
  const router = express.Router();
  const db = new sqlite3.Database(':memory:');

  class Comment extends ServerSQLiteModel {}
  Comment.configure({
    db,
    idAttr: 'id',
    props: {
      title1: { type: 'String', value: '' },
      comment_text: 'default text',
    },
  });

  router.get('/api/comment/:id', async (req, res) => {
    const { id } = req.params;
    const searchParams = getQueryParams(req);
    console.log('GET /api/comment', { id, ...searchParams });
    const comment = await Comment.read({ id, ...searchParams });
    res.json(comment);
  });

  router.get('/api/comment', async (req, res) => {
    const searchParams = getQueryParams(req);
    console.log('GET /api/comment', searchParams);
    const comment = await Comment.read(searchParams);
    res.json(comment);
  });

  router.post('/api/comment', async (req, res) => {
    console.log('POST /api/comment', req.body);
    const comment = new Comment(req.body);
    res.json(await comment.save());
  });

  router.put('/api/comment/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/comment', _id, req.body);
    const comment = new Comment({ id: _id, ...req.body });
    res.json(await comment.save());
  });

  router.delete('/api/comment/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/comment', _id);
    res.json(await Comment.deleteOne(_id));
  });

  console.log('CommentSQLiteRouter Started');
  return router;
}

module.exports = CommentSQLiteRouter;
