const assert = require("assert");


import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

const testTree3a = require("./btrees/testTree3a.xml");
const testTree4  = require("./btrees/testTree4.xml");
const testTree5  = require("./btrees/testTree5.xml");
const testTree9  = require("./btrees/testTree9.xml");
const testTree10 = require("./btrees/testTree10.xml");
const testTree11 = require("./btrees/testTree11.xml");
const testTree12 = require("./btrees/testTree12.xml");
const testTree14 = require("./btrees/testTree14.xml");
const ud1        = require("./btrees/undefinedNode1.xml");



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

test.skip("test path access correct", async function(done) {
/*

0      sequence
0.0    go1
0.1    sequence
0.1.0  stay1
0.1.1  stay2
0.2    go2
0.3    go3

*/

  const expected = {
    '0':     {w:'sequence'},
    '0.0':   {name:'go1'},
    '0.1':   {w:'sequence'},
    '0.1.0': {name:'stay1'},
    '0.1.1': {name:'stay2'},
    '0.2':   {name:'go2'},
    '0.3':   {name:'go3'},
  };

  let dut = this.bt = new AsyncBehaviorTree(testTree3a, blackBoard);

  // loop through each expected
  for(const path in expected) {
    const e = expected[path];
    // split back to an array
    const ps = path.split('.').map(x=>parseInt(x,10));

    // fetch the node
    const got = dut.accessNodeByPath(ps);

    // loop through expected properties (w or name)
    for(const ep in e) {
      // assert that the got node matches what I expect
      expect(got[ep]).toBe(e[ep]);
    }
  }

  done();
});





test("test path access and path correct", async function(done) {

  const expected = {
    '0':       {w:'sequence'},
    '0.0':     {name:'go1'},
    '0.1':     {w:'fallback'},
    '0.1.0':   {w:'sequence'},
    '0.1.0.0': {name:'go2'},
    '0.1.1':   {w:'sequence'},
    '0.1.1.0': {name:'go3'},
    
  };

  let dut = this.bt = new AsyncBehaviorTree(ud1, blackBoard);

  // loop through each expected
  for(const path in expected) {
    const e = expected[path];
    // split back to an array
    const ps = path.split('.').map(x=>parseInt(x,10));

    // fetch the node
    const got = dut.accessNodeByPath(ps);

    // console.log(path, got);
    // loop through expected properties (w or name)
    for(const ep in e) {


      // assert that the got node matches what I expect
      expect(got[ep]).toBe(e[ep]);

      // assert that the node I got has the correct path
      expect(got.path).toBe(path);
    }
  }

  done();
});







test.skip("test path via walk is correct", async function(done) {

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

  dut.walkTree((node)=>{
    console.log(`${node.path}: `, node);
  });


  done();


});




test.skip("path2 v path is correct", async function(done) {

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


  const trees = [
  // testTree3a,
  // testTree4,
  // testTree5,
  // testTree9,
  // testTree10,
  // testTree11,
  // testTree12,
  // testTree14,
  ud1
  ];

  for(const tree of trees) {


    let dut = this.bt = new AsyncBehaviorTree(tree, blackBoard);

    let fail: boolean = false;

    dut.walkTree((node)=>{
      // console.log(`${node.path}: `, node);
      // expect(node.path).toBe(node.path2);
      if( node.path !== node.path2 ) {
        console.log(node);
        fail = true;
      }
    });

    expect(fail).toBe(false);



  }




  done();


});

