const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { ServerSequelizeModel } = require('../../dist/onemodel.common.dev');
const { getQueryParams } = require('../../src/utils/node/index');

async function emailSequelizeRouter() {
  const router = express.Router();

  const sequelize = new Sequelize('onemodel', 'root', 'root', {
    host: 'localhost',
    dialect: 'mariadb',
    port: 3306,
  });

  const EmailSchema = sequelize.define('email', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
  });

  class Email extends ServerSequelizeModel {}
  Email.configure({
    sequelize: Sequelize,
    db: sequelize,
    schemas: [EmailSchema],
    idAttr: 'id',
  });

  router.get('/api/email/:id', async (req, res) => {
    const { id } = req.params;
    const searchParams = getQueryParams(req);
    console.log('GET /api/email', { id, ...searchParams });
    const user = await Email.read({ id, ...searchParams });
    res.json(user);
  });

  router.get('/api/email', async (req, res) => {
    const searchParams = getQueryParams(req);
    console.log('GET /api/email', searchParams);
    const user = await Email.read(searchParams);
    res.json(user);
  });

  router.post('/api/email', async (req, res) => {
    console.log('POST /api/email', req.body);
    const user = new Email(req.body);
    res.json(await user.save());
  });

  router.put('/api/email/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('PUT /api/email', _id, req.body);
    const user = new Email({ id: _id, ...req.body });
    res.json(await user.save());
  });

  router.delete('/api/email/:_id', async (req, res) => {
    const { _id } = req.params;
    console.log('DELETE /api/email', _id);
    res.json(await Email.deleteOne(_id));
  });

  console.log('EmailSequelizeRouter Started');
  return router;
}

module.exports = emailSequelizeRouter;
