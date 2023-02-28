describe('testing store basics', () => {
  let MyModel;
  let MyStore;
  let Model;
  let Store;

  beforeAll(() => {
    Object.defineProperty(process, 'env', {
      get() {
        return { WEBPACK_TARGET: 'node' };
      },
    });

    Model = require('../src').ServerModel;
    Store = require('../src').OneStore;

    class MyModelTemp extends Model {
      static _config = {
        props: {
          make: 'toyota',
          model: 'camry',
        },
      };
    }

    class MyStoreTemp extends Store {
      static getModelClass() {
        return MyModel;
      }
    }

    MyModel = MyModelTemp;
    MyStore = MyStoreTemp;
  });

  test('store constructor', () => {
    const s = new Store(1, 2, 3, 4, 5);
    expect(s[0]).toBe(1);
    s.push(6);
    expect(s[5]).toBe(6);
  });
  test('store constructor with objects', () => {
    const s = new MyStore({}, {});
    expect(s[0].make).toBe('toyota');
    expect(s[1].make).toBe('toyota');
  });
  test('store with model constructor', () => {
    const s = new MyStore();
    s.push({}, {});
    expect(s[0].make).toBe('toyota');
  });
});
