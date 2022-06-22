import {OneModel as Model} from '../src';

class Car extends Model {
    static _config = {
        ...super._config,
        props: {
            type: 'car',
            make: '',
            model: '',
            year: 1900,
            transmission: undefined,
            seats: 5,
            odometer: 0
        }
    }
}

class SedanCar extends Car {
    static _config = {
        ...super._config,
        props: {
            ...super._config.props,
            type: 'sedan'
        }
    }
}

describe('testing model default props', () => {
    let car1, car2;

    beforeEach(() => {
        car1 = new Car({make: 'toyota', model: 'camry'});
        car2 = new SedanCar({make: 'nissan', model: 'altima', year: 2020});
    });

    afterEach(() => {
        car1 = undefined;
        car2 = undefined;
    });

    test('model get', () => {
        expect(car1.get('year')).toBe(1900);
        expect(car1.get('make')).toBe('toyota');
        expect(car2.get('year')).toBe(2020);
        expect(car2.constructor.getConfig().props).toEqual({
            make: '',
            model: '',
            year: 1900,
            transmission: undefined,
            type: 'sedan',
            seats: 5,
            odometer: 0
        });
        expect(car2.get('type')).toBe('sedan');
        expect(car2.get('seats')).toBe(5);
        expect(car2.get('make')).toBe('nissan');
    });
});

