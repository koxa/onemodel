export function applyPrototypeChainProps(
  accumulator,
  originalProto,
  excludeProps: string[] = [],
  mergeProps: string[] = [],
) {
  if (!accumulator || !originalProto) {
    return;
  }
  let prototypes = [originalProto];
  while (
    (originalProto = Object.getPrototypeOf(originalProto)) &&
    originalProto !== Object.prototype &&
    originalProto !== Function.prototype
  ) {
    if (originalProto && Object.getPrototypeOf(originalProto)) {
      // only add if next prototype exists, otherwise we reached bottom which is plain Object
      prototypes.push(originalProto);
    }
  }
  for (let proto of prototypes.reverse()) {
    //console.log("STATIC applyPrototypeChainProps", "accum:", accumulator, "donor: ", proto, "all enum keys: ", Object.keys(proto), "all own props", Object.getOwnPropertyNames(proto));
    applyProps(accumulator, proto, excludeProps, mergeProps);
  }
}

export function applyProps(accumulator, donor, excludeProps = [], mergeProps = []) {
  if (!accumulator || !donor) {
    return;
  }
  console.log('###donor', accumulator, donor, Object.getOwnPropertyNames(donor));
  //console.log("applyProps", "accum:", accumulator, "donor: ", donor, "all enum keys: ", Object.keys(donor), "all own props", Object.getOwnPropertyNames(donor));
  // Object.getOwnPropertyNames(Object.getPrototypeOf(mixin))
  for (let prop of Object.getOwnPropertyNames(donor)) {
    // get all props including non-enum es6 class methods
    if (!excludeProps.includes(prop)) {
      if (prop in accumulator) {
        // if prop already exists
        if (mergeProps.includes(prop)) {
          if (
            typeof accumulator[prop] === 'object' &&
            typeof donor.constructor[prop] === 'object'
          ) {
            // Object.assign(accumulator[prop], donor.constructor[prop]);
            if (!donor[prop]) {
              Object.defineProperty(donor, prop, {
                value: {},
                enumerable: false,
                writable: true,
              });
            }

            Object.assign(donor.constructor[prop], accumulator[prop]);
            console.log(
              '###mergeProps',
              accumulator,
              donor,
              accumulator[prop],
              donor.constructor[prop],
              donor,
            );
          } else {
            throw new Error("MergeProps prop types don't match");
          }
        } else {
          //UPDATE: Now assign all mixin methods and props as non-enum to be hidden by default
          Object.defineProperty(accumulator, prop, {
            value: donor[prop],
            enumerable: false,
            writable: true,
          });
          //accumulator[prop] = donor[prop]; // override value of existing prop
        }
      } else {
        // define prop from scratch with value
        //UPDATE: Now assign all mixin methods and props as non-enum to be hidden by default
        Object.defineProperty(accumulator, prop, {
          value: donor[prop],
          enumerable: false, //typeof donor[prop] !== 'function', // in es6 all class methods (both static and regular) are non enumerable, so we do same here
          writable: true,
        });
      }
    } else {
      //   for (let propKey of Object.getOwnPropertyNames(donor[prop])) {
      //     if (mergeProps.includes(propKey)) {
      //       if (
      //         typeof accumulator[propKey] === 'object' &&
      //         typeof donor[prop][propKey] === 'object'
      //       ) {
      //         Object.assign(donor[prop][propKey], accumulator[propKey]);
      //         console.log(
      //           '###mergeProps2',
      //           accumulator,
      //           donor,
      //           accumulator[propKey],
      //           donor[prop][propKey],
      //         );
      //       }
      //     }
      //   }
      console.log('property excluded', prop, Object.getOwnPropertyNames(donor[prop]));
    }
  }
}
