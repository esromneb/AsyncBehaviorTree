import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
Blackboard1Parent
} from "./helpers/Blackboard1Parent";

const testTree5 = require("./btrees/testTree5.xml");
const testTree10 = require("./btrees/testTree10.xml");
const testFail = require("./btrees/testAlwaysFail.xml");
const testSuccess = require("./btrees/testAlwaysSuccess.xml");
const testForceFailure = require("./btrees/testForceFailure1.xml");
const testForceFailure2 = require("./btrees/testForceFailure2.xml");
const testForceSuccess = require("./btrees/testForceSuccess.xml");
const testRepeat = require("./btrees/testRepeat.xml");


const util = require('util');






// copied from test_abt_one nested sequence
test("Test conv", async function(done) {


  let print: boolean = false;


  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testFail, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let a = dut.detectAndLoadBraceValues('${valueL}');

  let b = dut.detectAndLoadBraceValues('${valueA:s}');

  let c = dut.detectAndLoadBraceValues('${valueL:f}');

  let d = dut.detectAndLoadBraceValues('${valueA}');

  let f = dut.detectAndLoadBraceValues('${valueL:notfound}');

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

  // console.log(a);
  // console.log(b);

  expect(b).toBe('num');
  expect(c).toBe('other');


  done();

});

