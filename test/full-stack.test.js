import express from 'express';
import fetch from 'node-fetch';
import Model from '../src/client/model/ClientModel';
global.fetch = fetch;
const { getQueryParams } = require('../src/utils/node/index');

const app = express();
const port = 9333;
const name = Model.name;
const queryId = 10;

/** POST **/
app.post(`/api/${name}`, (req, res) => {
  //save onemodel
  res.status(200).json({ name: 'john' });
});

app.post('/api/user', (req, res) => {
  //save user
  res.status(200).json({ name: 'michael' });
});

/** GET **/
app.get(`/api/${name}/1`, (req, res) => {
  //read user by ID 1
  const { filter } = getQueryParams(req);
  if (filter && filter.name) {
    // for filter test
    res.status(200).json({ name: filter.name.toUpperCase() });
  } else {
    // for read tests
    res.status(200).json({ name: 'ethan' });
  }
});

app.get(`/api/${name}`, (req, res) => {
  // find user by name using filter (querystring)
  const { filter } = getQueryParams(req);
  if (filter && filter.name) {
    res.status(200).json({ name: filter.name });
  }
});

app.get(`/api/${name}/${queryId}`, (req, res) => {
  const queryParams = getQueryParams(req);
  res.status(200).json(queryParams);
});

describe('test block', () => {
  let server = null;

  beforeAll(async () => {
    Model.configure({
      idAttr: '_id',
      port,
    });

    server = await app.listen(port, () => {});
  });

  afterAll(async () => {
    await server.close();
  });

  /*** GET TESTS ***/
  test('should read Model by id', async () => {
    const user = await Model.read({ id: 1, port });
    expect(user.name).toBe('ethan');
  });

  test('should read preconfigured Model by id', async () => {
    const user = await Model.read({ id: 1 });
    expect(user.name).toBe('ethan');
  });

  test('should filter Model', async () => {
    const user = await Model.read('name', 'aaron'); // key-val format
    expect(user.name).toBe('aaron');
    const user2 = await Model.read({ filter: { name: 'aaron' } }); // params object filter prop
    expect(user2.name).toBe('aaron');
    const user3 = await Model.read(1, { filter: { name: 'aaron' } }); // id and params with filter
    expect(user3.name).toBe('AARON');
    const user4 = await Model.read('name', 'aaron', { id: 1 }); // id and params with filter
    expect(user4.name).toBe('AARON');
  });

  /*** POST TESTS ***/
  test('should save model via http adaptor, port configured on model instance', async () => {
    const user = new Model({ name: 'John' }, {}, { port });
    expect(user.name).toBe('John');
    await user.save();
    expect(user.name).toBe('john');
  });

  test('should save model via http adaptor, port configured on save', async () => {
    const user = new Model({ name: 'John' });
    expect(user.name).toBe('John');
    await user.save({ port });
    expect(user.name).toBe('john');
  });

  test('should save User model via http adaptor', async () => {
    class User extends Model {}
    const user = new User({ name: 'John' });
    expect(user.name).toBe('John');
    await user.save({ port });
    expect(user.name).toBe('michael');
  });

  test('should save User model via http adaptor with converter', async () => {
    class User extends Model {
      static _config = {
        ...Model._config,
        converters: {
          // converter kicks in after validator
          name: (val) => {
            return val.toUpperCase();
          },
        },
      };
    }
    const user = new User({ name: 'John' });
    expect(user.name).toBe('JOHN');
    const resp = await user.save({ port });
    expect(user.name).toBe('MICHAEL');
  });

  test('should check URL query params', async () => {
    const queryTestEmpty = {};

    const queryTestFull = {
      limit: 5,
      sort: { name: 1, comment: -1, testField: 0 },
      columns: { fields: 1, fields2: 0 },
      filter: {
        field1: { $lt: 5 },
        field2: { $ne: 5 },
        field3: 'field3',
        field4: { $eq: 'test1' },
        name: { $regex: 'test2' },
        name2: 'name2',
        comment: 'test',
        comment2: 333,
        user: { $in: ['last', 'first', 'next'] },
        $and: [
          { field1: 'value1' },
          { field2: 'value2' },
          { field7: { $in: ['value7', 'value77'] } },
        ],
        $or: [
          { field3: 'value3' },
          { field4: 'value4' },
          { field5: { $in: ['value4', 'value5'] } },
        ],
        field5: { $not: { $eq: 'value5' } },
      },
      skip: 10,
    };

    const queryTestFullWithId = {
      ...queryTestFull,
      id: queryId,
    };

    const queryTestLimit = {
      limit: 5,
    };

    const queryTestSort = {
      sort: { ...queryTestFull.sort },
    };

    const queryTestFilterAnd = {
      filter: { ...queryTestFull.filter.$and },
    };

    const queryTestFilterOr = {
      filter: { ...queryTestFull.filter.$or },
    };

    const queryTestColumns = {
      columns: { ...queryTestFull.columns },
    };

    const queryTestFilter = {
      filter: {
        name: { $regex: 'test2' },
        name2: 'name2',
        user: { $in: ['last', 'first', 'next'] },
      },
    };

    const queryTestSkip = {
      skip: 10,
    };

    const queryTestPagination = {
      limit: 20,
      skip: 40,
    };

    const queryTestPaginationAndSort = {
      sort: { ...queryTestFull.sort },
      limit: 20,
      skip: 40,
    };

    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestEmpty)))).toStrictEqual(
      queryTestEmpty,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestFull)))).toStrictEqual(
      queryTestFull,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryTestFullWithId)))).toStrictEqual(
      queryTestFull,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestLimit)))).toStrictEqual(
      queryTestLimit,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestSort)))).toStrictEqual(
      queryTestSort,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestColumns)))).toStrictEqual(
      queryTestColumns,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestFilter)))).toStrictEqual(
      queryTestFilter,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestSkip)))).toStrictEqual(
      queryTestSkip,
    );
    expect(
      JSON.parse(JSON.stringify(await Model.read(queryId, queryTestPagination))),
    ).toStrictEqual(queryTestPagination);
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestFilterAnd)))).toStrictEqual(
      queryTestFilterAnd,
    );
    expect(JSON.parse(JSON.stringify(await Model.read(queryId, queryTestFilterOr)))).toStrictEqual(
      queryTestFilterOr,
    );
    expect(
      JSON.parse(JSON.stringify(await Model.read(queryId, queryTestPaginationAndSort))),
    ).toStrictEqual(queryTestPaginationAndSort);
  });
});
