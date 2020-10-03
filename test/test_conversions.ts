import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
Blackboard1Parent
} from "./helpers/Blackboard1Parent";

const testFail = require("./btrees/testAlwaysFail.xml");
// const util = require('util');



// copied from test_abt_one nested sequence
test("Test conv", async function(done) {


  let print: boolean = false;


  let helper = new Blackboard1Parent();

  let ws = [];

  let warning = (msg) => {
    ws.push(msg);
  };

  let dut = new AsyncBehaviorTree(testFail, helper.blackBoard, warning);

  dut.printCall = false;
  dut.printParse = false;


  let a = dut.detectAndLoadBraceValues('${valueL}');

  let b = dut.detectAndLoadBraceValues('${valueA:s}');

  let c = dut.detectAndLoadBraceValues('${valueL:f}');

  let d = dut.detectAndLoadBraceValues('${valueA}');

  expect(ws.length).toBe(0);

  let f = dut.detectAndLoadBraceValues('${valueL:notfound}');

  expect(ws.length).toBe(1);


  expect(b).toBe(a);
  expect(c).toBe(d);
  expect(a).toBe(f);


  done();
});



test("Test register", async function(done) {


  let print: boolean = false;


  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testFail, helper.blackBoard);

  dut.registerTypeConversion('ben', (tout, vin, is)=>{
    debugger;
    if( is.boolean(vin) ) {
      return 'bool';
    }
    if( is.number(vin) ) {
      return 'num';
    }
    return 'other';

  });

  dut.printCall = false;
  dut.printParse = false;

  let sa = '${isFull:ben}';
  let a = dut.detectAndLoadBraceValues(sa);

  let sb  = '${valueA:ben}';
  let b = dut.detectAndLoadBraceValues(sb);

  let sc  = '${valueJ:ben}';
  let c = dut.detectAndLoadBraceValues(sc);

  expect(a).toBe('bool');


  expect(b).toBe('num');
  expect(c).toBe('other');


  done();
});





// copied from test_abt_one nested sequence
test("Test write conversion", async function(done) {


  let print: boolean = false;


  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testFail, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let a = dut.detectAndStoreBraceValues('${valueA:s}', 0);
  expect(a).toBe(true);
  expect(helper.blackBoard.valueA).toBe('0');

  let b = dut.detectAndStoreBraceValues('${valueA:f}', '1');

  expect(b).toBe(true);
  expect(helper.blackBoard.valueA).toBe(1);

  done();
});
