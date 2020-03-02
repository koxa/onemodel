import {Model} from '../src';

describe('testing model\'s observability', () => {
    var car;

    beforeEach(() => {
        car = new Model({make: 'toyota', model: 'camry'});
    });
    //
    afterEach(() => {
        car = undefined;
    });

    test('model before set', () => {
        let fn = (prop, val) => {
            expect(prop).toBe('make');
            expect(val).toBe('nissan');
        };
        car.on(Model.getEvents().BEFORE_SET, fn);
        car.set('make', 'nissan');
        car.off(Model.getEvents().BEFORE_SET, fn);
        car.set('make', 'whatever');
    });

    test('model before set with change', () => {
        car.on(Model.getEvents().BEFORE_SET, (prop, val) => {
            expect(prop).toBe('make');
            expect(val).toBe('nissan');
            car.make = 'ford'; // this is before set so value will be overriden
        });
        car.set('make', 'nissan');
        expect(car.get('make')).toBe('nissan');
    });

    test('model after set', () => {
        car.on(Model.getEvents().AFTER_SET, (prop, val) => {
            expect(prop).toBe('make');
            expect(val).toBe('nissan');
        });
        car.set('make', 'nissan');
    });

    test('model after set with change', () => {
        car.on(Model.getEvents().AFTER_SET, (prop, val) => {
            expect(prop).toBe('make');
            expect(val).toBe('nissan');
            car.make = 'whatever';
        });
        car.set('make', 'nissan');
        expect(car.make).toBe('whatever');
        car.set('make', 'nissan');
        expect(car.make).toBe('whatever');
    })
});