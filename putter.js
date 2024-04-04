// The Main file for this project.
// Uses Commander to parse command lines and figure out what to do.
// Basic usage: given a postman .json file, parse out only the bits
// we actually used in CS 261 and execute them, recording passes and fails.

import axios from 'axios';
import http from 'http';

// file system work with promises
import fs from 'fs/promises';

import { substituteString, convertHeaders } from './variables.js';

import { createVM, sandbox } from './vm.js';


// chalk prints pretty colors for console
import chalk from 'chalk';
chalk.level = 1; // keep it simple
// helper functions
const log = console.log;
const error = chalk.redBright;
const warning = chalk.yellow;
const success = chalk.greenBright;

// commander does our command-line interface
import {Command} from 'commander';
const program = new Command();
let verboseMode = false;
let addressOverride = undefined;
let httpsOverride = false;
let portOverride = undefined;

async function getVersion() {
    try {
        const packageJSON = JSON.parse(await fs.readFile('./package.json'));
        return packageJSON.version;
    } catch(e) {
        console.log(`Failed to read packageJSON: ${e}`);
        return "error";
    }
}


program
    .name('putter')
    .version(await getVersion())
    .description('run unit tests for CS261 assignments');

program
    .command('run')
    .argument('<string>', 'file to run')
    .option('--verbose', 'verbose output')
    .option('--address <value>', 'override URL address')
    .option('--port <value>', 'override URL port')
    .option('--https', 'use https')
    .action((filename, options) => {
        verboseMode = options.verbose;
        if (verboseMode) {
            log(error("VERBOSE MODE!"));
        }
        if (options.address) {
            addressOverride = options.address;
            log(error(`Overriding Address to be ${addressOverride}`));
        }
        httpsOverride = options.https;
        if (httpsOverride) {
            log(error("Forcing HTTPS instead of HTTP"));
        }
        portOverride = options.port;
        if (portOverride) {
            log(error(`Forcing Port ${portOverride} instead of default`));
        }
        log(`processing ${filename}`);
        fs.readFile(filename)
            .then(async data => {
                let postObj = JSON.parse(data);
                log(`Loaded file ${chalk.green(postObj.info.name)}`);
                await doRun(postObj);
            })
            .catch(err => {
                log(error(`Failed to process input file: ${err}\n${err.stack}`));
                process.exit(1);
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
            process.stdout.write(`\tItem: ${item.name}...`);
            
            await doPreRequestEvent(folder, item);
            
            let response = await doRequest(folder, item);
            
            evaluateTests(folder, item, response);
            log(success("passed!"));
        } 
    }
    // if we're here, we were successful!
    log(success(`Test run successful! Ran ${sandbox.pm.testCounter} tests.`));
}

// process the 'variable' section, loading some values
// into our sandbox global space
function loadVariables(postObj) {
    log("Loading Variables...");
    for(let i = 0; i < postObj.variable.length; i++) {
        let kv = postObj.variable[i];
        if (verboseMode) {
            console.log(chalk.blue(JSON.stringify(kv)));
        }
        sandbox.pm.environment.set(kv.key, kv.value);
    }

    // TODO overrides from command line options here
    if (addressOverride) {
        log(`Setting {{address}} to ${addressOverride}`);
        sandbox.pm.environment.set("address", addressOverride);
    }
    if (portOverride) {
        log(`Setting port to ${portOverride}`);
        sandbox.pm.environment.set("port", portOverride);
    }
    
    log("Variables processed");
}

// execute all the 'prerequest' events found in this item
async function doPreRequestEvent(folder, item) {
    for (let i=0; i < item.event.length; i++) {
        let event = item.event[i];
        
        if (event.listen != "prerequest") {
            // not the event type we're looking for
            continue;
        }
        let script = event.script.exec.join('\n');
        if (script.length > 0) {
            
            if (verboseMode) {
                log(warning("PreRequestEvent Script:"))
                log(warning(script));    
                log(warning("--------"));
                log(warning("about to run pre-request"));
            }
            
            // runs the event code:
            await createVM().run(script);

            if (verboseMode) {
                log(warning("done running pre-request"));
                printEnvironment();
            }
        } 
    }
}

function printEnvironment() {
    log(success("Status of Environment:"));
    sandbox.pm.environment.forEach((v, k) => {
        log(success(`${k} = ${v}`));
    })
    log(success("-==========-"));
}

// run an HTTP Request against a target, in a sandbox
// keep track of all the results for testing later!
async function doRequest(folder, item) {
    let req = item.request;
    // build url
    let url = req.url.raw;
    if (httpsOverride) {
        url = url.replace("http://", "https://")
    }
    url = substituteString(url, sandbox.pm.environment);
    if (verboseMode) {
        console.log(`request url is ${url}`);
    }
    // build post body?
    let body = {};
    if (req.body) {
        body = substituteString(req.body.raw, sandbox.pm.environment);
    }
    // populate headers
    let headers = convertHeaders(req.header);

    // execute and get response
    try {
        return await axios({
            method: req.method,
            url: url,
            data: body,
            headers: headers,
            validateStatus: (s) => {
                return s < 500; // 5xx errors will throw an error and bail on the whole thing
            },
            httpAgent: new http.Agent({ keepAlive: false })
        });
    } catch(err) {
        log(error(`${req.method} request to ${url} failed: ${err}`));
        process.exit(1);
    }
}

async function evaluateTests(folder, item, resp) {
    
    // fill in some values in our pm object so that the test script
    // can use them when evaluating its code
    sandbox.pm.response.actualStatusValue = resp.status;
    sandbox.pm.response.jsonData = resp.data;
    // so, this is sorta lame: some of the original postman scripts
    // convert json string to object explicitly, ..but axios already
    // does that. So, we give those scripts a json string, which will
    // be turned back into another object. /shrug
    // Basically, this is to avoid having to make ANY changes to the
    // original postman files, so that I can compare the results from
    // postman vs. this program without any changes.
    sandbox.responseBody = JSON.stringify(resp.data);

    for(let i=0; i < item.event.length; i++) {
        let event = item.event[i];
        if (event.listen !== "test") {
            continue;
        }
        let script = event.script.exec.join('\n');
        if (script.length > 0) {
            
            if (verboseMode) {
                console.log(chalk.cyan("Test Script:"))
                console.log(chalk.cyan(script));    
                console.log(chalk.cyan("--------"));
            }
            
            try {
                await createVM().run(script);
            } catch(err) {
                printEnvironment();
                log(error(`Test "${folder.name} - ${item.name}": tests failed! Quitting!`));
                log(error(err));
                log(error(`Ran ${sandbox.pm.testCounter} tests, with errors`));
                process.exit(1);
            }
        }
    }
}

// execute
program.parse();