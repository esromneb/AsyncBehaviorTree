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
const testForceFailure = require("./btrees/testForceFailure.xml");









// copied from test_abt_one nested sequence
test("Test AlwaysFailure", async function(done) {

  let fail = {};

  let print: boolean = false;


  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testFail, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  helper.reset();


  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }


  expect(helper.blackBoard.called).toStrictEqual(['go1']);
  // }


  done();

});


test("Test AlwaysSuccess", async function(done) {

  let fail = {};

  let print: boolean = false;


  // const expected = ['go1'];


  let expectedStop = {
    '1':1,
    '2':2,
    '3':3,
    '4':4,
    '5':5,
    '6':6,
    '7':7,
    '8':8,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testSuccess, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  helper.reset();


  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }

    // let thisExpected = expected.slice(0,expectedStop[stop]);

  expect(helper.blackBoard.called).toStrictEqual(['go1','go2']);
  // }


  done();

});




test.skip("Test testForceFailure", async function(done) {

  let fail = {};

  let print: boolean = false;


  // const expected = ['go1'];


  let expectedStop = {
    '1':1,
    '2':2,
    '3':3,
    '4':4,
    '5':5,
    '6':6,
    '7':7,
    '8':8,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testForceFailure, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  helper.reset();


  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }

    // let thisExpected = expected.slice(0,expectedStop[stop]);

  expect(helper.blackBoard.called).toStrictEqual(['go1','go2']);
  // }


  done();

});





// copied from test_abt_one nested sequence
test("Test Helper works ", async function(done) {

  let fail = {};

  let print: boolean = false;


  const expected = ['go1', 'go2','go3', 'go4','go5', 'go6','go7', 'go8'];


  let expectedStop = {
    '1':1,
    '2':2,
    '3':3,
    '4':4,
    '5':5,
    '6':6,
    '7':7,
    '8':8,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testTree10, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  helper.reset();

  await dut.execute();

  // default should call all
  expect(helper.blackBoard.called).toStrictEqual(expected);

  // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we slice the expected function according to the value of the expectedStop and thats
  // what we should get

  for(let stop in expectedStop) {
    helper.reset();
    
    helper.fail['go'+stop] = true;

    helper.blackBoard.called = [];
    await dut.execute();

    if( print ) {
      console.log('called', helper.blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});




// test("test zmq integration", async function(done) {

//   const logpath = './node5b.fbl';


//   let zut = new BehaviorTreeZmq();


//   let print: boolean = false;

//   // const expected = ['go1'];

//   let dut = new AsyncBehaviorTree(testTree5b, blackBoard);

//   await dut.setZmqLogger(btfb, zut);

//   await zut.run();

//   // await dut.setFileLogger(btfb, logpath);

//   dut.printCall = true;

//   // console.log(dut.exe);

//   // console.log(util.inspect(dut.exe, {showHidden: false, depth: null}))



//   reset();

//   fail = []
//   blackBoard.isFull = false;

//   while(1) {
//     await dut.execute();
//   }


//   setTimeout(()=>{

//     done();
//   }, runServerFor-1000);


// });
