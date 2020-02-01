import {Model} from '../src';

describe('testing model basics', () => {
    let car;

    beforeEach(() => {
        car = new Model({make: 'toyota', model: 'camry'});
    });

    afterEach(() => {
        car = undefined;
    });

    test('model get', () => {
        expect(car.get('make')).toEqual('toyota');
        expect(car.get('model')).toEqual('camry');
    });

    test('model getAll', () => {
        expect(car.getAll()).toEqual({make: 'toyota', model: 'camry'});
        // exclude specific props
        // todo: support 'exclude' and 'include'
        expect(car.getAll('make')).toEqual({model: 'camry'});
        expect(car.getAll('make', 'model')).toEqual({});
    });

    test('model set', () => {
        expect(car.set('year', 2020)).toBe(true);
        expect(car.get('year')).toBe(2020);
        expect(car.set('year', 2020)).toBe(false); // returns false if not modified
        expect(car.set('new_prop', undefined)).toBe(true); // true when new prop added
        expect(car.get('new_prop')).toBe(undefined);
    });

    test('model setAll', () => {
        // return only props that were modified
        expect(car.setAll({})).toEqual({});
        expect(car.setAll({make: 'toyota', 'year': 2020})).toEqual({'year': 2020})
        expect(car.get('year')).toBe(2020);
    });

    test('model unset', () => {
        expect(car.unset('make')).toBe(true);
        expect(car.get('make')).toBeUndefined();
        expect(car.get('model')).toBe('camry');
    });

    test('model clientId', () => {
        //todo: rename client id to internalId. maybe make method underscored
        expect(car.getClientId()).not.toBeUndefined();
        expect(car.getClientId()).not.toBeNull();
        expect(car.getClientId()).toBeGreaterThan(0);
        expect(new Model().getClientId()).not.toEqual(car.getClientId());
        expect(new Model().getClientId()).toBeGreaterThan(car.getClientId());
    })
});