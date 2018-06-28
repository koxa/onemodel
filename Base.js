class Base {

    static getMixins() {
        return [];
    }

    constructor() {
        const mixins = this.constructor.getMixins();
        mixins.forEach(mixin => {
            Object.assign(this.constructor, mixin.constructor); // assign Static methods
            Object.assign(this, mixin); // assign instance methods
            mixin.constructor && mixin.constructor.apply(this, arguments);
        });
    }
}

export default Base;