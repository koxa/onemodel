import {Model} from '../src';

class Car extends Model {
    static getDefaultProps() {
        return {
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
    static getDefaultProps() {
        return {
            ...super.getDefaultProps(),
            type: 'sedan'
        }
    }
}

class SealedCar extends Model {
    static getModelConfig() {
        return {
            seal: true
        }
    }

    static getDefaultProps() {
        return {
            year: 2012
        }
    }
}

class FrozenCar extends Model {
    static getModelConfig() {
        return {
            freeze: true
        }
    }

    static getDefaultProps() {
        return {
            year: 2012
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
        expect(car2.constructor.getDefaultProps()).toEqual({
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

describe('testing model config', () => {
    test('model sealed', () => {
        let car = new SealedCar({make: 'tesla', model: 'model s'});
        expect(car.set('model', 'cybertruck')).toBe(true);
        expect(car.get('model')).toBe('cybertruck');
        expect(car.set('new_prop', 'test')).toBe(false);
        expect(car.get('new_prop')).toBeUndefined();
        expect(car.set('year', 2020)).toBe(true);
        expect(car.get('year')).toBe(2020);
        expect(Object.isSealed(car)).toBe(true);
    })

    test('model frozen', () => {
        let car = new FrozenCar({make: 'bmw', model: 'x5'});
        expect(car.get('model')).toBe('x5');
        expect(car.set('model', 'x6')).toBe(false);
        expect(car.get('model')).toBe('x5');
        expect(car.set('year', 2018)).toBe(false);
        expect(car.get('year')).toBe(2012);
        expect(car.set('new_prop', 'test')).toBe(false);
        expect(car.get('new_prop')).toBeUndefined();
    })
});

