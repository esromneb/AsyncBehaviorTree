const assert = require("assert");
// const merge = require('deepmerge');



import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";


const undefinedNode1 = require("./btrees/undefinedNode1.xml");
const undefinedNode2 = require("./btrees/undefinedNode2.xml");
const undefinedNode2a = require("./btrees/undefinedNode2a.xml");
const undefinedNode3 = require("./btrees/undefinedNode3.xml");
const undefinedNode3a = require("./btrees/undefinedNode3a.xml");
const undefinedNode4 = require("./btrees/undefinedNode4.xml");



let fail = {};
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
  isFull: true,
}

function reset() {
  fail = {};
  blackBoard.called = [];
  // blackBoard2.called = [];
  // blackBoard3.called = [];

  blackBoard.isFull = true;

  // blackBoard2.foo = {
  //   baz: "yes this is baz",
  // };
  // blackBoard2.baz = "Baz is unnested";

  // blackBoard3.foo = 'default string';
}



test("test undefined node 1", async function(done) {

  let print: boolean = false;

  const expected = ['go1', 'go2', 'go3'];

  let expectedStop = {
    '1':1,
    '2':3,
    '3':3,
  }


  let dut = this.bt = new AsyncBehaviorTree(undefinedNode1, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  await dut.execute();

  if( print ) {
    console.log(blackBoard.called);
  }
  expect(blackBoard.called).toStrictEqual(expected);

   // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we slice the expected function according to the value of the expectedStop and thats
  // what we should get

  for(let stop in expectedStop) {
    reset();
    fail['go'+stop] = true;

    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(blackBoard.called).toStrictEqual(thisExpected);
  }

  done();

});



test("test undefined node 2 and 2a", async function(done) {

  let print: boolean = false;

  const expected = ['go1'];

  const expectedStop = {
    '1':1,
    // '2':2,
    // '3':3,
  }

  const trees = [undefinedNode2,undefinedNode2a];

  for( let tree in trees ) {

    const dut = this.bt = new AsyncBehaviorTree(undefinedNode2, blackBoard);

    dut.printCall = false;
    dut.printParse = false;


    reset();
    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }
    expect(blackBoard.called).toStrictEqual(expected);

     // we have our expected order of called functions above
    // we used the expectedStop to mark one of the functions as failing
    // then when we run the behavor tree, we check the output of the called functions
    // we slice the expected function according to the value of the expectedStop and thats
    // what we should get

    for(let stop in expectedStop) {
      reset();
      fail['go'+stop] = true;

      await dut.execute();

      if( print ) {
        console.log(blackBoard.called);
      }

      let thisExpected = expected.slice(0,expectedStop[stop]);

      expect(blackBoard.called).toStrictEqual(thisExpected);
    }
  }

  done();

});




test("test undefined node 3 and 3a", async function(done) {

  let print: boolean = false;

  const expected = ['go1', 'go2'];

  const expectedStop = {
    '1':1,
  }

  const trees = [undefinedNode2,undefinedNode2a];

  for( let tree in trees ) {

    const dut = this.bt = new AsyncBehaviorTree(undefinedNode3, blackBoard);

    dut.printCall = false;
    dut.printParse = false;


    reset();
    await dut.execute();

    // console.log(blackBoard.called);
    expect(blackBoard.called).toStrictEqual(expected);

     // we have our expected order of called functions above
    // we used the expectedStop to mark one of the functions as failing
    // then when we run the behavor tree, we check the output of the called functions
    // we slice the expected function according to the value of the expectedStop and thats
    // what we should get

    for(let stop in expectedStop) {
      reset();
      fail['go'+stop] = true;

      await dut.execute();

      if( print ) {
        console.log(blackBoard.called);
      }

      let thisExpected = expected.slice(0,expectedStop[stop]);

      expect(blackBoard.called).toStrictEqual(thisExpected);
    }
  }

  done();

});


test("test undefined node 4", async function(done) {

  let print: boolean = false;

  const expected = ['go1', 'go2', 'go3', 'go4', 'go5', 'go6', 'go7'];

  let expectedStop = {
    '1':1,
    '2':2,
    '3':7,
    '4':7,
    '5':7,
    '6':6,
    '7':7,
    // '2':2,
    // '3':3,
  }


  let dut = this.bt = new AsyncBehaviorTree(undefinedNode4, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  await dut.execute();

  // console.log(blackBoard.called);
  expect(blackBoard.called).toStrictEqual(expected);

   // we have our expected order of called functions above
  // we used the expectedStop to mark one of the functions as failing
  // then when we run the behavor tree, we check the output of the called functions
  // we slice the expected function according to the value of the expectedStop and thats
  // what we should get

  for(let stop in expectedStop) {
    reset();
    fail['go'+stop] = true;

    await dut.execute();

    if( print ) {
      console.log(blackBoard.called);
    }

    let thisExpected = expected.slice(0,expectedStop[stop]);

    expect(blackBoard.called).toStrictEqual(thisExpected);
  }

  done();

});
