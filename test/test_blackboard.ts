import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
Blackboard1Parent
} from "./helpers/Blackboard1Parent";


const testSetBlackboard1 = require("./btrees/testSetBlackboard1.xml");
const testSetBlackboard2 = require("./btrees/testSetBlackboard2.xml");


const util = require('util');






test("Test testForceFailure 1", async function(done) {

  let print: boolean = false;

  const expected = ['go1','go2'];

  let expectedStop = {
    '1':1,
    '2':2,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testSetBlackboard1, helper.blackBoard);

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


    if( stop === '1' ) {
      expect(helper.blackBoard.valueA).toBe(0);
    }

    if( stop === '2' ) {
      expect(helper.blackBoard.valueA).toBe('8');
    }

  }


  done();

});





test("Test testForceFailure 2", async function(done) {

  let print: boolean = false;

  const expected = ['go1','go2'];

  let expectedStop = {
    '1':1,
    '2':2,
  }

  let helper = new Blackboard1Parent();

  let dut = this.bt = new AsyncBehaviorTree(testSetBlackboard2, helper.blackBoard);

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


    if( stop === '1' ) {
      expect(helper.blackBoard.valueA).toBe(0);
    }

    if( stop === '2' ) {
      expect(helper.blackBoard.valueA).toBe(1);
    }

  }


  done();

});





