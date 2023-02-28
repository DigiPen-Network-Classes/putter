import { PM } from './pm.js';

// execute all our scripted code in a VM for at least
// some minor improvement in safety. Note that this isn't
// 100% safe...don't run untrusted scripts...
import {NodeVM} from 'vm2'; 


// sandbox is the state that exists between runs
export const sandbox = {};
sandbox.pm = new PM();

export function createVM() {
    return new NodeVM({ 
        console: 'inherit',
        sandbox: sandbox,
        require: { external: true, root: './'}
    });
}