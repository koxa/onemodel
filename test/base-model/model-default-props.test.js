import BaseModel from "../../src/common/model/BaseModel.js";

describe('testing model default props', () => {
  let Car, SedanCar;
  let car1, car2;

  beforeAll(() => {
    class CarTemp extends BaseModel {
      static config = {
        ...super.config,
        props: {
          type: 'car',
          make: '',
          model: '',
          trim: '',
          year: 1900,
          transmission: undefined,
          seats: 5,
          odometer: 0,
        },
      };
    }

    class SedanCarTemp extends CarTemp {
      static config = {
        ...super._config,
        props: {
          ...super.config.props,
          type: 'sedan',
        }
      };
    }

    Car = CarTemp;
    SedanCar = SedanCarTemp;
  });

  beforeEach(() => {
    car1 = new Car({ make: 'toyota', model: 'camry' });
    car2 = new SedanCar({ make: 'nissan', model: 'altima', year: 2020 });
  });

  afterEach(() => {
    car1 = undefined;
    car2 = undefined;
  });

  test('model check props', () => {
    expect(car2.getConfig('props')).toEqual({
      make: '',
      model: '',
      trim: '',
      year: 1900,
      transmission: undefined,
      type: 'sedan',
      seats: 5,
      odometer: 0,
    });
  })

  test('model get', () => {
    expect(car1.get('year')).toBe(1900);
    expect(car1.get('make')).toBe('toyota');
    expect(car1.get('trim')).toBe('');
    expect(car2.get('year')).toBe(2020);
    expect(car2.get('type')).toBe('sedan');
    expect(car2.get('seats')).toBe(5);
    expect(car2.get('make')).toBe('nissan');
  });
});
