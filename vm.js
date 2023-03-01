import { PM } from './pm.js';

// execute all our scripted code in a VM for at least
// some minor improvement in safety. Note that this isn't
// 100% safe...don't run untrusted scripts...
import {NodeVM} from 'vm2'; 

// sandbox is the state that exists between runs
export const sandbox = {};
sandbox.pm = new PM();

// provide our own sleep function that busy-loops,
// so that the evaluator actually stops for some amount of time.
// note that this isn't a high-performance timer or anything, and
// isn't going to be completely 100% accurate for sleeping 'ms'
sandbox.sleep = (ms) => { 
    console.log(`[sleeping for ${ms} milliseconds]`);
    let waitTill = new Date(new Date().getTime() + ms);
    while (waitTill > new Date()) {}
};

// our implementation of setTimeout() which basically fakes
// everything, using our fake sandbox sleep function too.
sandbox.setTimeout = (fn, ms) => { sandbox.sleep(ms); fn(); }

// create a new VM with appropriate settings
// Note that this is nowhere near guaranteed to be safe!
// do not run unknown scripts on your system!
export function createVM() {
    return new NodeVM({ 
        console: 'inherit',
        sandbox: sandbox,
        require: { external: true, root: './'}
    });
}