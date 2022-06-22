import {OneModel as Model} from "../src";

class ReactiveModel extends Model {
    static _config = {
        ...Model._config,
        reactivity: true,
        props: {
            make: null,
            model: null,
            year: null
        },
        converters: {  // converter kicks in after validator
            make: (val) => {
                return val.toUpperCase();
            },
            model: (val) => {
                return val.toUpperCase();
            }
        },
        validators: {
            make: (val) => {
                return ['toyota', 'ford'].indexOf(val.toLowerCase()) !== -1
            }
        }
    }
}

describe('test reactivity', () => {
    test('reactivity and converters', () => {
        const car = new ReactiveModel({make: 'toyota', model: 'camry'});
        expect(car.make).toBe('TOYOTA');
        car.model = 'Prius';
        expect(car.model).toBe('PRIUS');
    });
    test('reactivity and converters', () => {
        const car = new ReactiveModel({make: 'toyota', model: 'camry'});
        expect(car.make).toBe('TOYOTA');
        expect(car.model).toBe('CAMRY');
        car.make = 'ford';
        expect(car.make).toBe('FORD'); // converted kicked in and uppercased ford
    });
    test('reactivity and validators', () => {
        const car = new ReactiveModel({make: 'toyota', model: 'camry'});
        expect(car.make).toBe('TOYOTA');
        expect(car.model).toBe('CAMRY');
        car.make = 'nissan';
        expect(car.make).toBe('TOYOTA'); // validator kicked in and doesn't allow NISSAN
    });
});