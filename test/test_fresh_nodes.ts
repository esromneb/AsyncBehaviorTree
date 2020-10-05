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
const testRepeatVar = require("./btrees/testRepeatVar.xml");
const testRetry = require("./btrees/testRetry.xml");


const util = require('util');






// copied from test_abt_one nested sequence
test("Test AlwaysFailure", async function(done) {


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




test("Test testForceFailure", async function(done) {

  let print: boolean = false;

  const expected = ['go1','go2','go3'];

  let expectedStop = {
    '1':1,
    '2':2,
    '3':2,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testForceFailure, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;

  for(let stop in expectedStop) {
    helper.reset();
    helper.fail['go'+stop] = true;

    await dut.execute();

    if( print ) {
      console.log('stop', stop, 'called', helper.blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});



test("Test testForceFailure 2", async function(done) {

  let print: boolean = false;

  const expected = ['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'];

  let expectedStop = {
    '1':['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'],
    '2':['go1','go2', 'go4', 'go6', 'go7', 'go8'],
    '3':['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'],
    '4':['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'],
    '5':['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'],
    '6':['go1','go2','go3', 'go4', 'go6'],
    '7':['go1','go2','go3', 'go4', 'go6', 'go7'],
    '8':['go1','go2','go3', 'go4', 'go6', 'go7', 'go8'],
    // '2':2,
    // '3':2,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testForceFailure2, helper.blackBoard);

  // dut.walkTree((node)=>{
  //   console.log(node.path, node,"\n");
  // })

  dut.printCall = false;
  dut.printParse = false;

  for(let stop in expectedStop) {
    helper.reset();
    helper.fail['go'+stop] = false;

    await dut.execute();

    if( print ) {
      console.log('stop', stop, 'called', helper.blackBoard.called);
    }

    let thisExpected = expectedStop[stop];

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});







test("Test testForceSuccess", async function(done) {

  let print: boolean = false;

  const expected = ['go1','go2','go3'];

  let expectedStop = {
    '1':1,
    '2':3,
    '3':3,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testForceSuccess, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;

  for(let stop in expectedStop) {
    helper.reset();
    helper.fail['go'+stop] = true;

    await dut.execute();

    if( print ) {
      console.log('stop', stop, 'called', helper.blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }

  done();
});





test("Test repeat", async function(done) {


  const expected = ['go1','go2','go2','go2','go3'];

  let expectedStop = {
    '1':1,
    '2':2,
    '3':5,
  }

  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testRepeat, helper.blackBoard);

  // console.log(util.inspect(dut.exe,{depth:null,colors:true}));

  // dut.walkTree((node)=>{
  //   console.log(node);
  // })




  let print: boolean = false;
  dut.printCall = false;
  dut.printParse = false;

  for(let stop in expectedStop) {
    helper.reset();
    helper.fail['go'+stop] = true;
    // console.log('--------------', helper.fail);

    await dut.execute();

    if( print ) {
      console.log('stop:', stop, 'called:', helper.blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }

  done();
});




test("Test repeat Var", async function(done) {


  const expected = ['go1','go2','go2','go2','go3'];

  let expectedStop = {
    '1':1,
    '2':2,
    '3':5,
  }

  let helper = new Blackboard1Parent();

  let dut = new AsyncBehaviorTree(testRepeatVar, helper.blackBoard);

  // console.log(util.inspect(dut.exe,{depth:null,colors:true}));




  let print: boolean = false;
  dut.printCall = false;
  dut.printParse = false;

  for(let stop in expectedStop) {
    helper.reset();
    helper.fail['go'+stop] = true;
    // console.log('--------------', helper.fail);

    await dut.execute();

    if( print ) {
      console.log('stop:', stop, 'called:', helper.blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(helper.blackBoard.called).toStrictEqual(thisExpected);
  }

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




test("Test retry until successful", async function(done) {


  for(let i = 0; i < 5; i++ ) {

    let helper = new Blackboard1Parent();

    debugger;
    let dut = new AsyncBehaviorTree(testRetry, helper.blackBoard);


    let called = 0;

    helper.blackBoard.go1 = ()=>{
      helper.blackBoard.called.push('go1');

      if( called >= i ) {
        return true;
      }

      called++;

      // return true;
      return false;
    };


    let print: boolean = false;
    dut.printCall = false;
    dut.printParse = false;

    // if( i == 3 ) {
    //   dut.printCall = true;
    // }

    helper.reset();

    await dut.execute();

    if( print ) {
      console.log('called:', helper.blackBoard.called);
    }

    switch(i) {
      case 0:
        expect(helper.blackBoard.called).toStrictEqual(['go1','go2','go3']);
        break;
      case 1:
        expect(helper.blackBoard.called).toStrictEqual(['go1','go1','go2','go3']);
        break;
      case 2:
        expect(helper.blackBoard.called).toStrictEqual(['go1','go1','go1','go2','go3']);
        break;
      case 3:
      case 4:
        expect(helper.blackBoard.called).toStrictEqual(['go1','go1','go1']);
        break;
    }

  }



  done();
});

