import chalk from 'chalk';
const log = console.log;
chalk.level = 1;
const error = chalk.redBright;
const warning = chalk.yellow;

import {Command} from 'commander';
const program = new Command();

import fs from 'fs/promises';


program
    .name('post')
    .description('run unit tests for CS261 assignments');

program
    .command('run')
    .argument('<string>', 'file to run')
    .action((filename, options) => {
        log(`processing ${filename}`);
        fs.readFile(filename)
        .then(async data=> {
            log('data read');
            let postObj = JSON.parse(data);
            log(`Loaded file ${chalk.green(postObj.info.name)}`);
            await doRun(postObj);
        }
        ).catch(err => {
            log(error(`Failed to process input file: ${err}`));            
        });
    });

async function doRun(postObj) {
    postObj.item.forEach(folder => {
        log(`Folder: ${folder.name}`);
        folder.item.forEach(item => {
            log(`Item: ${item.name}`);
        });
    });
}    


program.parse();