
import axios from 'axios';
import { substituteString, convertHeaders } from './variables.js';
import { PM } from './pm.js';

// chalk prints pretty colors
import chalk from 'chalk';
const log = console.log;
chalk.level = 1;
const error = chalk.redBright;
const warning = chalk.yellow;

// commander does our command-line interface
import {Command} from 'commander';
const program = new Command();

// file system work with promises
import fs from 'fs/promises';

// execute all our scripted code in a VM for at least
// some minor improvement in safety. Note that this isn't
// 100% safe...don't run untrusted scripts...
import {NodeVM} from 'vm2'; 

// sandbox is the state that exists between runs
const sandbox = {};
sandbox.pm = new PM();

function createVM() {
    return new NodeVM({ 
        console: 'inherit',
        sandbox: sandbox,
        require: { external: true, root: './'}
    });
}


program
    .name('post')
    .description('run unit tests for CS261 assignments');

program
    .command('run')
    .argument('<string>', 'file to run')
    .action((filename, options) => {
        log(`processing ${filename}`);
        fs.readFile(filename)
        .then(async data => {
            let postObj = JSON.parse(data);
            log(`Loaded file ${chalk.green(postObj.info.name)}`);
            await doRun(postObj);
        }
        ).catch(err => {
            log(error(`Failed to process input file: ${err}`));            
        });
    });

// given a postman json object, run all the tests in it
async function doRun(postObj) {
    loadVariables(postObj);
    
    for(let folderIdx=0; folderIdx < postObj.item.length; folderIdx++) {
        let folder = postObj.item[folderIdx]; 
        log(`Folder: ${folder.name}`);
        
        for(let itemIdx = 0; itemIdx < folder.item.length; itemIdx++) {
            let item = folder.item[itemIdx];
            log(`Item: ${item.name}`);
            
            await doPreRequestEvent(folder, item);
            
            let response = await doRequest(folder, item);
            
            evaluateTests(folder, item, response);
            // if something failed, then exit
        }
    }
}

// process the 'variable' section, loading some values
// into our sandbox global space
function loadVariables(postObj) {
    console.log(chalk.blue("LOAD VARIABLES"));
    for(let i = 0; i < postObj.variable.length; i++) {
        let kv = postObj.variable[i];
        console.log(chalk.blue(JSON.stringify(kv)));
        sandbox.pm.environment.set(kv.key, kv.value);
    }
    // TODO overrides from command line options here
    
    console.log(chalk.blue("Variables processed"));
}

// execute all the 'prerequest' events found in this item
async function doPreRequestEvent(folder, item) {
    item.event.forEach(async event => {
        if (event.listen != "prerequest") {
            // not the event type we're looking for
            return;
        }
        let script = event.script.exec.join('\n');
        if (script.length > 0) {
            console.log(chalk.yellow("PreRequestEvent Script:"))
            console.log(chalk.yellow(script));    
            console.log(chalk.yellow("--------"));

            console.log(error("about to run pre-request"));
            await createVM().run(script);
            console.log(error("done running pre-request"));
            
            printEnvironment();
        } 
    });
}

function printEnvironment() {
    console.log(chalk.green("Status of Environment:"));
    console.log(chalk.green(`PM environment: `));
    sandbox.pm.environment.forEach((v, k) => {
        console.log(chalk.green(`${k} = ${v}`));
    })
    console.log(chalk.green("-==========-"));
}

// run an HTTP Request against a target, in a sandbox
// keep track of all the results for testing later!
async function doRequest(folder, item) {

    let req = item.request;
    if (req.method.toUpperCase() === "POST") {
        return await doRequestPost(folder, item, req);
//    } else if (req.method.toUpperCase() === "GET") {
        //await doRequestGet(folder, item, req);
    } else {
        // else other types...
        log(error(`Unhandled request type: ${req.method}`));
    }

    // method
    // header
    // body 
    // url 
}

async function doRequestPost(folder, item, req) {
    // build url
    let url = substituteString(req.url.raw, sandbox.pm.environment);
    // build post body
    let body = substituteString(req.body.raw, sandbox.pm.environment);
    // populate headers
    let headers = convertHeaders(req.header);

    // execute and get response
    try {
        return await axios.post(url, body, {
            headers: headers,
            validateStatus: (s) => {
                return s < 500;
            }
        });
    } catch(err) {
        log(error(`POST request failed: ${err}`));
        throw err;
    }
}

async function evaluateTests(folder, item, resp) {
    sandbox.pm.response.actualStatusValue = resp.status;
    sandbox.pm.response.jsonData = resp.data;

    for(let i=0; i < item.event.length; i++) {
        let event = item.event[i];
        if (event.listen !== "test") {
            break;
        }
        let script = event.script.exec.join('\n');
        if (script.length > 0) {
            console.log(chalk.cyan("Test Script:"))
            console.log(chalk.cyan(script));    
            console.log(chalk.cyan("--------"));

            
            await createVM().run(script);
            // evaluate success or failure
            // 
            printEnvironment();
        }
    }
}


program.parse();