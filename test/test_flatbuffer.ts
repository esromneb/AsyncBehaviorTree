const assert = require("assert");
const merge = require('deepmerge');



import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
BehaviorTreeFlatBuffer
} from "behavior-tree-flat-buffer";

const testTree3a = require("./btrees/testTree3a.xml");
const testTree5 = require("./btrees/testTree5.xml");
const testTree5a = require("./btrees/testTree5a.xml");
const testTree7 = require("./btrees/testTree7.xml");
const testTree13 = require("./btrees/testTree13.xml");
const testTree14 = require("./btrees/testTree14.xml");
const testTree14a = require("./btrees/testTree14a.xml");
const testTree14b = require("./btrees/testTree14b.xml");
const testTree15 = require("./btrees/testTree15.xml");
const testTree16 = require("./btrees/testTree16.xml");
const testTree16a = require("./btrees/testTree16a.xml");
const testTree16_default = require("./btrees/testTree16_default.xml");


// global single instance of this
let btfb;

// can return a promise, but doesn't have to
beforeAll(() => {
  btfb = new BehaviorTreeFlatBuffer();

  return btfb.start();

  // return initializeCityDatabase();
});



function injectD(dut, id, p: string, n: string, duraton: number): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransitionDuration(id, t[p], t[n], duraton);
}

let adtime = 0;

function injectAD(dut, id, p: string, n: string): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransitionDuration(id, t[p], t[n], adtime);
  adtime += 100;
}






let fail = {};
let blackBoard: any = {
  called: [],
  go1:    ()=>{blackBoard.called.push('go1');     return 'go1'    in fail ? false : true},
  go2:    ()=>{blackBoard.called.push('go2');     return 'go2'    in fail ? false : true},
  go3:    ()=>{blackBoard.called.push('go3');     return 'go3'    in fail ? false : true},
  go4:    ()=>{blackBoard.called.push('go4');     return 'go4'    in fail ? false : true},
  go5:    ()=>{blackBoard.called.push('go5');     return 'go5'    in fail ? false : true},
  go6:    ()=>{blackBoard.called.push('go6');     return 'go6'    in fail ? false : true},
  go7:    ()=>{blackBoard.called.push('go7');     return 'go7'    in fail ? false : true},
  go8:    ()=>{blackBoard.called.push('go8');     return 'go8'    in fail ? false : true},
  stay1:  ()=>{blackBoard.called.push('stay1');   return 'stay1'  in fail ? false : true},
  stay2:  ()=>{blackBoard.called.push('stay2');   return 'stay2'  in fail ? false : true},
  cIName: ()=>{blackBoard.called.push('cIName');  return 'cIName' in fail ? false : true},
  isFull: true,
}

function reset() {
  fail = {};
  blackBoard.called = [];
  blackBoard2.called = [];

  blackBoard.isFull = true;

  blackBoard2.foo = {
    baz: "yes this is baz",
  };
  blackBoard2.baz = "Baz is unnested";
  delete blackBoard2.long;

  blackBoard2.altOutputD = false;
  blackBoard2.altOutputInOnlyA = false;
}



test.skip("test condition", async function(done) {

  let print: boolean = false;

  const expected = ['go1'];

  let dut = this.bt = new AsyncBehaviorTree(testTree13, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  await dut.execute();
  expect(blackBoard.called).toStrictEqual(expected);

  reset();
  blackBoard.isFull = false;
  await dut.execute();
  expect(blackBoard.called).toStrictEqual([]);


  done();

});





let blackBoard2: any = {
  altOutputInOnlyA: false,
  altOutputD: false,
  called: [],
  inOnlyA: (opts: any = {})=>{
    // const opts = merge({frames: 1, stagger:1}, _opts);

    blackBoard2.called.push(['inOnlyA',opts]);

    if( blackBoard2.altOutputInOnlyA ) {
      return undefined;
    }

    let ret = 'inOnlyA' in fail ? false : true;

    return ret;

    // return 
  },
  inOnlyB: (opts: any = {})=>{
    blackBoard2.called.push(['inOnlyB',opts]);

    let ret = 'inOnlyA' in fail ? false : true;

    return ret;
  },
  outOnlyA: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyA',opts]);

    let ret = 'outOnlyA' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should discard outOnlyA'
    };

    return o;
  },
  outOnlyB: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyB',opts]);

    let ret = 'outOnlyB' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should discard outOnlyB'
    };

    return o;
  },
  outOnlyC: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyC',opts]);

    let ret = 'outOnlyC' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyC'
    };

    return o;
  },

  outOnlyD: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyD',opts]);

    let ret = 'outOnlyD' in fail ? false : true;

    let o;
    // FIXME issue #1
    if( blackBoard2.altOutputD ) {
      o = {
        ret: ret,
        out0: 'should keep outOnlyD',
        outB: 'going to B',
        outC: 'going to C',
      };

    } else {
      o = {
        ret: ret,
        out0: 'should keep outOnlyD'
      };
    }

    return o;
  },

  outOnlyE: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyE',opts]);

    let ret = 'outOnlyE' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyE'
    };

    return o;
  },

  outOnlyF: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyF',opts]);

    let ret = 'outOnlyF' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyF'
    };

    return o;
  },

  // do not change these without also changing reset()
  foo: {
    baz: "yes this is baz",
  },
  // do not change these without also changing reset()
  baz: "Baz is unnested",
}



