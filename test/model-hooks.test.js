import {Model} from "../src";

class CarWithHooks extends Model {
    static getDefaultProps() {
        return {
            make: 'test',
            model: 'test'
        }
    }

    __hookBeforeSet(prop, val) {

    }

    __hookAfterSet(prop, val) {
        this.timesSet = this.timesSet ? this.timesSet + 1 : 1;
        if (prop === 'make' || prop === 'model') {
            this.makeModel = this.make + ' ' + this.model;
        }
    }
}

describe('test hooks', () => {
    test('model hook after set', () => {
        let car = new CarWithHooks({make: 'kia', model: 'optima'});
        expect(car.get('model')).toBe('optima');
        expect(car.make).toBe('kia');
        expect(car.get('makeModel')).toBe('kia optima');
        expect(car.timesSet).toBe(2);
        expect(car.set('make', 'kia')).toBe(false);
        expect(car.timesSet).toBe(2); // set hooks won't fire if value is same
        expect(car.set('seats', 5)).toBe(true);
        expect(car.timesSet).toBe(3);
    });
});