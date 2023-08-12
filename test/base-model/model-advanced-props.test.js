import BaseModel from "../../src/common/model/BaseModel.js";
import ValidatableModelMixin from "../../src/common/model/mixins/ValidatableModelMixin.js";

class OneModel extends BaseModel {
}

OneModel.addMixins([ValidatableModelMixin]);

describe("testing model advanced props", () => {
  let car;

  class MyCar extends OneModel {
    static config = {
      ...super.config,
      props: {
        make: { type: String, options: ["Toyota, BMW, Ford, Nissan"] },
        model: { type: String },
        year: { type: Number, value: 2023, min: 1950, max: 2023 }, //todo check value to be within range
        trim: "",
        features: { options: ["alloy-wheels", "tint-windows", "massaging-seats", "satellite-radio"], multiple: true }
      }
    };
  }

  beforeEach(() => {
    car = new MyCar();
  });

  test("default values", () => {
    expect(car.make).toBe(undefined);
    expect(car.model).toBe(undefined);
    expect(car.year).toBe(2023);
    expect(car.trim).toBe("");
    expect(car.features).toBe(undefined);
  });

  test("set correct values", () => {
    car.make = "BMW";
    car.model = "520";
    car.year = 1990;
    car.features = ["tint-windows", "alloy-wheels"];
    expect(car.make).toBe("BMW");
    expect(car.model).toBe("520");
    expect(car.year).toBe(1990);
    expect(car.features).toContain("tint-windows");
    expect(car.features).toContain("alloy-wheels");
  });

  test("validate types via validate method: NOT VALID", () => {
    let { valid, info } = car.validate("model", 520); // car model must be string
    expect(valid).toEqual(false);
    expect(info).toBeTruthy();
  });

  test("validate types via validate method: VALID", () => {
    let { valid, info } = car.validate("model", "520"); // car model must be string
    expect(valid).toEqual(true);
    expect(info).toBeFalsy();
  });

  test("validate types via reactivity with throw", () => {
    try {
      car.model = 520;
    } catch ({ method, mixin, doSet, prop, val, info }) {
      expect(method).toEqual('__hookBeforeSet');
      expect(mixin).toEqual('ValidatableMixin');
      expect(doSet).toEqual(false);
      expect(prop).toBe('model');
      expect(val).toBe(520);
      expect(info).toBeTruthy();
    }
    expect(car.model).toBeUndefined();
  });

});