function inject(dut, id, p: string, n: string): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransition(id, t[p], t[n]);


}




test.skip("test wasm", async function(done) {

  if( true ) {
    await btfb.setFilePath('./node3.fbl');

    const actionNodes = [
      'go1',
      'go2',
      'go3',
      'stay1',
      'stay2',
    ];

    btfb.registerActionNodes(actionNodes);

    btfb.parseXML(testTree3a);


    console.log(btfb.treeNodeIds);
    console.log(btfb.children);
  }






  let print: boolean = false;

  // const expected = ['go1'];

  let dut = this.bt = new AsyncBehaviorTree(testTree3a, blackBoard);

  dut.printCall = true;

  // console.log(dut.exe);

  console.log("\n\n");

  dut.walkTree((node)=>{
    console.log(node);

  });


  // reset();
  // await dut.execute();
  // expect(blackBoard.called).toStrictEqual(expected);

  // reset();
  // blackBoard.isFull = false;
  // await dut.execute();
  // expect(blackBoard.called).toStrictEqual([]);


  done();



    // injectAD(btfb, 1, 'idle', 'running');
    // injectAD(btfb, 2, 'idle', 'running');
    // injectAD(btfb, 3, 'idle', 'running');
    // injectAD(btfb, 4, 'idle', 'failure');
    // injectAD(btfb, 4, 'failure', 'idle');
    // injectAD(btfb, 3, 'running', 'failure');
    // injectAD(btfb, 6, 'idle', 'running');
    // injectAD(btfb, 7, 'idle', 'running');



  // done();
});









test.skip("test getActionNodes getConditionNodes", async function(done) {

  {
    let dut = new AsyncBehaviorTree(testTree5, blackBoard);

    let action = dut.getActionNodes().sort();
    expect(action).toEqual(['go1', 'go2', 'go3', 'stay1', 'stay2']);

    // console.log(action);

    let condition = dut.getConditionNodes().sort();
    expect(condition).toEqual([]);
    // console.log(condition);
  }


  {
    let dut = new AsyncBehaviorTree(testTree7, blackBoard);

    let action = dut.getActionNodes().sort();
    expect(action).toEqual(['goClosestR', 'waitFrames']);

    // console.log(action);

    let condition = dut.getConditionNodes().sort();
    expect(condition).toEqual(['isFull']);
    // console.log(condition);
  }



  done();

});



const util = require('util')



test("test some integration", async function(done) {

  const logpath = './node5a.fbl';




  let print: boolean = false;

  // const expected = ['go1'];

  let dut = new AsyncBehaviorTree(testTree5a, blackBoard);

  await dut.setFileLogger(btfb, logpath);

  dut.printCall = true;

  // console.log(dut.exe);

  // console.log(util.inspect(dut.exe, {showHidden: false, depth: null}))



  fail = []
  reset();
  await dut.execute();
  // expect(blackBoard.called).toStrictEqual(expected);

  // reset();
  // blackBoard.isFull = false;
  // await dut.execute();
  // expect(blackBoard.called).toStrictEqual([]);


  done();



    // injectAD(btfb, 1, 'idle', 'running');
    // injectAD(btfb, 2, 'idle', 'running');
    // injectAD(btfb, 3, 'idle', 'running');
    // injectAD(btfb, 4, 'idle', 'failure');
    // injectAD(btfb, 4, 'failure', 'idle');
    // injectAD(btfb, 3, 'running', 'failure');
    // injectAD(btfb, 6, 'idle', 'running');
    // injectAD(btfb, 7, 'idle', 'running');


});











test.skip("test args", async function(done) {

  let print: boolean = false;


  let dut = this.bt = new AsyncBehaviorTree(testTree14, blackBoard2);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  fail['outOnlyA'] = true;
  await dut.execute();




  const expected =[   [ 'inOnlyA', { in0: '' } ],
    [ 'inOnlyB', { in0: 'ice' } ],
    [ 'inOnlyB', { in0: 'foo' } ],
    [ 'inOnlyA', { in0: 'yes this is baz' } ],
  ];

  for(let i = 0; i < 4; i++ ) {
    expect(blackBoard2.called[i]).toStrictEqual(expected[i]);
  }

  expect(blackBoard2.baz).toBe("Baz is unnested");


  reset();
  fail['outOnlyC'] = true;
  await dut.execute();

  expect(blackBoard2.baz).toBe('should keep outOnlyC');



  reset();
  fail['outOnlyD'] = true;
  await dut.execute();

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');



  reset();
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.foo.goo).toBe('should keep outOnlyD');



  reset();
  fail['outOnlyD'] = true;
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.foo.goo).toBe('should keep outOnlyD');

  reset();
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.long.untraveled.path).toBe('should keep outOnlyF');


  done();

});
