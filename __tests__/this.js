// This is a dynamic keyword inside a function that is bound when the function is called
// and who's value is determined by how that function was called.

describe('this keyword', () => {
  describe('when a function is called with different objects', () => {
    it(`should use that object as it's 'this' value`, () => {
      function identify() {
        return this.name.toUpperCase();
      }

      function speak() {
        const greeting = `Hello, I'm ${identify.call(this)}`;
        return greeting;
      }

      const me = {
        name: 'Shane',
      };

      const you = {
        name: 'Reader',
      };

      expect(identify.call(me)).toBe(me.name.toUpperCase());
      expect(identify.call(you)).toBe(you.name.toUpperCase());
      expect(speak.call(me)).toBe(`Hello, I'm SHANE`);
      expect(speak.call(you)).toBe(`Hello, I'm READER`);

      function foo() {
        this.count += 1;
      }

      foo.count = 0;

      for (let i = 0; i < 5; i += 1) {
        foo.call(foo);
      }
      expect(foo.count).toBe(5);
    });
  });

  describe('four rules to deterime what the value of this will be', () => {
    describe('1. default binding', () => {
      describe('when a function is called as a plain function invocation', () => {
        it(`should have undefined for it's this value in strict mode or window otherwise`, () => {
          function foo() {
            'use strict'; // eslint-disable-line
            return this;
          }
          expect(foo()).toBe(undefined);
        });
      });
    });

    describe('2. Implicit binding', () => {
      describe('when a function is called with a context object', () => {
        it(`should have the context object for it's this value`, () => {
          function foo() {
            return this.a;
          }

          const obj = {
            a: 2,
            foo,
          };
          expect(obj.foo()).toBe(2);

          const obj2 = {
            a: 42,
            foo,
          };

          const obj3 = {
            a: 2,
            obj2,
          };
          // only the top/last level of an object property reference chain
          // matters to the call-site
          expect(obj3.obj2.foo()).toBe(42);
        });
      });

      describe('when assigning a reference to a method', () => {
        it('should fall back to default binding', () => {
          function foo() {
            return this.a;
          }

          const obj = {
            a: 2,
            foo,
          };

          // we're only passing a refernce to the function object foo here,
          // the context is not being passed, so when bar is called, its
          // called as a plain function call and the default binding rule applies
          const bar = obj.foo;

          expect(foo.call(obj)).toBe(2);
          expect(bar()).toBeUndefined();

          // the same behavior occurs when passed as a call back since parameter
          // is just implicit assignment
          const doFoo = fn => fn();

          expect(doFoo(obj.foo)).toBeUndefined();
          expect(doFoo(obj.foo.bind(obj))).toBe(2);
        });
      });
    });

    describe('3. explicit binding', () => {
      describe('when calling a function with an explicit binding', () => {
        it('should have a this value of the object it was bound with', () => {
          function foo() {
            return this.a;
          }

          const obj = {
            a: 3,
          };
          expect(foo.call(obj)).toBe(3);
          expect(foo()).toBeUndefined();

          function bar(something) {
            return this.a + something;
          }

          // example of creating the .bind utility
          const bind = (fn, object) =>
            function inner() {
              return fn.apply(object, arguments);
            };
          const baz = bind(bar, obj);
          expect(baz(' is the magic number')).toBe('3 is the magic number');

          const bam = bar.bind(obj);
          expect(bam(' is the magic number, too')).toBe(
            '3 is the magic number, too'
          );
        });
      });
    });

    describe('4. new binding', () => {
      describe(`when a function is called with the new keyword,
        a brand new object is constructed,
        that object is [[Prototype]]-linked,
        that object is set as the this binding for the function call,
        unless overridden the function will automatically return that object`, () => {
        it(`should initialize the newly created object`, () => {
          function Foo(a) {
            this.a = a;
          }
          const string = 'this will be the value of a';
          const bar = new Foo(string);

          expect(bar.a).toBe(string);
        });
      });
    });
  });

  describe('when a call-site has multiple eligible rules', () => {
    describe('when implicit binding is compared to explicit binding', () => {
      it('should result in explicit binding taking precedence', () => {
        function foo() {
          return this.a;
        }

        const obj1 = {
          a: 2,
          foo,
        };

        const obj2 = {
          a: 3,
          foo,
        };

        // implicit binding
        expect(obj1.foo()).toBe(2);
        expect(obj2.foo()).toBe(3);

        // explicit binding
        expect(obj1.foo.call(obj2)).toBe(3);
        expect(obj1.foo.call(obj1)).toBe(2);
      });
    });

    describe('when new binding is compared to implicit binding', () => {
      it('should result in new binding taking precedence over implicit binding', () => {
        function foo(something) {
          this.a = something;
        }

        const obj1 = {
          foo,
        };
        const obj2 = {};

        obj1.foo(2);
        expect(obj1.a).toBe(2);

        obj1.foo.call(obj2, 3);
        expect(obj2.a).toBe(3);

        const bar = new obj1.foo(4);
        expect(obj1.a).toBe(2);
        expect(bar.a).toBe(4);
      });
    });

    describe('when hard/explicit binding is compared to new binding', () => {
      it('should result in new binding taking precedence', () => {
        function foo(something) {
          this.a = something;
        }

        const obj1 = {};

        const bar = foo.bind(obj1);
        bar(2);
        expect(obj1.a).toBe(2);

        const baz = new bar(3);
        expect(obj1.a).toBe(2);
        // ignores the previous binding of foo and results in
        // the new object being constructed as the this value
        expect(baz.a).toBe(3);
      });
    });
  });

  describe('arrow functions', () => {
    describe('when this is used inside an arrow function', () => {
      it(`should get it's value from the next outer lexical scope`, () => {
        function foo() {
          return () => this.a;
        }

        const obj1 = {
          a: 2,
        };

        const obj2 = {
          a: 3,
        };
        const bar = foo.call(obj1);
        // foo was called with obj1 one as it's this context, so the returned inner
        // arrow function is closed over foo's original a value, which was 2
        expect(bar.call(obj2)).toBe(2);
      });
    });
  });
});
