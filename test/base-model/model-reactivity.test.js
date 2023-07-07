import OneModel from '../../src/index.js';

describe('test reactivity', () => {
  let Model;
  let ReactiveModel;

  beforeAll(() => {
    class ReactiveModelTemp extends OneModel {
      static config = {
        ...super.config,
        reactivity: true,
        props: {
          make: null,
          model: null,
          year: null,
        }
      };

      __hookBeforeSet(prop, val) {
        // WARNING! modifying same prop while reactivity enabled will create infinite loop
        return val.toUpperCase();
      }
    }

    ReactiveModel = ReactiveModelTemp;
  });

  test('reactivity and hook beforeSet', () => {
    const car = new ReactiveModel({ make: 'toyota', model: 'camry' });
    expect(car.make).toBe('TOYOTA');
    car.model = 'Prius';
    expect(car.model).toBe('PRIUS');
  });
  // test('reactivity and converters', () => {
  //   const car = new ReactiveModel({ make: 'toyota', model: 'camry' });
  //   expect(car.make).toBe('TOYOTA');
  //   expect(car.model).toBe('CAMRY');
  //   car.make = 'ford';
  //   expect(car.make).toBe('FORD'); // converted kicked in and uppercased ford
  // });
  // test('reactivity and validators', () => {
  //   const car = new ReactiveModel({ make: 'toyota', model: 'camry' });
  //   expect(car.make).toBe('TOYOTA');
  //   expect(car.model).toBe('CAMRY');
  //   car.make = 'nissan';
  //   expect(car.make).toBe('TOYOTA'); // validator kicked in and doesn't allow NISSAN
  // });
});
