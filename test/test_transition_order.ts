import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
BlackboardT05Parent
} from "./helpers/BlackboardT05Parent";
const testT05 = require("./btrees/t05CrossdoorNoSubtree.xml");

const util = require('util');




// copied from test_abt_one nested sequence
test("Test AlwaysFailure", async function(done) {


  let print: boolean = false;


  let helper = new BlackboardT05Parent();

  let dut = this.bt = new AsyncBehaviorTree(testT05, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  helper.reset();


  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }


  // expect(helper.blackBoard.called).toStrictEqual(['go1']);
  // }


  done();

});

