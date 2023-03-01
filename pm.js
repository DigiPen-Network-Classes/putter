// PM is an object used in the postman scripts, we're faking it here juussstt enough
// to get by with only the functionality needed for these scripts.

export class PM {
    constructor() {
        this.environment = new Map();
        this.collectionVariables = this.environment; // postman has two distinct things here but we only really want to use one
        this.response = new Response();
        this.testCounter = 0;
    }

    test(testName, testFunc) {
        let pm = this;
        testFunc();
        this.testCounter++;
    }
    
    expect(obj) {
        return new Expectation(obj);
    }
}

// part of the pm objects used to evaluate responses and run tests
class Response {
    
    get to() { return this; }
    get have() { return this; }

    json() { return this.jsonData; }

    status(expectedStatusValue) {
        if (expectedStatusValue !== this.actualStatusValue) {
            throw new Error(`expected status value of ${expectedStatusValue} but found ${this.actualStatusValue} instead`);
        }
    }
}

// a very (very) slim set of Expectations; ideally this should use expect or jest or
// some sort of actual library, but for now this is what I have time for.
class Expectation {
    constructor(actual) {
        this.actual = actual;
        this.isNegative = false;
    }
    
    // helper that prints "not", or doesn't, depending. crude hack.
    printNot() {
        return this.isNegative ? " not" : "";
    }

    get to() { return this; }
    get have() { return this; }
    get be() { return this; }

    
    get not() {
        this.isNegative = !this.isNegative;
        return this;
    }

    // is actual empty or not?
    get empty() {
        let success = this.considerNegative({} === this.actual) || this.isEmptyIterable();
        if (!success) {
            throw new Error(`expected to be${this.isNegative ? " not" : ""} empty, but wasn't`);
        }
    }
    
    // are these equal...ish?
    equal(expected) {
        let success = this.considerNegative(this.actual == expected);
        if (!success) {
            throw new Error(`expected${this.pritnNot} to be equal, ${this.actual} vs. ${expected}`);
        }
    }
    
    // occasionally used
    eql(expected) {
        return this.equal(expected);
    }
    
    property(propertyName) {
        if (this.actual === null || this.actual === undefined) {
            if (!this.isNegative) {
                throw new Error(`expected to${this.isNegative ? " not" : ""} have property ${propertyName}`)
            }
        } else {
            let success = this.considerNegative(this.actual.hasOwnProperty(propertyName));
            if (!success) {
                throw new Error(`expected to${this.isNegative ? " not" : ""} have property ${propertyName}`)
            }
        }
    }
    



    //-------- helpers


    
    considerNegative(b) {
        if (this.isNegative) {
            return b === false;
        }
        return b === true;
    }
    
    isEmptyIterable() {
        if (typeof(this.actual[Symbol.iterator]) !== 'function') {
            return false;
        }
        const firstIter = this.actual[Symbol.iterator]().next();
        return firstIter.done;
    }
}