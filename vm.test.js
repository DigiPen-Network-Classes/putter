import { createVM } from './vm.js'

test('timeout test', async ()=> {
    let vm = createVM();
    console.log("start");
            //let x = "setTimeout(()=> { console.log('timeout happened')}, 5000);";
//            let x = "await new Promise(resolve => setTimeout(resolve, 5000));"
            //await sandbox.sleep(1000);
            //let result = await vm.run("(async () => { await sleep(5000); })()");
            //
//            let x = "for (let i=0; i < 100000; i++) { if (i % 100 === 0) console.log(i); }";
//            let result = await vm.run("(async () => { await sleep(5000); })()");

//            let x = `let waitTill = new Date(new Date().getTime() + 10 * 1000);
//            while (waitTill > new Date()) {}`;

            let x = `sleep(10000)`;

            let result = await vm.run(x);
            console.log(result);
            console.log("done.")
});

