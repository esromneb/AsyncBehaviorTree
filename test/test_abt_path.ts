const assert = require("assert");


import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

const testTree3a = require("./btrees/testTree3a.xml");


let fail = {};
let blackBoard: any = {
  called: [],
  go1:   ()=>{blackBoard.called.push('go1');   return 'go1'   in fail ? false : true},
  go2:   ()=>{blackBoard.called.push('go2');   return 'go2'   in fail ? false : true},
  go3:   ()=>{blackBoard.called.push('go3');   return 'go3'   in fail ? false : true},
  go4:   ()=>{blackBoard.called.push('go4');   return 'go4'   in fail ? false : true},
  go5:   ()=>{blackBoard.called.push('go5');   return 'go5'   in fail ? false : true},
  go6:   ()=>{blackBoard.called.push('go6');   return 'go6'   in fail ? false : true},
  go7:   ()=>{blackBoard.called.push('go7');   return 'go7'   in fail ? false : true},
  go8:   ()=>{blackBoard.called.push('go8');   return 'go8'   in fail ? false : true},
  stay1: ()=>{blackBoard.called.push('stay1'); return 'stay1' in fail ? false : true},
  stay2: ()=>{blackBoard.called.push('stay2'); return 'stay2' in fail ? false : true},
  isFull: true,
}

function reset() {
  fail = {};
  blackBoard.called = [];
  blackBoard.isFull = true;
}



test("test path is correct", async function(done) {


  /*


0      sequence
0.0    go1
0.1    sequence
0.1.0  stay1
0.1.1  stay2
0.2    go2
0.3    go3


  */

  let print: boolean = false;

  // const expected = ['go1'];

  let dut = this.bt = new AsyncBehaviorTree(testTree3a, blackBoard);

  dut.printCall = true;

  // console.log(dut.exe);

  console.log("\n\n");

  // dut.writePath();


  dut.walkTree((node)=>{
    console.log(`${node.path}: ${node.name}`, node);

  });




  done();


});

