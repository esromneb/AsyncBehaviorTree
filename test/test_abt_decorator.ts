const assert = require("assert");




import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
testTree11,
testTree12,
} from "../src/AsyncBehaviorTreeData";



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
}


test("nested sequence and inverter", async function(done) {

  let print: boolean = false;

  const expected = ['go1', 'go2','go3', 'go4','go5', 'go6','go7', 'go8'];

  let expectedStop = {
    '1': ['go1'],
    '3': ['go1','go2','go3'],
    '4': ['go1','go2','go3','go4','go5', 'go6','go7', 'go8'],
  }

  let dut = this.bt = new AsyncBehaviorTree(testTree11, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  blackBoard.called = [];
  fail = {};
  await dut.execute();

  const unmodified = ['go1', 'go2','go3', 'go4'];

  // default should only pass some
  expect(blackBoard.called).toStrictEqual(unmodified);

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




test("force success", async function(done) {

  let print: boolean = false;

  const expected = ['go1', 'go2','go3', 'go4','go5', 'go6','go7', 'go8'];

  let expectedStop = {
    '2': ['go1','go2'],
    '3': ['go1','go2','go3','go4','go5', 'go6','go7', 'go8'],
    '4': ['go1','go2','go3','go4'],
  }

  let dut = this.bt = new AsyncBehaviorTree(testTree12, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  // console.log(blackBoard.called);

  blackBoard.called = [];
  fail = {};
  await dut.execute();

  // const unmodified = ['go1', 'go2','go3', 'go4'];

  // default should only pass some
  expect(blackBoard.called).toStrictEqual(expected);

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





