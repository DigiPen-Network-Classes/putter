import { createVM } from './vm.js'

test('timeout test', async ()=> {
        let vm = createVM();
        console.log("start");
        let x = `console.log('feeling sleepy'); sleep(500); console.log('finished sleeping');`;
        await vm.run(x);
        console.log("done.")
});

