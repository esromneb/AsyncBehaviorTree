const assert = require("assert");




import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

const testTree9 = require("./btrees/testTree9.xml");
const testTree10 = require("./btrees/testTree10.xml");
const testTree11 = require("./btrees/testTree11.xml");



test("nested sequence", async function(done) {

  let fail = {};

  let print: boolean = false;


  let blackBoard: any = {
    called: [],
    go1: ()=>{blackBoard.called.push('go1'); return 'go1' in fail ? false : true},
    go2: ()=>{blackBoard.called.push('go2'); return 'go2' in fail ? false : true},
    go3: ()=>{blackBoard.called.push('go3'); return 'go3' in fail ? false : true},
    go4: ()=>{blackBoard.called.push('go4'); return 'go4' in fail ? false : true},
    go5: ()=>{blackBoard.called.push('go5'); return 'go5' in fail ? false : true},
    go6: ()=>{blackBoard.called.push('go6'); return 'go6' in fail ? false : true},
    go7: ()=>{blackBoard.called.push('go7'); return 'go7' in fail ? false : true},
    go8: ()=>{blackBoard.called.push('go8'); return 'go8' in fail ? false : true},
  }

  // console.log(testTree9);

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

  let dut = this.bt = new AsyncBehaviorTree(testTree10, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  blackBoard.called = [];
  await dut.execute();

  // default should call all
  expect(blackBoard.called).toStrictEqual(expected);

  // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we slice the expected function according to the value of the expectedStop and thats
  // what we should get

  for(let stop in expectedStop) {
    fail = {};
    fail['go'+stop] = true;

    blackBoard.called = [];
    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});




test("nested sequence destroy", async function(done) {
  let dut;

  let fail = {};

  let print: boolean = false;

  let hook = (v?: any) => {
    if( v ) {
      dut.destroy();
    }
  };


  let blackBoard: any = {
    called: [],
    go1: ()=>{blackBoard.called.push('go1'); hook(    ); return 'go1' in fail ? false : true},
    go2: ()=>{blackBoard.called.push('go2'); hook(    ); return 'go2' in fail ? false : true},
    go3: ()=>{blackBoard.called.push('go3'); hook(true); return 'go3' in fail ? false : true},
    go4: ()=>{blackBoard.called.push('go4'); hook(    ); return 'go4' in fail ? false : true},
    go5: ()=>{blackBoard.called.push('go5'); hook(    ); return 'go5' in fail ? false : true},
    go6: ()=>{blackBoard.called.push('go6'); hook(    ); return 'go6' in fail ? false : true},
    go7: ()=>{blackBoard.called.push('go7'); hook(    ); return 'go7' in fail ? false : true},
    go8: ()=>{blackBoard.called.push('go8'); hook(    ); return 'go8' in fail ? false : true},
  }

  // console.log(testTree9);

  const expected = ['go1', 'go2', 'go3', 'go4','go5', 'go6','go7', 'go8'];
  const expected2 = ['go1', 'go2', 'go3'];


  dut = this.bt = new AsyncBehaviorTree(testTree10, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  blackBoard.called = [];
  await dut.execute();

  // default should call all
  expect(blackBoard.called).toStrictEqual(expected2);



  let didThrow: boolean = false;

  try {
    await dut.execute();
  } catch( e ) {
    didThrow = true;;
  }

  expect(didThrow).toBe(true);




  done();


  return;



});







// an old test, not very good
// this is because I misunderstood fallback behavior from the VERY beginning
// go1 will skip testing the rest of the tree
test("nested sequence and fallback", async function(done) {

  let fail = {};

  let print: boolean = false;


  let blackBoard: any = {
    called: [],
    go1: ()=>{blackBoard.called.push('go1'); return 'go1' in fail ? false : true},
    go2: ()=>{blackBoard.called.push('go2'); return 'go2' in fail ? false : true},
    go3: ()=>{blackBoard.called.push('go3'); return 'go3' in fail ? false : true},
    go4: ()=>{blackBoard.called.push('go4'); return 'go4' in fail ? false : true},
    go5: ()=>{blackBoard.called.push('go5'); return 'go5' in fail ? false : true},
    go6: ()=>{blackBoard.called.push('go6'); return 'go6' in fail ? false : true},
    go7: ()=>{blackBoard.called.push('go7'); return 'go7' in fail ? false : true},
    go8: ()=>{blackBoard.called.push('go8'); return 'go8' in fail ? false : true},
  }

  // console.log(testTree9);

  const expected = ['go1', 'go2','go3', 'go4','go5', 'go6','go7', 'go8'];



  let expectedStop = {
    '1': ['go1', 'go2', 'go3', 'go6'],
    '2': ['go1'],
    '3': ['go1'],
    '4': ['go1'],
    '5': ['go1'],
    '6': ['go1'],
    '7': ['go1'],
    '8': ['go1'],
  }

  let dut = this.bt = new AsyncBehaviorTree(testTree9, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  if( false ) {
    blackBoard.called = [];
    await dut.execute();

    // default should call all
    expect(blackBoard.called).toStrictEqual(expected);
  }

  // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we compare against what we expect

  for(let stop in expectedStop) {
    fail = {};
    fail['go'+stop] = true;

    blackBoard.called = [];
    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }

    let thisExpected = expectedStop[stop];

    expect(blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});




// same as test above but we always fail go1
// this is because I misunderstood fallback behavior from the VERY beginning
// thus testTree9 is a bad test as go1 can always succeed and skip testing the rest of the tree
test("nested sequence and fallback again", async function(done) {

  let fail = {};

  let print: boolean = false;


  let blackBoard: any = {
    called: [],
    go1: ()=>{blackBoard.called.push('go1'); return 'go1' in fail ? false : true},
    go2: ()=>{blackBoard.called.push('go2'); return 'go2' in fail ? false : true},
    go3: ()=>{blackBoard.called.push('go3'); return 'go3' in fail ? false : true},
    go4: ()=>{blackBoard.called.push('go4'); return 'go4' in fail ? false : true},
    go5: ()=>{blackBoard.called.push('go5'); return 'go5' in fail ? false : true},
    go6: ()=>{blackBoard.called.push('go6'); return 'go6' in fail ? false : true},
    go7: ()=>{blackBoard.called.push('go7'); return 'go7' in fail ? false : true},
    go8: ()=>{blackBoard.called.push('go8'); return 'go8' in fail ? false : true},
  }

  // console.log(testTree9);

  const expected = ['go1', 'go2','go3', 'go4','go5', 'go6','go7', 'go8'];



  let expectedStop = {
    '1': ['go1', 'go2', 'go3', 'go6'],
    '2': ['go1', 'go2', 'go7'],
    '3': ['go1', 'go2', 'go3', 'go4', 'go6'],
    '4': ['go1', 'go2', 'go3', 'go6'],
    '5': ['go1', 'go2', 'go3', 'go6'],
    '6': ['go1', 'go2', 'go3', 'go6', 'go7'],
    '7': ['go1', 'go2', 'go3', 'go6'],
    '8': ['go1', 'go2', 'go3', 'go6'],
  }

  let dut = this.bt = new AsyncBehaviorTree(testTree9, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  if( false ) {
    blackBoard.called = [];
    await dut.execute();

    // default should call all
    expect(blackBoard.called).toStrictEqual(expected);
  }

  // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we compare against what we expect


  for(let stop in expectedStop) {
    fail = {};
    fail['go1'] = true;
    fail['go'+stop] = true;

    blackBoard.called = [];
    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }

    let thisExpected = expectedStop[stop];

    expect(blackBoard.called).toStrictEqual(thisExpected);
  }


  done();

});
