import { PM } from './pm.js';

// execute all our scripted code in a VM for at least
// some minor improvement in safety. Note that this isn't
// 100% safe...don't run untrusted scripts...
import {NodeVM} from 'vm2'; 


// sandbox is the state that exists between runs
export const sandbox = {};
sandbox.pm = new PM();
//sandbox.sleep = async (ms) => { return new Promise(resolve => { setTimeout(resolve, ms)}) };
sandbox.sleep = (ms) => { 
    let waitTill = new Date(new Date().getTime() + ms);
    while (waitTill > new Date()) {}
};
sandbox.setTimeout = (fn, ms) => { sandbox.sleep(ms); fn(); }


let x = `let waitTill = new Date(new Date().getTime() + 10 * 1000);
while (waitTill > new Date()) {}`;


export function createVM() {
    return new NodeVM({ 
        console: 'inherit',
        sandbox: sandbox,
        require: { external: true, root: './'}
    });
}