/* eslint no-prototype-builtins: 0 */
describe('prototype', () => {
  // objects in JS have an internal [[Prototype]] property, which is a reference to another
  // object. Almost all objects are given a non null value for this property at the time of
  // their creation
  describe('[[Get]] operation', () => {
    describe(`when value isn't present on the object`, () => {
      it('should look up the prototype chain', () => {
        const myObj = {
          a: 2,
        };

        const anotherObject = Object.create(myObj);
        const yetAnother = Object.create(anotherObject);

        expect(yetAnother.a).toBe(2);
        expect(myObj.isPrototypeOf(yetAnother)).toBe(true); // eslint-disable-line
        expect('a' in yetAnother).toBe(true);
      });
    });
  });

  describe('Object.prototype', () => {
    it('should be at the top of all normal built in objects prototype chains', () => {
      expect(Object.prototype.isPrototypeOf(Object)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Array)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Function)).toBe(true);
      expect(Object.prototype.isPrototypeOf(String)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Number)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Boolean)).toBe(true);
      expect(Object.prototype.isPrototypeOf(RegExp)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Date)).toBe(true);
      expect(Object.prototype.isPrototypeOf(Symbol)).toBe(true);
    });
  });
});
