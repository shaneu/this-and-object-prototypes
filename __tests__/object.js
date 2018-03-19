/* eslint no-underscore-dangle: 0 */
/* eslint no-prototype-builtins: 0 */
/* eslint no-restricted-syntax: 0 */
describe('objects', () => {
  // objects are one of the seven primary types in the languange along with
  // strings, numbers, booleans, null, undefined, and symbols
  // Functions are a subtype of objects, technically 'callable objects'
  // Arrays also fall under this category
  // Built in Objects (actually functions)
  // * Number
  // * Sting
  // * Boolean
  // * Object
  // * Function
  // * Array
  // * Date
  // * RegExp
  // * Error
  describe('comparing native to thier object constructors', () => {
    it('should return correct typeof value', () => {
      // when we call a method on the primitive string, number, or boolean, the JS
      // engine coerces them into an object so we never have to manually construct
      // their object form

      // Null and undefined have no object wrappers
      // Dates can only be created with thier constructor, they have no literal form
      // Objects, functions and arrays, and RegExp's are all objects regardless of whether thier literal or
      // constructed forms are used
      // Error objects can be created with or without the new keyword

      const string = 'I am a primitive string';
      expect(typeof string).toBe('string');
      expect(string).not.toBeInstanceOf(String);

      const stringObj = new String('I am a boxed string');
      expect(typeof stringObj).toBe('object');
      expect(stringObj).toBeInstanceOf(String);
    });
  });

  describe('property descriptors', () => {
    it('should allow a property to be added or modified if it is configurable', () => {
      const myObj = {};

      Object.defineProperty(myObj, 'a', {
        value: 2,
        writable: true,
        configurable: true,
        enumerable: true,
      });

      expect(myObj.a).toBe(2);
    });

    it('should not enumerate a property if enumerable is false', () => {
      const myObj = {};

      Object.defineProperty(myObj, 'b', {
        value: 'secret',
        enumerable: false,
      });

      expect(Object.keys(myObj)).toHaveLength(0);
      expect(myObj.propertyIsEnumerable('b')).toBe(false);
    });

    it('should not allow a property to be modified if writable is false', () => {
      const myObj = {};

      Object.defineProperty(myObj, 'a', {
        value: 2,
        writable: false,
      });

      myObj.a = 'fail';

      expect(myObj.a).not.toBe('fail');
      expect(myObj.a).toBe(2);
    });

    it('should not allow configuration to be changed if configurable is false', () => {
      const myObj = {};

      Object.defineProperty(myObj, 'a', {
        value: 2,
        configurable: false,
        writable: true,
      });

      expect(() =>
        Object.defineProperty(myObj, 'a', { configurable: true })
      ).toThrow();

      // even if configurable is set to false, if writable was true
      // it can be changed to false, but will throw if changed back
      // to true
      expect(() =>
        Object.defineProperty(myObj, 'a', { writable: false })
      ).not.toThrow();

      expect(() =>
        Object.defineProperty(myObj, 'a', { writable: true })
      ).toThrow();
    });
  });

  describe('immutability', () => {
    // these approaches apply only to the object's own properties, if the
    // object has a reference to another object or function, that other object
    // can be modified
    describe('when a value of an object is not writable or configurable', () => {
      it('should not allow the value to be changed', () => {
        const myObj = {};

        Object.defineProperty(myObj, 'BEST_SINGER', {
          value: 'Freddie Mercury',
          writable: false,
          configurable: false,
        });
        myObj.BEST_SINGER = 'Chris Cornell';

        expect(myObj.BEST_SINGER).toBe('Freddie Mercury');
      });
    });

    describe('prevent extensions', () => {
      describe('when .preventExtensions is called on an object', () => {
        it('should not allow properties to be added', () => {
          const myObj = {
            a: 2,
          };

          Object.preventExtensions(myObj);

          myObj.b = 'fail';

          expect(Object.keys(myObj)).toHaveLength(1);
        });
      });
    });

    describe('seal', () => {
      describe('when .seal is called on an object', () => {
        it('should set configurable to be false and disallow properties to be added', () => {
          const myObj = {
            a: 2,
          };

          Object.seal(myObj);

          myObj.b = 'fail';

          expect(Object.keys(myObj)).toHaveLength(1);
          expect(() =>
            Object.defineProperties(myObj, 'a', { configurable: true })
          ).toThrow();

          myObj.a = 'can still change values with .seal';
          expect(myObj.a).toBe('can still change values with .seal');
        });
      });
    });

    describe('freeze', () => {
      describe('when .freeze is called on an object', () => {
        it('should behave like .seal and set writable to false', () => {
          // highest level of immutability for an object, but any objects
          // referenced will still be mutable
          const myObj = {
            a: 2,
          };

          Object.freeze(myObj);

          myObj.b = 'fail';

          expect(Object.keys(myObj)).toHaveLength(1);
          expect(() =>
            Object.defineProperties(myObj, 'a', { configurable: true })
          ).toThrow();

          myObj.a = `can't change values with .freeze`;
          expect(myObj.a).toBe(2);
        });
      });
    });
  });

  describe('[[Get]] - property accesses', () => {
    // the internal [[Get]] operation to access properties on an object
    // will look for the value first on the object, and if not found begin
    // traversing the prototype chain. If the value isn't found at all though, rather
    // then throwing a ReferenceError as when accessing a variable that can't be
    // resolved in current lexical scope
    describe(`when a property isn't found on an object`, () => {
      it('should return undefined', () => {
        const myObj = { a: 2 };

        expect(myObj.b).toBeUndefined();
        expect(() => myObj.b).not.toThrow(ReferenceError);
        expect(() => someUndeclaredVariable).toThrow(ReferenceError); // eslint-disable-line
      });
    });
  });

  describe('[[Put]]', () => {
    // the internal [[Put]] operation behaves differently under different
    // circumstances. When a value is already present on the object, the [[Put]]
    // algorithm will check:
    // 1. Is the property an accessor descriptor, if so call any setter on it
    // 2. Is the property a data descriptor with writable of false? If so silently
    //    fail in non-strict mode or throw TypeError in strict mode
    // 3. Set the value to the existing property

    // If the property isn't present on the object, [[Put]]
    describe(`when a property isn't found on an object`, () => {
      it('should return undefined', () => {
        const myObj = { a: 2 };

        expect(myObj.b).toBeUndefined();
        expect(() => myObj.b).not.toThrow(ReferenceError);
        expect(() => someUndeclaredVariable).toThrow(ReferenceError); // eslint-disable-line

        expect('a' in myObj).toBe(true);
        expect('b' in myObj).toBe(false);
        expect(myObj.hasOwnProperty('a')).toBe(true);
        expect(myObj.hasOwnProperty('b')).toBe(false);
      });
    });
  });

  describe('getters and setters', () => {
    // Getters are properties that call a hidden function to retrieve a value
    // Setters are properties that call a hidden function to set a value
    // When you define a property to have a getter or setter, its definition becomes
    // an 'accessor descriptor' (as opposed to a data descriptor). For accessor descriptors
    // the value and writable characteristics of the descriptor are ignored
    describe('when a getter is describe through literal syntax or .defineProperty', () => {
      it('should return whatever the value of the function call is', () => {
        const myObj = {
          get a() {
            return 2;
          },
        };

        Object.defineProperty(myObj, 'b', {
          get() {
            return this.a * 2;
          },
          enumerable: true,
        });

        // note neither a, especially not b, have a property with
        // a value, they only have functions that return a value
        expect(myObj.a).toBe(2);
        expect(myObj.b).toBe(4);
        expect(() =>
          Object.defineProperty(myObj, 'b', { value: 9987 })
        ).toThrow(TypeError);
      });
    });

    describe('when a setter is defined', () => {
      it('should overide the default [[Put]] operation', () => {
        // it is a best practice if defining a getter or setter to then
        // define the other operation, as failing to do so could lead to
        // unexpected behavior
        const myObj = {
          get a() {
            return this._a_;
          },

          set a(val) {
            this._a_ = val * 2;
          },
        };

        // uses the set property
        myObj.a = 2;
        // uses the get property
        expect(myObj.a).toBe(4);
      });
    });
  });

  describe('enumeration', () => {
    describe('when a property is enumerable', () => {
      it('should be enumerated', () => {
        const myObj = {};

        Object.defineProperty(myObj, 'a', { enumerable: true, value: 2 });
        Object.defineProperty(myObj, 'b', { enumerable: false, value: 3 });

        // .hasOwnProperty will not consult the prototype chain
        expect(myObj.hasOwnProperty('b')).toBe(true);
        // in will consult the prototype chain
        expect('b' in myObj).toBe(true);
        // .keys finds only enumerable own properties
        expect(Object.keys(myObj)).toHaveLength(1);
        // .getOwnPropertyNames finds all own properties wether enumerable or not
        expect(Object.getOwnPropertyNames(myObj)).toHaveLength(2);
        // tests wether a given propety exists directly on the object and is enumerable
        expect(myObj.propertyIsEnumerable('b')).toBe(false);
        expect(myObj.propertyIsEnumerable('a')).toBe(true);
      });
    });
  });

  describe('iteration', () => {
    describe('for...in', () => {
      it(`should iterate over an object's list of enumerable properties including
        it's [[Prototype]] chain`, () => {
        /* eslint-disable */
        const myObj = { a: 1 };
        const myObj1 = Object.create(myObj);
        myObj1.b = 2;
        const myObj2 = Object.create(myObj1);
        myObj2.c = 3;
        const myObj3 = Object.create(myObj2);
        myObj3.d = 4;

        let numOfProperties = 0;

        for (const val in myObj3) {
          numOfProperties += 1;
        }
        expect(numOfProperties).toBe(4);
        /* eslint-enable */
      });
    });

    describe('for...of', () => {
      describe('when iterating of an array', () => {
        it('should use the arrays @@iterator property', () => {
          const arr = [1, 2, 3];
          const iterator = arr[Symbol.iterator]();

          expect(iterator.next()).toEqual({ value: 1, done: false });
          expect(iterator.next()).toEqual({ value: 2, done: false });
          expect(iterator.next()).toEqual({ value: 3, done: false });
          expect(iterator.next()).toEqual({ done: true });

          const arr2 = [4, 5, 6];
          let length = 0;

          // eslint-disable-next-line
          for (const item of arr2) {
            length += 1;
          }
          expect(length).toBe(3);
        });
      });
      describe('when iterating over an object', () => {
        describe('when a custom iterator is defined', () => {
          it('should iterate over the data the iterable object defines to be iterated over', () => {
            const myObj = {
              a: 1,
              b: 2,
              c: 3,
            };

            // This is an interesting tale of the this keyword here:
            // we're defining a property on myObj, Symbol.iterator. When we call it,
            // the implicit binding rule applies, and myObj is used as the this value inside the
            // function. The arrow function takes it's this value from that initial call and
            // closes over the value, so even when it's called as a method on iterator, it will
            // still use myObj as its this value.
            Object.defineProperty(myObj, Symbol.iterator, {
              enumerable: false,
              writable: false,
              configurable: true,
              value: function it() {
                let idx = 0;
                const keys = Object.keys(this);
                return {
                  next: () => ({
                    value: this[keys[idx++]],
                    done: idx > keys.length,
                  }),
                };
              },
            });

            const iterator = myObj[Symbol.iterator]();

            expect(iterator.next()).toEqual({ value: 1, done: false });
            expect(iterator.next()).toEqual({ value: 2, done: false });
            expect(iterator.next()).toEqual({ value: 3, done: false });
            expect(iterator.next()).toEqual({ value: undefined, done: true });

            let numberOfIterations = 0;
            for (const val of myObj) {
              numberOfIterations += 1;
            }

            expect(numberOfIterations).toBe(3);
          });
        });
      });
    });
  });
});
