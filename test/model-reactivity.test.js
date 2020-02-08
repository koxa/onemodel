import {Model} from "../src";

class ReactiveModel extends Model {
    static getModelConfig() {
        return {
            reactivity: true
        }
    }

    static getDefaultProps() {
        return {
            make: null,
            model: null,
            year: null
        }
    }

    static getConverters() {
        return {
            make: (val) => {
                return val.toUpperCase();
            },
            model: (val) => {
                return val.toUpperCase();
            }
        }
    }

    static getValidators() {
        return {
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
    test('reactivity and validators', () => {
        const car = new ReactiveModel({make: 'toyota', model: 'camry'});
        expect(car.make).toBe('TOYOTA');
        expect(car.model).toBe('CAMRY');
        car.make = 'nissan';
        expect(car.make).toBe('TOYOTA');
    });
});