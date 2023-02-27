
import axios from 'axios';


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
sandbox.pm = {};
sandbox.pm.environment = new Map();

const vm = new NodeVM({ 
    console: 'inherit',
    sandbox: sandbox,
    require: { external: true, root: './'}
});

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

    // just debugging stuff
    program
        .command('try')
        .action(async (options)=> {

            let script = `
            var digits = '' + Math.floor((Math.random() * 100000));
            console.log('digits ' + digits);
            pm.environment.set("testUser", "user" + digits);
            pm.environment.set("testPassword", "password" + digits);
            pm.environment.set("testAvatar", "avi" + digits);
            return pm;
            `;
            await vm.run(script, 's.js');
            log(error(JSON.stringify(sandbox)));
            log(sandbox.pm.environment.get('testUser'));
        });

// given a postman json object, run all the tests in it
function doRun(postObj) {
    doVariable(postObj);
    
    postObj.item.forEach(folder => {
        log(`Folder: ${folder.name}`);
        folder.item.forEach(item => {
            log(`Item: ${item.name}`);
            doPreRequestEvent(folder, item);
            
            doRequest(folder, item);
        });
    });
}

// process the 'variable' section, loading some values
// into our sandbox global space
function doVariable(postObj) {
    postObj.variable.forEach(kv => {
        sandbox.pm.environment.set(kv.key, kv.value);
    });
    // TODO overrides from command line options here
    
    console.log(chalk.blue("Variables processed"));
}

// execute all the 'prerequest' events found in this item
function doPreRequestEvent(folder, item) {
    item.event.forEach(event => {
        if (event.listen != "prerequest") {
            // not the event type we're looking for
            return;
        }
        let script = event.script.exec.join('\n');
        if (script.length > 0) {
            console.log(chalk.yellow("PreRequestEvent Script:"))
            console.log(chalk.yellow(script));    
            console.log(chalk.yellow("--------"));
            vm.run(script);
        }
    });
}

// run an HTTP Request against a target, in a sandbox
// keep track of all the results for testing later!
async function doRequest(folder, item) {

    let req = item.request;
    if (req.method.toUpperCase() === "POST") {
        await doRequestPost(folder, item, req);
    } else if (req.method.toUpperCase() === "GET") {
        await doRequestGet(folder, item, req);
    } else {
        // else other types...
        log(error(`Unhandled request type: ${req.method}`));
    }

    // method
    // header
    // body 
    // url 
}

program.parse();