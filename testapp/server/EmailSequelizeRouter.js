const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { ServerSequelizeModel } = require('../../dist/onemodel.common.dev');

async function emailSequelizeRouter() {
  const router = express.Router();

  const sequelize = new Sequelize('onemodel', 'root', 'root', {
    host: 'localhost',
    dialect: 'mariadb',
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

  ServerSequelizeModel.configure({
    sequelize: {
      instance: sequelize,
      schemas: [EmailSchema],
      idAttr: 'id',
    },
  });

  class Email extends ServerSequelizeModel {}

  router.get('/api/email', async (req, res) => {
    console.log('GET /api/email');
    const user = await Email.read();
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
